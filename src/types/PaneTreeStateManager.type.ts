import { type Orientation } from './Base.type';

/**
 * Identifier for a leaf in a {@link PaneTreeStateManager}.
 *
 * @remarks
 * Leaves are opaque to the tree — the manager does not know what they
 * render. The consumer maps the `LeafId` to a concrete view (a
 * `DynamicTabPaneLeaf` instance, an editor, a preview, etc.) in
 * {@link PaneTreeProps.renderLeaf}.
 */
export type LeafId = number;

/**
 * A leaf node — a single rectangular region with an id.
 */
export type PaneNodeLeaf = {
  isLeaf: true;

  /** Unique identifier within a {@link PaneTreeStateManager}. */
  id: LeafId;
};

/**
 * A split node — lays out two or more children along an axis.
 *
 * @remarks
 * `sizes[i]` is the percentage of the container allocated to `children[i]`.
 * The array length always equals `children.length` and the entries always sum
 * to `100`.
 */
export type PaneNodeSplit = {
  isLeaf: false;

  /** Layout axis of this split. */
  orientation: Orientation;

  /** Ordered list of children (leaves or nested splits). */
  children: PaneNode[];

  /**
   * Per-child size percentages. `sizes[i]` corresponds to `children[i]`;
   * entries are non-negative and the array sums to `100`.
   */
  sizes: number[];
};

/**
 * Any node in a pane tree — either a leaf or a split.
 */
export type PaneNode = PaneNodeLeaf | PaneNodeSplit;

/**
 * Directional keyword for splitting or dropping a leaf against another leaf.
 *
 * @remarks
 * - `'left'` / `'right'` — split the target horizontally; the new leaf is
 *   placed before (left) / after (right) the target.
 * - `'top'` / `'bottom'` — split the target vertically; the new leaf is
 *   placed before (top) / after (bottom) the target.
 */
export type SplitSide = 'left' | 'right' | 'top' | 'bottom';

/**
 * State managed by {@link PaneTreeStateManager}.
 */
export type PaneTreeState = {
  /** Root of the tree, or `null` when the tree is empty. */
  root: PaneNode | null;
};

/**
 * Discriminated union of events emitted by {@link PaneTreeStateManager}.
 */
export type PaneTreeEvent =
  | {
      eventType: 'LEAF_ADDED';
      payload: { id: LeafId };
    }
  | {
      eventType: 'LEAF_REMOVED';
      payload: { id: LeafId };
    }
  | {
      eventType: 'LEAF_SPLIT';
      payload: { targetId: LeafId; newLeafId: LeafId; side: SplitSide };
    }
  | {
      eventType: 'LEAF_MOVED';
      payload: { id: LeafId; targetId: LeafId; side: SplitSide };
    }
  | {
      eventType: 'SPLIT_RESIZED';
      payload: { path: readonly number[]; sizes: readonly number[] };
    };

/**
 * Type guard for {@link PaneNodeLeaf}.
 */
export const isLeafNode = (node: PaneNode): node is PaneNodeLeaf => node.isLeaf;

/**
 * Type guard for {@link PaneNodeSplit}.
 */
export const isSplitNode = (node: PaneNode): node is PaneNodeSplit =>
  !node.isLeaf;

/**
 * Maps a {@link SplitSide} keyword to the axis along which a split would
 * arrange children.
 *
 * @param side - The `SplitSide` to evaluate the orientation against.
 * @returns `'horizontal'` for `'left'`/`'right'` panes, `'vertical'` for
 *   `'top'`/`'bottom'` panes.
 */
export const orientationForSide = (side: SplitSide): Orientation =>
  side === 'left' || side === 'right' ? 'horizontal' : 'vertical';

/**
 * Returns `true` when the side places the new leaf *before* the target in
 * its parent's child list (`'left'` or `'top'`).
 *
 * @param side - The {@link SplitSide} to evaluate the "before"/"after"
 *   position against.
 * @returns `true` if placing the new leaf in a "before" position
 * (`'left'`/`'top'`), `false in an "after" position (`'right'`/`'bottom'`).
 */
export const isSideBeforeTarget = (side: SplitSide): boolean =>
  side === 'left' || side === 'top';
