import { type ReactNode } from 'react';

import { type DynamicTabPaneStateManager } from '../state/DynamicTabPaneStateManager';
import { type BaseComponentProps, type Orientation } from './Base.type';
import { type DropZonePosition } from './DropZone.type';
import { type LeafId, type SplitSide } from './PaneTreeStateManager.type';
import { type TabId, type TabItem } from './Tab.type';
import { type CustomTabProps } from './TabList.type';

export { type LeafId, type SplitSide } from './PaneTreeStateManager.type';
export { type TabId, type TabItem } from './Tab.type';

/**
 * A snapshot of a single leaf pane: its id plus the tabs it owns and which
 * tab is active.
 *
 * @remarks
 * The `tabs` array's order is the visual tab order. `activeTabId`, when
 * provided, must reference a tab in `tabs`; if omitted (or unresolvable), the
 * first tab is used as the default.
 */
export type DynamicTabLeafSnapshot = {
  isLeaf: true;

  /** The leaf's unique id within the dynamic pane tree. */
  id: LeafId;

  /**
   * The tabs hosted by this leaf in their display order.
   *
   * @remarks
   * Each tab carries the same fields as a runtime {@link TabItem} — including
   * the renderable `content` slot. Consumers persisting the snapshot beyond
   * the current process should serialize only the data they need (e.g. ids
   * and labels) and rebuild `content` on load.
   */
  tabList: TabItem[];

  /**
   * The id of the tab that should be active when the snapshot is loaded.
   *
   * @remarks
   * When omitted or unresolvable, the first tab in `tabs` is selected as the
   * default. Set to `null` only when `tabs` is empty.
   */
  activeTabId?: TabId | null;
};

/**
 * A snapshot of a split node: orientation, ordered children, and the child
 * size percentages.
 *
 * @remarks
 * Mirrors the structure of the underlying {@link PaneNodeSplit}, so the
 * invariants are the same: `sizes.length === children.length`, all sizes
 * non-negative and summing to 100, and at least two children per split.
 */
export type DynamicTabSplitSnapshot = {
  isLeaf: false;

  /** Layout axis of this split. */
  orientation: Orientation;

  /** Ordered list of child snapshots (leaves or nested splits). */
  children: DynamicTabNodeSnapshot[];

  /** Per-child size percentages (sum to 100). */
  sizes: number[];
};

/**
 * Either a leaf snapshot or a split snapshot — the recursive node type used
 * inside a {@link DynamicTabPaneSnapshot}.
 */
export type DynamicTabNodeSnapshot =
  | DynamicTabLeafSnapshot
  | DynamicTabSplitSnapshot;

/**
 * A serialisable snapshot of a {@link DynamicTabPaneStateManager}'s state.
 *
 * @remarks
 * The snapshot captures everything needed to reconstruct the manager:
 *
 * - `root` — the recursive pane tree, with each leaf's tabs included.
 * - `activeLeafId` — which leaf was active at snapshot time.
 * - `nextLeafId` — the leaf id allocator counter, so future splits never
 *   collide with the existing ids. When omitted, the manager derives it as
 *   `max(leafId in root) + 1`.
 *
 * Pass a snapshot to the manager via
 * {@link DynamicTabPaneStateManagerOptions.initialSnapshot} to seed a fresh
 * dynamic pane; call `manager.getSnapshot()` to retrieve the current state in
 * the same shape (round-trippable).
 *
 * @example
 * ```ts
 * const dtp = new DynamicTabPaneStateManager({
 *   initialSnapshot: {
 *     root: {
 *       isLeaf: false,
 *       orientation: 'horizontal',
 *       sizes: [20, 80],
 *       children: [
 *         { isLeaf: true, id: 1, tabs: [explorerTab] },
 *         { isLeaf: true, id: 2, tabs: [editorTab1, editorTab2], activeTabId: 1 },
 *       ],
 *     },
 *     activeLeafId: 2,
 *   },
 * });
 *
 * // Later, persist the dynamic pane:
 * const saved = dtp.getSnapshot();
 * ```
 */
export type DynamicTabPaneSnapshot = {
  /** Root of the snapshot tree, or `null` for an empty dynamic pane. */
  root: DynamicTabNodeSnapshot | null;

  /** The active leaf at snapshot time, or `null` for an empty dynamic pane. */
  activeLeafId?: LeafId | null;

  /**
   * The leaf-id allocator counter at snapshot time.
   *
   * @remarks
   * When omitted on input, the manager derives it from the maximum leaf id
   * in `root`. Always present on output from `getSnapshot()`.
   */
  nextLeafId?: LeafId;
};

/**
 * State managed by {@link DynamicTabPaneStateManager}.
 *
 * @remarks
 * The manager delegates pane structure to an internal
 * {@link PaneTreeStateManager} and per-leaf tab collections to lazily
 * created {@link TabStateManager} instances. `DynamicTabPaneState` captures
 * only the dynamic pane-level fields that don't belong to either child:
 *
 * - `activeLeafId` — the pane that currently receives new tabs when
 *   {@link DynamicTabPaneStateManager.openTab} is called without an explicit
 *   `leafId`.
 * - `nextLeafId` — an allocator counter used to mint fresh leaf ids for
 *   splits. It is monotonic and not reused.
 */
export type DynamicTabPaneState = {
  /** The pane that currently receives new tabs when no leaf is specified. */
  activeLeafId: LeafId | null;

  /** Monotonic id allocator for new leaves created by split operations. */
  nextLeafId: LeafId;
};

/**
 * Discriminated union of events emitted by {@link DynamicTabPaneStateManager}.
 *
 * @remarks
 * Only dynamic pane-level transitions are published here. Subscribers interested
 * in pane structure should listen on `manager.tree` directly, and subscribers
 * interested in an individual pane's tabs should listen on
 * `manager.getTabs(leafId)`.
 */
export type DynamicTabPaneEvent =
  | {
      eventType: 'TAB_OPENED';
      payload: { tab: TabItem; leafId: LeafId };
    }
  | {
      eventType: 'TAB_CLOSED';
      payload: { tabId: TabId; leafId: LeafId };
    }
  | {
      eventType: 'TAB_MOVED';
      payload: {
        tabId: TabId;
        sourceLeafId: LeafId;
        targetLeafId: LeafId;
        index: number;
      };
    }
  | {
      eventType: 'LEAF_SPLIT_WITH_TAB';
      payload: {
        tabId: TabId;
        sourceLeafId: LeafId;
        targetLeafId: LeafId;
        newLeafId: LeafId;
        side: SplitSide;
      };
    }
  | {
      eventType: 'ACTIVE_LEAF_CHANGED';
      payload: { leafId: LeafId | null };
    };

/**
 * Props for the {@link DynamicTabPane} component.
 *
 * @remarks
 * `DynamicTabPane` is the batteries-included dynamic tab pane view: a
 * {@link PaneTree} whose every leaf is rendered as a {@link DynamicTabPaneLeaf} unit wired
 * to a shared {@link DragStateManager}. Cross-pane drag-and-drop and
 * drop-to-split are handled internally — consumers only interact with the
 * {@link DynamicTabPaneStateManager} supplied via `manager`.
 *
 * Tab content uses the existing inline `content?: ReactNode` field on each
 * {@link TabItem} (the same mechanism used by `StaticTabPane`).
 */
export type DynamicTabPaneProps = BaseComponentProps & {
  /**
   * The dynamic tab pane state manager.
   *
   * @remarks
   * The component subscribes to it and re-renders on both dynamic pane-level
   * changes (active leaf) and tree-level changes (splits, removals). Per-pane
   * tab changes are observed by the nested {@link DynamicTabPaneLeaf}
   * instances.
   */
  manager: DynamicTabPaneStateManager;

  /**
   * Rendered when the dynamic pane is completely empty (no leaves at all).
   *
   * @default null
   */
  emptyContent?: ReactNode;

  /**
   * Rendered inside a leaf's content area when that leaf has no active tab.
   *
   * @default null
   */
  emptyPaneContent?: ReactNode;

  /**
   * Minimum size for any pane at a split, as a percentage of its parent
   * split. Splitter drags are clamped so no adjacent pane shrinks below this.
   *
   * @default 10
   */
  minSize?: number;

  /**
   * When `true`, splitters are disabled and cross-pane drag-and-drop is
   * suppressed. Tabs within a single pane remain interactive.
   *
   * @default false
   */
  disabled?: boolean;

  /**
   * Which drop zone overlays are rendered on each leaf.
   *
   * @default ['center', 'top', 'bottom', 'left', 'right']
   */
  dropZonePosList?: readonly DropZonePosition[];

  /**
   * CSS length for the edge zones. Passed to each leaf's `DropZone`.
   *
   * @default '30%'
   */
  edgeSize?: string;

  /**
   * Optional custom tab component, allowing the consumer to provide their own
   * tab instead of relying on the default implementation. Functionality
   * relating to the {@link CustomTabProps} must be implemented by the
   * consumer, but other functionality such as drag and drop is still
   * implemented for the consumer by components upstream of the tab.
   */
  CustomTabComponent?: React.ComponentType<CustomTabProps>;

  /** Extra class name applied to each split container. */
  splitClassName?: string;
  /** Extra class name applied to each leaf wrapper. */
  leafClassName?: string;
  /** Extra class name applied to each splitter. */
  splitterClassName?: string;
  /** Extra class name forwarded to each leaf's `TabList`. */
  tabListClassName?: string;
  /** Extra class name forwarded to each leaf's content region. */
  contentClassName?: string;
  /** Extra class name forwarded to each leaf's `DropZone`. */
  dropZoneClassName?: string;
};
