import { type DropZoneHoverData } from './DropZone.type';
import { type PaneId } from './Pane.type';
import { type TabItem } from './Tab.type';

export { type DropZonePosition } from './DropZone.type';
export { type DropZoneHoverData } from './DropZone.type';

/**
 * The in-flight drag state, scoped to one consumer pane's drop zone overlay.
 */
export type UseDropZoneState = {
  /** The tab currently being dragged anywhere in the system, or `null`. */
  draggedTab: TabItem | null;
  /** The pane the dragged tab originated from, or `null` when idle. */
  sourcePaneId: PaneId | null;

  /**
   * `true` when the in-flight drag originated from this hook's pane.
   *
   * @remarks
   * Useful for disabling self-drops (a consumer that doesn't want to accept a
   * tab back into the same pane can ignore the `onDrop` callback when this is
   * `true`).
   */
  isDraggingFromThisPane: boolean;

  /**
   * The current drop-zone hover target across the whole drag system, or
   * `null`.
   *
   * @remarks
   * The `paneId` is only meaningful for this hook's pane — consumers should
   * filter `dropZoneHover?.paneId === paneId` before applying hover styling.
   */
  dropZoneHover: DropZoneHoverData | null;
};

/**
 * Handlers to spread onto an individual drop zone element.
 */
export type DropZoneHandlers = {
  /** Wire to `onDragOver`. */
  onDragOver: (e: React.DragEvent) => void;
  /** Wire to `onDragLeave`. */
  onDragLeave: (e: React.DragEvent) => void;
  /** Wire to `onDrop`. */
  onDrop: (e: React.DragEvent) => void;
};
