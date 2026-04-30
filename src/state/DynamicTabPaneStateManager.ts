import {
  type DynamicTabLeafSnapshot,
  type DynamicTabNodeSnapshot,
  type DynamicTabPaneEvent,
  type DynamicTabPaneState,
  type DynamicTabPaneSnapshot,
} from '../types/DynamicTabPane.type';
import {
  isLeafNode,
  type LeafId,
  type PaneNode,
  type SplitSide,
} from '../types/PaneTreeStateManager.type';
import { type TabId, type TabItem } from '../types/Tab.type';
import { BaseStateManager } from './BaseStateManager';
import { DragStateManager } from './DragStateManager';
import { PaneTreeStateManager } from './PaneTreeStateManager';
import { TabStateManager } from './TabStateManager';

/**
 * Strips the per-leaf tab data out of a snapshot node, producing the bare
 * {@link PaneNode} structure that {@link PaneTreeStateManager} understands.
 */
const snapshotNodeToPaneNode = (node: DynamicTabNodeSnapshot): PaneNode => {
  if (node.isLeaf) {
    return { isLeaf: true, id: node.id };
  }

  return {
    isLeaf: false,
    orientation: node.orientation,
    children: node.children.map(snapshotNodeToPaneNode),
    sizes: [...node.sizes],
  };
};

/**
 * Returns the largest {@link LeafId} found in a snapshot subtree, or `-1`
 * for a degenerate split with no leaves.
 */
const findMaxLeafIdInSnapshot = (node: DynamicTabNodeSnapshot): number => {
  if (node.isLeaf) {
    return node.id;
  }

  let max = -1;
  for (const child of node.children) {
    const childMax = findMaxLeafIdInSnapshot(child);
    if (childMax > max) {
      max = childMax;
    }
  }

  return max;
};

/**
 * Resolves a leaf snapshot's `activeTabId`, falling back to the first tab if
 * unspecified or if the explicit value isn't present in `tabList`.
 */
const resolveSnapshotActiveTabId = (
  leaf: DynamicTabLeafSnapshot,
): TabId | null => {
  if (leaf.tabList.length === 0) {
    return null;
  }

  const explicit = leaf.activeTabId;
  if (
    explicit !== undefined &&
    explicit !== null &&
    leaf.tabList.some((t) => t.id === explicit)
  ) {
    return explicit;
  }

  return leaf.tabList[0].id;
};

/**
 * Options accepted by the {@link DynamicTabPaneStateManager} constructor.
 */
export type DynamicTabPaneStateManagerOptions = {
  /**
   * An externally-owned pane tree manager.
   *
   * @remarks
   * Pass one in when you want to seed the tree before constructing the
   * dynamic pane, or when you want to observe the tree independently.
   * Otherwise a fresh empty tree is created.
   */
  paneTreeManager?: PaneTreeStateManager;

  /**
   * An externally-owned drag-and-drop manager.
   *
   * @remarks
   * Pass one in when multiple {@link DynamicTabPaneStateManager} instances
   * need to participate in the same drag session, or when you want to
   * subscribe to drag events from outside the dynamic pane. Otherwise a fresh
   * manager is created and shared across every pane of this dynamic pane.
   */
  dragManager?: DragStateManager;

  /**
   * Starting value for the internal leaf-id allocator.
   *
   * @remarks
   * The allocator increments after generating a leaf id, so the first leaf
   * created by any split operation will have id `initialNextLeafId`. When a
   * pre-seeded `paneTreeManager` is provided, this should be set above the
   * highest existing leaf id to prevent id collisions.
   *
   * @default 1
   */
  initialNextLeafId?: LeafId;

  /**
   * A {@link DynamicTabPaneSnapshot} used to seed the dynamic pane at construction.
   *
   * @remarks
   * When provided, the manager builds its internal pane tree and per-leaf
   * tab managers in one pass. The snapshot is also the format returned by
   * {@link DynamicTabPaneStateManager.getSnapshot}, so a saved dynamic pane can
   * be restored verbatim.
   *
   * Mutually exclusive with `paneTreeManager` (the snapshot's job is to
   * seed a fresh tree). Passing both throws.
   *
   * `nextLeafId` and `activeLeafId` from the snapshot take precedence over
   * `initialNextLeafId`. When the snapshot omits `nextLeafId`, it is derived
   * as `max(leafId in root) + 1`.
   */
  initialSnapshot?: DynamicTabPaneSnapshot;
};

/**
 * The batteries-included orchestrator that marries
 * {@link PaneTreeStateManager} with per-leaf {@link TabStateManager}s and a
 * shared {@link DragStateManager}.
 *
 * @remarks
 * Where `PaneTreeStateManager` is structurally tab-agnostic,
 * `DynamicTabPaneStateManager` is specifically for IDE-style workspaces: every
 * leaf of the tree is a tab pane. The manager:
 *
 * - Lazily creates and owns a {@link TabStateManager} for every leaf in the
 *   tree. The manager is accessible via {@link getTabs} and is disposed
 *   automatically when its leaf is removed.
 * - Generates fresh {@link LeafId}s for new panes made by split operations.
 * - Tracks an {@link DynamicTabPaneState.activeLeafId} — the default target
 *   for {@link openTab} calls that omit `leafId`.
 * - Auto-collapses leaves whose last tab is closed.
 *
 * The manager exposes two sub-managers that consumers may observe directly:
 * {@link paneTreeManager} (tree structure) and {@link dragManager} (in-flight
 * drag state). Subscribers to the dynamic pane manager itself are notified on any
 * dynamic pane-level change and on any tree-level change — making a single
 * `subscribe()` call sufficient to drive a React re-render of the whole
 * dynamic pane view.
 *
 * @example
 * ```ts
 * const dtp = new DynamicTabPaneStateManager();
 * dtp.openTab({ id: 1, label: 'index.ts', content: <Editor /> });
 * dtp.openTab({ id: 2, label: 'styles.css', content: <Editor /> });
 *
 * // Split the active leaf and move tab 2 into the new right-hand pane.
 * dtp.splitLeafWithTab({
 *   sourceLeafId: dtp.activeLeafId!,
 *   targetLeafId: dtp.activeLeafId!,
 *   tabId: 2,
 *   side: 'right',
 * });
 * ```
 */
export class DynamicTabPaneStateManager extends BaseStateManager<
  DynamicTabPaneState,
  DynamicTabPaneEvent
> {
  /** The pane-structure sub-manager. Read-only reference. */
  public readonly paneTreeManager: PaneTreeStateManager;

  /** The shared drag-and-drop sub-manager. Read-only reference. */
  public readonly dragManager: DragStateManager;

  /** Lazily-created per-leaf tab managers. */
  private readonly tabManagerMap = new Map<LeafId, TabStateManager>();

  /** Unsubscribe handle for the internal subscription to `paneTreeManager`. */
  private readonly unsubscribeTree: () => void;

  /** Unsubscribe handle for the pane tree's `LEAF_REMOVED` event. */
  private readonly unsubscribeLeafRemoved: () => void;

  constructor(options: DynamicTabPaneStateManagerOptions = {}) {
    const snapshot = options.initialSnapshot;

    if (snapshot !== undefined && options.paneTreeManager !== undefined) {
      throw new Error(
        'DynamicTabPaneStateManager: `initialSnapshot` and `paneTreeManager` ' +
          'are mutually exclusive. The snapshot is meant to seed a fresh tree.',
      );
    }

    const explicitNextLeafId =
      snapshot?.nextLeafId ?? options.initialNextLeafId;
    const derivedNextLeafId =
      snapshot?.root != null
        ? Math.max(1, findMaxLeafIdInSnapshot(snapshot.root) + 1)
        : 1;

    super({
      activeLeafId: snapshot?.activeLeafId ?? null,
      nextLeafId: explicitNextLeafId ?? derivedNextLeafId,
    });

    if (snapshot !== undefined) {
      const initialRoot =
        snapshot.root !== null ? snapshotNodeToPaneNode(snapshot.root) : null;
      this.paneTreeManager = new PaneTreeStateManager(initialRoot);
      if (snapshot.root !== null) {
        this.seedTabManagersFromSnapshot(snapshot.root);
      }
    } else {
      this.paneTreeManager =
        options.paneTreeManager ?? new PaneTreeStateManager();
    }

    this.dragManager = options.dragManager ?? new DragStateManager();

    // Send tree-level changes out to dynamic pane subscribers so that a single
    // `subscribe()` call drives rerenders for both the tree structure and
    // dynamic pane-level state.
    this.unsubscribeTree = this.paneTreeManager.subscribe(() => {
      this.notifySubscribers();
    });

    // Dispose tab managers whose leaf is removed from the tree.
    this.unsubscribeLeafRemoved = this.paneTreeManager.on(
      'LEAF_REMOVED',
      (event) => {
        const removedTabId = event.payload.id;

        this.tabManagerMap.delete(removedTabId);

        if (this.state.activeLeafId === removedTabId) {
          const remaining = this.paneTreeManager.getLeafIds();
          const next = remaining.length > 0 ? remaining[0] : null;

          this.state = { ...this.state, activeLeafId: next };

          this.emit({
            eventType: 'ACTIVE_LEAF_CHANGED',
            payload: { leafId: next },
          });
        }
      },
    );
  }

  /**
   * The id of the currently active leaf, or `null` when the dynamic pane is
   * empty.
   */
  public get activeLeafId(): LeafId | null {
    return this.state.activeLeafId;
  }

  /**
   * Returns the {@link TabStateManager} for a leaf.
   *
   * @remarks
   * The tab manager is created lazily the first time a leaf is referenced,
   * so this method always returns an instance as long as the leaf exists.
   * Returns `null` when the leaf is not in the tree.
   *
   * @param leafId - The id of the leaf whose tab manager is requested.
   * @returns The {@link TabStateManager} that controls the leaf. The manager
   *   will be instantiated in the case of a new leaf.
   */
  public getTabs(leafId: LeafId): TabStateManager | null {
    if (!this.paneTreeManager.hasLeaf(leafId)) {
      return null;
    }

    return this.getOrCreateTabManager(leafId);
  }

  /**
   * Returns every leaf id in the tree. Convenience wrapper around
   * `tree.getLeafIds()`.
   */
  // public getLeafIds(): LeafId[] {
  //   return this.paneTreeManager.getLeafIds();
  // }

  /**
   * Opens a tab inside a leaf.
   *
   * @remarks
   * Resolution order for the destination leaf:
   *
   * 1. If `leafId` is provided and exists, the tab is added there.
   * 2. If `leafId` is provided but does not exist, silently exit.
   * 3. Otherwise (leaf omitted):
   *    - if there is an active leaf, the tab goes there;
   *    - if the dynamic pane is empty, a new leaf is created and activated.
   *
   * Emits `TAB_OPENED`.
   *
   * @param tab - The tab data to open.
   * @param leafId - Optional explicit destination leaf.
   */
  public openTab(tab: TabItem, leafId?: LeafId): void {
    let target: LeafId;

    if (leafId !== undefined) {
      if (!this.paneTreeManager.hasLeaf(leafId)) {
        return;
      }

      target = leafId;
    } else if (this.state.activeLeafId !== null) {
      target = this.state.activeLeafId;
    } else if (this.paneTreeManager.getLeafIds().length === 0) {
      target = this.generateLeafId();
      this.paneTreeManager.addLeaf(target);
      this.setActiveLeafInternal(target);
    } else {
      // Active leaf is unset but the tree has leaves — pick the first.
      target = this.paneTreeManager.getLeafIds()[0];
      this.setActiveLeafInternal(target);
    }

    const tabs = this.getOrCreateTabManager(target);
    tabs.addTab(tab);

    this.emit({ eventType: 'TAB_OPENED', payload: { tab, leafId: target } });
    this.notifySubscribers();
  }

  /**
   * Closes a tab by id.
   *
   * @remarks
   * Searches every pane for the tab id and removes it from the pane that
   * owns it. If the pane ends up with zero tabs after removal, the leaf is
   * also removed from the tree.
   *
   * Silently exits when the tab id is not found.
   *
   * Emits `TAB_CLOSED` (and `LEAF_REMOVED` downstream if the leaf collapses).
   *
   * @param tabId - The tab to close.
   */
  public closeTab(tabId: TabId): void {
    const found = this.findTabLocation(tabId);
    if (found === null) {
      return;
    }

    const { leafId, tabManager } = found;
    tabManager.removeTab(tabId);

    this.emit({ eventType: 'TAB_CLOSED', payload: { tabId, leafId } });
    this.collapseLeafIfEmpty(leafId);
    this.notifySubscribers();
  }

  /**
   * Moves a tab from one pane to another.
   *
   * @remarks
   * When `sourceLeafId === targetLeafId`, this is equivalent to a reorder
   * within the same pane. When they differ:
   *
   * 1. The tab is removed from the source pane.
   * 2. The tab is inserted into the target pane at `index` (or appended).
   * 3. If the source pane is now empty, the source leaf is removed and the
   *    tree collapses accordingly.
   *
   * The moved tab automatically becomes the active tab of the target pane.
   *
   * Silently exits when any of the ids are unknown.
   *
   * Emits `TAB_MOVED`.
   *
   * @param tabId - The id of the tab to move.
   * @param sourceLeafId - The id of the leaf pane that tab is moving from.
   * @param targetLeafId - The id of the leaf pane that tab is moving to.
   * @param index - Optional parameter determining where in the target pane's
   *   tab list to insert at. If none provided, will default to appending at
   *   the end.
   */
  public moveTab(
    tabId: TabId,
    sourceLeafId: LeafId,
    targetLeafId: LeafId,
    index?: number,
  ): void {
    if (
      !this.paneTreeManager.hasLeaf(sourceLeafId) ||
      !this.paneTreeManager.hasLeaf(targetLeafId)
    ) {
      return;
    }

    const sourceTabManager = this.getOrCreateTabManager(sourceLeafId);
    const sourceState = sourceTabManager.getState();
    const tab = sourceState.itemMap.get(tabId);
    if (tab === undefined) {
      return;
    }

    const targetTabs = this.getOrCreateTabManager(targetLeafId);

    if (sourceLeafId === targetLeafId) {
      const currentOrder = [...sourceState.order];

      const from = currentOrder.indexOf(tabId);
      if (from === -1) {
        return;
      }

      currentOrder.splice(from, 1);
      const insertAt =
        index !== undefined
          ? Math.max(0, Math.min(index, currentOrder.length))
          : currentOrder.length;
      currentOrder.splice(insertAt, 0, tabId);
      sourceTabManager.reorder(currentOrder);

      this.emit({
        eventType: 'TAB_MOVED',
        payload: {
          tabId,
          sourceLeafId,
          targetLeafId,
          index: insertAt,
        },
      });
      this.notifySubscribers();

      return;
    }

    sourceTabManager.removeTab(tabId);
    targetTabs.addTab(tab, index);

    const resolvedIndex = index ?? targetTabs.getState().order.indexOf(tabId);

    this.emit({
      eventType: 'TAB_MOVED',
      payload: {
        tabId,
        sourceLeafId,
        targetLeafId,
        index: resolvedIndex,
      },
    });

    this.collapseLeafIfEmpty(sourceLeafId);
    this.notifySubscribers();
  }

  /**
   * Splits a target leaf and moves a tab into the new sibling leaf.
   *
   * @remarks
   * This is the action triggered by dropping a tab on one of the target
   * pane's edge drop zones. The sequence is:
   *
   * 1. Allocate a fresh {@link LeafId} and split `targetLeafId` on `side`.
   * 2. Move the tab from the source pane into the new leaf.
   * 3. If the source pane is now empty, remove it (collapse).
   * 4. The new leaf becomes active.
   *
   * If `sourceLeafId === targetLeafId` and the source pane has only one
   * tab, this is effectively a no-op split because removing the tab would
   * empty the source (which then collapses), leaving a tree with a single
   * leaf containing the tab. In that case the call is a no-op and returns
   * early without mutating anything.
   *
   * Silently exits when any id is unknown.
   *
   * Emits `LEAF_SPLIT_WITH_TAB` (and downstream `LEAF_SPLIT`, plus
   * `LEAF_REMOVED` if the source collapses).
   *
   * @param sourceLeafId - The `leafId` of the pane the user drags the tab from.
   * @param targetLeafId - The `leafId` of the pane the user drops the tab to.
   * @param tabId - The id of the tab being dropped.
   * @param side - Which edge of the target the new leaf should occupy.
   */
  public splitLeafWithTab(
    sourceLeafId: LeafId,
    targetLeafId: LeafId,
    tabId: TabId,
    side: SplitSide,
  ): void {
    if (
      !this.paneTreeManager.hasLeaf(sourceLeafId) ||
      !this.paneTreeManager.hasLeaf(targetLeafId)
    ) {
      return;
    }

    const sourceTabManager = this.getOrCreateTabManager(sourceLeafId);
    const sourceState = sourceTabManager.getState();
    const tab = sourceState.itemMap.get(tabId);
    if (tab === undefined) {
      return;
    }

    // Splitting a pane against itself when it only contains the tab being
    // moved would collapse back to the original state — skip it.
    if (sourceLeafId === targetLeafId && sourceState.order.length <= 1) {
      return;
    }

    const newLeafId = this.generateLeafId();
    this.paneTreeManager.splitLeaf(targetLeafId, newLeafId, side);

    sourceTabManager.removeTab(tabId);
    const newTabs = this.getOrCreateTabManager(newLeafId);
    newTabs.addTab(tab);

    this.setActiveLeafInternal(newLeafId);

    this.emit({
      eventType: 'LEAF_SPLIT_WITH_TAB',
      payload: { tabId, sourceLeafId, targetLeafId, newLeafId, side },
    });

    this.collapseLeafIfEmpty(sourceLeafId);
    this.notifySubscribers();
  }

  /**
   * Sets which leaf is considered "active" — the default destination for
   * {@link openTab} calls that omit a leaf id.
   *
   * @remarks
   * Silently exits when `leafId` is not in the tree. Pass `null` to clear.
   *
   * Emits `ACTIVE_LEAF_CHANGED` when the value actually changes.
   */
  public setActiveLeaf(leafId: LeafId | null): void {
    if (leafId !== null && !this.paneTreeManager.hasLeaf(leafId)) {
      return;
    }

    if (this.state.activeLeafId === leafId) {
      return;
    }

    this.state = { ...this.state, activeLeafId: leafId };

    this.emit({
      eventType: 'ACTIVE_LEAF_CHANGED',
      payload: { leafId },
    });
    this.notifySubscribers();
  }

  /**
   * Returns a serialisable snapshot of the dynamic pane's current state.
   *
   * @remarks
   * The snapshot mirrors the same shape accepted by
   * {@link DynamicTabPaneStateManagerOptions.initialSnapshot}, so a saved
   * snapshot can be passed straight back into a new manager to restore the
   * dynamic pane verbatim. Per-leaf tab order, the active tab in each leaf, the
   * active leaf, and the leaf-id allocator are all included.
   *
   * Tab `content` (renderable React nodes) is included by reference. When
   * persisting beyond the current process, serialise only the data your app
   * needs (e.g. ids and labels) and rebuild `content` on load.
   *
   * @returns A fresh {@link DynamicTabPaneSnapshot} owned by the caller — mutating
   *   it does not affect the manager.
   */
  public getSnapshot(): DynamicTabPaneSnapshot {
    const root = this.paneTreeManager.getState().root;

    return {
      root: root !== null ? this.paneNodeToSnapshot(root) : null,
      activeLeafId: this.state.activeLeafId,
      nextLeafId: this.state.nextLeafId,
    };
  }

  /**
   * Tears down internal subscriptions.
   *
   * @remarks
   * Call this when the dynamic pane manager is being discarded and the tree /
   * drag managers passed in via options are retained by the caller. When
   * the manager owns both sub-managers exclusively, destruction is optional
   * because they will be garbage-collected together.
   */
  public destroy(): void {
    this.unsubscribeTree();
    this.unsubscribeLeafRemoved();
  }

  private getOrCreateTabManager(leafId: LeafId): TabStateManager {
    let tabs = this.tabManagerMap.get(leafId);

    if (tabs === undefined) {
      tabs = new TabStateManager({ paneId: leafId });
      this.tabManagerMap.set(leafId, tabs);
    }
    return tabs;
  }

  /**
   * Find the `leafId` for the pane containing `tabId`.
   * @param tabId - The id of the tab to find among the leaf panes.
   * @returns An object with the {@link TabStateManager} related to the
   *   `leafId`, or `null` if no match is found.
   */
  private findTabLocation(
    tabId: TabId,
  ): { leafId: LeafId; tabManager: TabStateManager } | null {
    for (const leafId of this.paneTreeManager.getLeafIds()) {
      const tabManager = this.getOrCreateTabManager(leafId);
      if (tabManager.getState().itemMap.has(tabId)) {
        return { leafId, tabManager };
      }
    }

    return null;
  }

  /**
   * Detect if pane `leafId` is empty and, if so, remove it from the tree.
   *
   * @remarks
   * Silently exits if the `paneTreeManager` doesn't have the `leafId` pane,
   * or if no `tabManager` is detected.
   *
   * @param leafId - The `leafId` of the pane to potentially collapse.
   */
  private collapseLeafIfEmpty(leafId: LeafId): void {
    if (!this.paneTreeManager.hasLeaf(leafId)) {
      return;
    }

    const tabManager = this.tabManagerMap.get(leafId);
    if (tabManager === undefined) {
      return;
    }

    if (tabManager.getState().order.length === 0) {
      this.paneTreeManager.removeLeaf(leafId);
    }
  }

  /**
   * Generate new, unique, monotonic {@link LeafId}.
   *
   * @remarks
   * Generates monotonic {@link LeafId} based on internally tracked
   * `nextLeafId`, and increments `nextLeafId`.
   *
   * @returns The new, unique {@link LeafId}.
   */
  private generateLeafId(): LeafId {
    const next = this.state.nextLeafId;
    this.state = { ...this.state, nextLeafId: next + 1 };
    return next;
  }

  /**
   * Sets the active leaf id.
   *
   * @remarks
   * Emits `'ACTIVE_LEAF_CHANGED'` event after setting the `activeLeafId`. If
   * the currently active leaf id is the same as the provided `leafId`, the
   * function silently exits.
   *
   * @param leafId - The {@link LeafId} to set as active.
   */
  private setActiveLeafInternal(leafId: LeafId | null): void {
    if (this.state.activeLeafId === leafId) return;
    this.state = { ...this.state, activeLeafId: leafId };

    this.emit({
      eventType: 'ACTIVE_LEAF_CHANGED',
      payload: { leafId },
    });
  }

  /**
   * Walks a snapshot subtree and pre-populates {@link tabManagerMap} with a
   * fresh {@link TabStateManager} for every leaf encountered.
   *
   * @remarks
   * Each tab manager is constructed directly from the leaf snapshot's
   * `tabList`, `order`, and resolved active id — no `addTab` calls happen, so
   * no events fire. Used during construction when an `initialSnapshot` is
   * provided.
   */
  private seedTabManagersFromSnapshot(node: DynamicTabNodeSnapshot): void {
    if (node.isLeaf) {
      const tabManager = new TabStateManager({
        paneId: node.id,
        order: node.tabList.map((t) => t.id),
        itemMap: new Map(node.tabList.map((t) => [t.id, t])),
        activeId: resolveSnapshotActiveTabId(node),
      });
      this.tabManagerMap.set(node.id, tabManager);

      return;
    }

    for (const child of node.children) {
      this.seedTabManagersFromSnapshot(child);
    }
  }

  /**
   * Converts a {@link PaneNode} into a {@link DynamicTabNodeSnapshot},
   * enriching each leaf with its tab data from {@link tabManagerMap}.
   *
   * @remarks
   * A leaf with no associated tab manager (which can happen for leaves that
   * have never been touched) is rendered as an empty-tabs leaf.
   */
  private paneNodeToSnapshot(node: PaneNode): DynamicTabNodeSnapshot {
    if (isLeafNode(node)) {
      const tabManager = this.tabManagerMap.get(node.id);

      if (tabManager === undefined) {
        return { isLeaf: true, id: node.id, tabList: [], activeTabId: null };
      }

      const tabState = tabManager.getState();
      const tabList = tabState.order
        .map((id) => tabState.itemMap.get(id))
        .filter((t): t is TabItem => t !== undefined);

      return {
        isLeaf: true,
        id: node.id,
        tabList,
        activeTabId: tabState.activeId,
      };
    }

    return {
      isLeaf: false,
      orientation: node.orientation,
      children: node.children.map((c) => this.paneNodeToSnapshot(c)),
      sizes: [...node.sizes],
    };
  }
}
