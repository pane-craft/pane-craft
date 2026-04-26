import { type TabDropTargetHoverData } from './DragStateManager.type';
import { type PaneId } from './Pane.type';
import { type TabDropTargetSide, type TabItem } from './Tab.type';

export { type TabDropTargetSide, type TabItem } from './Tab.type';
export { type TabDropTargetHoverData } from './DragStateManager.type';

/**
 * Delivered when a dragged tab is dropped on top of another tab.
 *
 * @remarks
 * The consumer is expected to translate this into a reorder/move operation on
 * its own tab collection(s). When `sourcePaneId === targetPaneId` the drop is
 * a same-pane reorder; otherwise it is a cross-pane move.
 */
export type TabDropPayload = {
  /** The tab that was being dragged. */
  tab: TabItem;
  /** The pane the dragged tab originated from. */
  sourcePaneId: PaneId;
  /** The pane that received the drop. */
  targetPaneId: PaneId;
  /** The tab the dragged tab was dropped on. */
  targetTab: TabItem;
  /** Which half of the target tab the pointer was on at drop time. */
  side: TabDropTargetSide;
};

/**
 * Delivered when a dragged tab is dropped on the empty space inside a tab list
 * (generally to the right of the tabs when there isn't overflow).
 */
export type TabListDropPayload = {
  /** The tab that was being dragged. */
  tab: TabItem;
  /** The pane the dragged tab originated from. */
  sourcePaneId: PaneId;
  /** The pane that received the drop. */
  targetPaneId: PaneId;
};

/**
 * The in-flight drag state, scoped to one consumer pane.
 */
export type UseTabDragAndDropState = {
  /**
   * The tab currently being dragged anywhere in the system, or `null` when not
   * dragging a tab.
   */
  draggedTab: TabItem | null;
  /** The pane the dragged tab originated from, or `null` when idle. */
  sourcePaneId: PaneId | null;
  /**
   * `true` when the in-flight drag originated from this hook's pane.
   *
   * @remarks
   * Useful for styling (e.g. dim the source tab in its origin pane only) and
   * for deciding whether a drop on this pane is a same-pane reorder.
   */
  isDraggingFromThisPane: boolean;
  /**
   * The current tab drop target across the whole drag system, or `null`. The
   * `tabId` is only meaningful for tabs in this hook's pane — consumers should
   * filter `tabHover?.tabId === tab.id` before applying drop-indicator styling.
   */
  tabDropTargetHover: TabDropTargetHoverData | null;
};

/**
 * Handlers to spread onto an individual draggable tab element.
 *
 * @remarks
 * The element must render with `draggable` set so that the browser fires
 * native drag events. We include `draggable: true` in the returned object so
 * consumers can do `<div {...getTabHandlers(tab)} />`.
 */
export type TabDragHandlers = {
  /** Required by the HTML5 drag-and-drop API. */
  draggable: true;
  /** Wire to `onDragStart`. */
  onDragStart: (e: React.DragEvent) => void;
  /** Wire to `onDragOver`. */
  onDragOver: (e: React.DragEvent) => void;
  /** Wire to `onDragEnd`. */
  onDragEnd: (e: React.DragEvent) => void;
  /** Wire to `onDrop`. */
  onDrop: (e: React.DragEvent) => void;
};

/**
 * Handlers to spread onto the container that wraps the tab list.
 *
 * @remarks
 * The list-level handlers fire when the user drags into the empty space
 * around the individual tabs. Tab-level handlers stop propagation, so these
 * only run when the pointer is genuinely outside any tab element.
 */
export type TabListDragHandlers = {
  /** Wire to `onDragOver`. */
  onDragOver: (e: React.DragEvent) => void;
  /** Wire to `onDrop`. */
  onDrop: (e: React.DragEvent) => void;
};
