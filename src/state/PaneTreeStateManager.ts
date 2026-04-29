import {
  isSideBeforeTarget,
  isLeafNode,
  isSplitNode,
  orientationForSide,
  type LeafId,
  type PaneNode,
  type PaneNodeLeaf,
  type PaneNodeSplit,
  type PaneTreeEvent,
  type PaneTreeState,
  type SplitSide,
} from '../types/PaneTreeStateManager.type';
import { BaseStateManager } from './BaseStateManager';

type LeafLocation = {
  leaf: PaneNodeLeaf;
  parent: PaneNodeSplit | null;
  indexInParent: number;

  /** Indices from the root down to the leaf's parent. Empty when root. */
  parentPath: number[];
};

const findLeafLocation = (
  root: PaneNode | null,
  id: LeafId,
): LeafLocation | null => {
  if (root === null) {
    return null;
  }

  if (isLeafNode(root)) {
    return root.id === id
      ? { leaf: root, parent: null, indexInParent: -1, parentPath: [] }
      : null;
  }

  const stack: { node: PaneNodeSplit; path: number[] }[] = [
    { node: root, path: [] },
  ];

  let frame: { node: PaneNodeSplit; path: number[] } | undefined;
  while ((frame = stack.pop()) !== undefined) {
    const { node, path } = frame;

    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];

      if (isLeafNode(child)) {
        if (child.id === id) {
          return {
            leaf: child,
            parent: node,
            indexInParent: i,
            parentPath: path,
          };
        }
      } else {
        stack.push({ node: child, path: [...path, i] });
      }
    }
  }

  return null;
};

const getNodeAtPath = (
  root: PaneNode | null,
  path: readonly number[],
): PaneNode | null => {
  let node: PaneNode | null = root;

  for (const index of path) {
    if (node === null || !isSplitNode(node) || index >= node.children.length) {
      return null;
    }
    node = node.children[index];
  }

  return node;
};

/**
 * Collects every `LeafId` found in a subtree.
 */
const collectLeafIds = (node: PaneNode, out: Set<LeafId>): void => {
  if (isLeafNode(node)) {
    out.add(node.id);
    return;
  }

  for (const child of node.children) {
    collectLeafIds(child, out);
  }
};

/**
 * Redistributes the slot formerly occupied by a removed child across the
 * remaining children, in proportion to their current sizes.
 *
 * @remarks
 * If the remaining sizes sum to `0` (degenerate tree), the slot is spread
 * evenly.
 */
const redistributeSizesAfterRemoval = (
  remainingSizes: number[],
  removedSize: number,
): number[] => {
  const total = remainingSizes.reduce((sum, s) => sum + s, 0);
  if (total === 0) {
    const even = 100 / remainingSizes.length;
    return remainingSizes.map(() => even);
  }

  return remainingSizes.map((s) => s + (s / total) * removedSize);
};

/**
 * Manages the structural state of a recursive pane tree.
 *
 * @remarks
 * `PaneTreeStateManager` is headless — it owns a tree of opaque leaves
 * (identified by numeric `LeafId`s) and the nested splits between them.
 * It doesn't render; a consumer (typically {@link PaneTree}) subscribes to it
 * and maps each leaf id to a React node.
 *
 * Invariants maintained at all times:
 *
 * - Every split has at least two children.
 * - `split.sizes.length === split.children.length`.
 * - `split.sizes` contains non-negative numbers that sum to `100`.
 * - No two leaves share a `LeafId` within the same tree.
 *
 * The manager is structurally content agnostic. Tab panes, editor panes,
 * preview panes — anything with a stable id — can serve as a leaf. For the
 * batteries-included combination with the tab system (tabs-per-leaf,
 * drop-to-split), see {@link WorkspacePane}.
 *
 * `PaneTreeEvent`:
 * - `LEAF_ADDED` — a new leaf was inserted into an empty tree.
 * - `LEAF_REMOVED` — a leaf was removed (and any single-child splits
 *   collapsed).
 * - `LEAF_SPLIT` — an existing leaf was split in a direction, creating a
 *   new sibling leaf.
 * - `LEAF_MOVED` — an existing leaf was relocated adjacent to another
 *   leaf.
 * - `SPLIT_RESIZED` — the `sizes` array of a split was updated.
 *
 * @example
 * ```ts
 * const treeManager = new PaneTreeStateManager();
 * treeManager.addLeaf(1);                    // root = { kind: 'leaf', id: 1 }
 * treeManager.splitLeaf(1, 2, 'right');      // root is now split horizontally
 * treeManager.splitLeaf(2, 3, 'bottom');     // right pane splits vertically
 *
 * treeManager.on('LEAF_SPLIT', ({ payload }) => {
 *   console.log(`split ${payload.targetId} → ${payload.newLeafId}`);
 * });
 * ```
 */
export class PaneTreeStateManager extends BaseStateManager<
  PaneTreeState,
  PaneTreeEvent
> {
  /**
   * Creates a new pane tree manager.
   *
   * @param initialRoot - Optional initial tree. Pass `null` (or omit) for
   *   an empty tree. The manager does not validate the tree structure
   *   beyond storing it; malformed trees passed here will cause misbehaving
   *   operations later. Prefer building the tree via the mutation methods.
   */
  constructor(initialRoot: PaneNode | null = null) {
    super({ root: initialRoot });
  }

  /**
   * Adds a leaf to an empty tree.
   *
   * @remarks
   * Silently exits when the tree already has a root — use
   * {@link PaneTreeStateManager.splitLeaf} to add leaves after the first.
   *
   * Emits `LEAF_ADDED`.
   *
   * @param id - The leaf's `LeafId`. Must be unique within the tree.
   */
  public addLeaf(id: LeafId): void {
    if (this.state.root !== null) {
      return;
    }

    this.state.root = { isLeaf: true, id };
    this.emit({ eventType: 'LEAF_ADDED', payload: { id } });
    this.notifySubscribers();
  }

  /**
   * Splits an existing leaf, placing a new leaf alongside it.
   *
   * @remarks
   * - If the target's parent split already has the matching orientation
   *   (e.g. splitting `'right'` inside a horizontal split), the new leaf
   *   is inserted into the existing parent at the appropriate index.
   *   Sizes are adjusted so that the target and the new leaf each get
   *   half of the target's previous allocation.
   * - Otherwise, the target is replaced with a new two-child split whose
   *   orientation matches the requested side, with the new leaf and the
   *   target evenly sized (`[50, 50]`).
   *
   * Silently exits when:
   * - `targetId` is not in the tree.
   * - `newLeafId` already exists in the tree (prevents duplicate ids).
   *
   * Emits `LEAF_SPLIT`.
   *
   * @param targetId - The existing leaf to split.
   * @param newLeafId - The id for the new sibling leaf.
   * @param side - Which edge of the target the new leaf should occupy.
   */
  public splitLeaf(targetId: LeafId, newLeafId: LeafId, side: SplitSide): void {
    if (this.hasLeaf(newLeafId)) {
      return;
    }

    const location = findLeafLocation(this.state.root, targetId);
    if (location === null) {
      return;
    }

    const orientation = orientationForSide(side);
    const placeBefore = isSideBeforeTarget(side);
    const newLeaf: PaneNodeLeaf = { isLeaf: true, id: newLeafId };

    if (
      location.parent !== null &&
      location.parent.orientation === orientation
    ) {
      // Insert into the existing parent split; halve the target's slot.
      const parent = location.parent;
      const index = location.indexInParent;
      const halfSize = parent.sizes[index] / 2;

      const insertIndex = placeBefore ? index : index + 1;
      parent.children.splice(insertIndex, 0, newLeaf);
      parent.sizes.splice(insertIndex, 0, halfSize);
      parent.sizes[placeBefore ? index + 1 : index] = halfSize;
    } else {
      // Replace the target with a new two-child split.
      const targetLeaf = location.leaf;
      const newSplit: PaneNodeSplit = {
        isLeaf: false,
        orientation,
        children: placeBefore ? [newLeaf, targetLeaf] : [targetLeaf, newLeaf],
        sizes: [50, 50],
      };

      if (location.parent === null) {
        this.state.root = newSplit;
      } else {
        location.parent.children[location.indexInParent] = newSplit;
      }
    }

    this.emit({
      eventType: 'LEAF_SPLIT',
      payload: { targetId, newLeafId, side },
    });
    this.notifySubscribers();
  }

  /**
   * Removes a leaf from the tree.
   *
   * @remarks
   * Any split left with a single remaining child after the removal is
   * collapsed upward: the grandparent (if any) replaces the split with
   * its remaining child, preserving the grandparent's size allocation
   * for that slot. If the whole tree reduces to nothing, `root` becomes
   * `null`.
   *
   * Silently exits when the id is not in the tree.
   *
   * Emits `LEAF_REMOVED`.
   *
   * @param id - The leaf to remove.
   */
  public removeLeaf(id: LeafId): void {
    const location = findLeafLocation(this.state.root, id);
    if (location === null) {
      return;
    }

    if (location.parent === null) {
      this.state.root = null;
    } else {
      this.removeChildAndCollapse(location);
    }

    this.emit({ eventType: 'LEAF_REMOVED', payload: { id } });
    this.notifySubscribers();
  }

  /**
   * Moves a leaf adjacent to another leaf.
   *
   * @remarks
   * Implemented as a remove-then-split: the source leaf is detached (with
   * the usual single-child collapse), then re-inserted next to the target
   * on the requested side using the same rules as
   * {@link PaneTreeStateManager.splitLeaf}.
   *
   * Silently exits when:
   * - `id` is not in the tree.
   * - `targetId` is not in the tree.
   * - `id === targetId`.
   *
   * Emits `LEAF_MOVED`.
   *
   * @param id - The leaf to move.
   * @param targetId - The leaf to place `id` next to.
   * @param side - Which edge of the target the moved leaf should occupy.
   */
  public moveLeaf(id: LeafId, targetId: LeafId, side: SplitSide): void {
    if (id === targetId) {
      return;
    }

    if (!this.hasLeaf(id) || !this.hasLeaf(targetId)) {
      return;
    }

    // Detach the source leaf.
    const source = findLeafLocation(this.state.root, id);
    if (source === null) {
      return;
    }

    if (source.parent === null) {
      // Source is the root — moving it next to another leaf is impossible
      // because there is no other leaf. This is also blocked by the
      // hasLeaf check above in practice.
      return;
    }
    this.removeChildAndCollapse(source);

    // Re-insert next to the target. The target's location may have shifted
    // inside its parent after the collapse, so re-find it.
    const target = findLeafLocation(this.state.root, targetId);
    if (target === null) {
      // Should not happen given earlier checks, but exit safely.
      return;
    }

    const orientation = orientationForSide(side);
    const placeBefore = isSideBeforeTarget(side);
    const sourceLeaf: PaneNodeLeaf = { isLeaf: true, id };

    if (target.parent !== null && target.parent.orientation === orientation) {
      const parent = target.parent;
      const index = target.indexInParent;
      const halfSize = parent.sizes[index] / 2;
      const insertIndex = placeBefore ? index : index + 1;

      parent.children.splice(insertIndex, 0, sourceLeaf);
      parent.sizes.splice(insertIndex, 0, halfSize);
      parent.sizes[placeBefore ? index + 1 : index] = halfSize;
    } else {
      const targetLeaf = target.leaf;
      const newSplit: PaneNodeSplit = {
        isLeaf: false,
        orientation,
        children: placeBefore
          ? [sourceLeaf, targetLeaf]
          : [targetLeaf, sourceLeaf],
        sizes: [50, 50],
      };
      if (target.parent === null) {
        this.state.root = newSplit;
      } else {
        target.parent.children[target.indexInParent] = newSplit;
      }
    }

    this.emit({
      eventType: 'LEAF_MOVED',
      payload: { id, targetId, side },
    });
    this.notifySubscribers();
  }

  /**
   * Replaces the `sizes` array on a split identified by `path`.
   *
   * @remarks
   * `path` is the sequence of child indices from the root down to the
   * target split. For the root split, pass `[]`. The new `sizes` array
   * must have the same length as the split's `children`. Entries are
   * accepted as-is; consumers are responsible for clamping to min/max
   * allotments (the tree manager only enforces non-negativity).
   *
   * Silently exits when:
   * - `path` does not resolve to a split.
   * - `sizes.length !== children.length`.
   * - Any entry in `sizes` is negative.
   *
   * Emits `SPLIT_RESIZED`.
   *
   * @param path - Child-index path from root to the target split.
   * @param sizes - The new size array (percentages).
   */
  public resizeSplit(path: readonly number[], sizes: readonly number[]): void {
    const node = getNodeAtPath(this.state.root, path);
    if (node === null || !isSplitNode(node)) {
      return;
    }

    if (sizes.length !== node.children.length) {
      return;
    }

    if (sizes.some((s) => s < 0)) {
      return;
    }

    node.sizes = [...sizes];
    this.emit({
      eventType: 'SPLIT_RESIZED',
      payload: { path: [...path], sizes: [...sizes] },
    });
    this.notifySubscribers();
  }

  /**
   * Returns `true` if `id` matches any leaf in the tree.
   */
  public hasLeaf(id: LeafId): boolean {
    return findLeafLocation(this.state.root, id) !== null;
  }

  /**
   * Returns the child-index path from the root to the parent of `id`,
   * or `null` if the leaf is absent or is itself the root.
   */
  public findLeafParentPath(id: LeafId): readonly number[] | null {
    const location = findLeafLocation(this.state.root, id);
    if (location === null) {
      return null;
    }
    if (location.parent === null) {
      return null;
    }

    return [...location.parentPath];
  }

  /**
   * Returns every `LeafId` currently in the tree (unordered).
   */
  public getLeafIds(): LeafId[] {
    if (this.state.root === null) {
      return [];
    }

    const ids = new Set<LeafId>();
    collectLeafIds(this.state.root, ids);

    return Array.from(ids);
  }

  /**
   * Removes the child at `location` from its parent, then collapses
   * single-child splits upward.
   *
   * @remarks
   * This is shared by `removeLeaf` and `moveLeaf`. It does not emit an
   * event or notify subscribers — the caller is responsible for that.
   */
  private removeChildAndCollapse(location: LeafLocation): void {
    const parent = location.parent;
    if (parent === null) {
      this.state.root = null;
      return;
    }

    const removedSize = parent.sizes[location.indexInParent];
    parent.children.splice(location.indexInParent, 1);
    parent.sizes.splice(location.indexInParent, 1);

    if (parent.children.length > 1) {
      parent.sizes = redistributeSizesAfterRemoval(parent.sizes, removedSize);
      return;
    }

    // Parent now has a single child — collapse it.
    this.collapseSingleChildAncestors(location.parentPath);
  }

  /**
   * Starting at the split located at `path`, walks upward (toward the
   * root) collapsing any split that is left with a single child.
   */
  private collapseSingleChildAncestors(path: readonly number[]): void {
    let currentPath: readonly number[] = path;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    while (true) {
      const node = getNodeAtPath(this.state.root, currentPath);
      if (node === null || !isSplitNode(node) || node.children.length !== 1) {
        return;
      }

      const only = node.children[0];
      if (currentPath.length === 0) {
        this.state.root = only;
        return;
      }

      // Replace the split with its sole child in its grandparent.
      const parentPath = currentPath.slice(0, -1);
      const indexInGrandparent = currentPath[currentPath.length - 1];
      const grandparent = getNodeAtPath(this.state.root, parentPath);
      if (grandparent === null || !isSplitNode(grandparent)) {
        return;
      }

      grandparent.children[indexInGrandparent] = only;
      // Grandparent's size allocation for this slot is preserved.
      currentPath = parentPath;
    }
  }
}
