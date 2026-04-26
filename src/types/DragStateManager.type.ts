import { type DropZonePosition } from './DropZone.type';
import { type PaneId } from './Pane.type';
import { type TabDropTargetSide, type TabId, type TabItem } from './Tab.type';

export { type DropZonePosition } from './DropZone.type';
export { type TabDropTargetSide, type TabId, type TabItem } from './Tab.type';

/**
 * Identifies the tab that the user is currently hovering over while dragging
 * another tab.
 *
 * @remarks
 * `side` is used to decide whether the dragged tab will be inserted before
 * (`'left'`) or after (`'right'`) the hovered tab on drop.
 */
export type TabDropTargetHoverData = {
  /** The id of the tab currently being hovered as a drop target. */
  tabId: TabId;
  /** Which half of the hovered tab the pointer is on. */
  side: TabDropTargetSide;
};

/**
 * Identifies the drop zone the user is currently hovering over while dragging
 * a tab.
 *
 * @remarks
 * A `'center'` drop moves the tab into the target pane's tab list, while
 * `'top'`/`'bottom'`/`'left'`/`'right'` drops split the pane and place the tab
 * in the new split pane.
 */
export type DropZoneHoverData = {
  /** The id of the pane whose drop zone is being hovered. */
  paneId: PaneId;
  /** Which region of the pane is being hovered. */
  pos: DropZonePosition;
};

/**
 * The in-flight drag state.
 *
 * @remarks
 * `tabHover` and `zoneHover` are independent fields. Typically mutually
 * exclusive drop targets — the consumer is expected to clear one before
 * setting the other if it wants to enforce that invariant.
 */
export type DragState = {
  /** The tab currently being dragged, or `null` when no drag is active. */
  draggedTab: TabItem | null;
  /** The pane the dragged tab originated from, or `null` when idle. */
  sourcePaneId: PaneId | null;
  /** The current tab drop target, or `null` if no tab is hovered. */
  tabDropTargetHover: TabDropTargetHoverData | null;
  /** The current pane drop zone target, or `null` if no zone is hovered. */
  dropZoneHover: DropZoneHoverData | null;
};

export type DragEvent =
  | {
      eventType: 'DRAG_STARTED';
      payload: { tab: TabItem; sourcePaneId: PaneId };
    }
  | {
      eventType: 'DRAG_ENDED';
      payload: { tab: TabItem; sourcePaneId: PaneId };
    }
  | {
      eventType: 'TAB_HOVER_CHANGED';
      payload: { hover: TabDropTargetHoverData | null };
    }
  | {
      eventType: 'ZONE_HOVER_CHANGED';
      payload: { hover: DropZoneHoverData | null };
    };
