import { type DragStateManager } from '../state/DragStateManager';
import { type BaseComponentProps } from './Base.type';
import { type PaneId } from './Pane.type';
import { type TabItem } from './Tab.type';

export { type PaneId } from './Pane.type';
export { type TabItem } from './Tab.type';

/**
 * Possible regions inside a pane that can act as a drop target.
 *
 * @remarks
 * - `'top'`, `'bottom'`, `'left'`, `'right'` correspond to the four edges of a
 *   pane. A drop in one of these zones is designed to trigger a split that
 *   places the dragged tab into a new pane on that side.
 * - `'center'` corresponds to the body of the pane. A drop here is designed to
 *   move the dragged tab into the existing pane's tab list rather than
 *   creating a new one.
 */
export type DropZonePosition = 'top' | 'bottom' | 'left' | 'right' | 'center';

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
 * The complete list of drop zone positions, in the order the overlay renders
 * them. `'center'` renders first so the edge zones sit on top and are
 * prioritized in receiving pointer events.
 */
export const DROP_ZONE_POSITIONS: readonly DropZonePosition[] = [
  'center',
  'top',
  'bottom',
  'left',
  'right',
];

/**
 * Delivered to the consumer when a dragged tab is dropped on a drop zone.
 *
 * @remarks
 * The consumer is expected to translate this into a move-or-split operation.
 * When `pos === 'center'` the drop is expected to be a "move into target
 * pane"; edge positions are expected to be a "split the target pane on that
 * side and place the tab in the new sub-pane".
 */
export type DropZoneDropPayload = {
  /** The tab that was being dragged. */
  tab: TabItem;
  /** The pane the dragged tab originated from. */
  sourcePaneId: PaneId;
  /** The pane whose drop zone received the drop. */
  targetPaneId: PaneId;
  /** Which zone of the target pane received the drop. */
  pos: DropZonePosition;
};

/**
 * Props for the {@link DropZone} component.
 *
 * @remarks
 * `DropZone` is an overlay that sits inside a pane and exposes one of each of
 * the {@link DropZonePosition} regions as tab drop targets. The overlay is
 * invisible and non-interactive while no drag is in progress; it fades in
 * during a drag and highlights whichever zone the pointer is over.
 *
 * The component is headless with respect to the consequences of a drop: it
 * fires `onDrop` with the dragged tab and the zone that received it, but
 * never mutates the tab collection or splits the pane itself — that's left to
 * consumer-level logic.
 */
export type DropZoneProps = BaseComponentProps & {
  /**
   * Identifier of the pane the overlay belongs to.
   *
   * @remarks
   * Reported back to the consumer in `onDrop` as `targetPaneId`, and written
   * into the shared drag manager via `DropZoneHoverData.paneId` so that
   * cross-pane drag sessions can distinguish one pane's zones from another's.
   *
   * @default 0
   */
  paneId?: PaneId;
  /**
   * Shared drag state manager.
   *
   * @remarks
   * Pass the same instance used by the source `TabList`/`TabPane` so the
   * overlay can see the in-flight drag. When omitted, an internal manager is
   * created — the overlay will never become visible because no drag will
   * originate inside it.
   */
  dragAndDropManager?: DragStateManager;
  /**
   * Called when a dragged tab is dropped on one of this overlay's zones.
   */
  onDrop?: (data: DropZoneDropPayload) => void;
  /**
   * Which zones to render. Useful for panes that should only accept certain
   * drop actions (e.g. a leaf pane that cannot be split further might pass
   * `['center']` to only accept moves).
   *
   * @default ['center', 'top', 'bottom', 'left', 'right']
   */
  dropZonePosList?: readonly DropZonePosition[];
  /**
   * Size of the edge zones (`top`, `bottom`, `left`, `right`) as a CSS
   * length. `center` fills the remaining area.
   *
   * @remarks
   * Accepts any CSS `<length>` or `<percentage>` value — e.g. `'30%'`,
   * `'4rem'`, or a custom property reference.
   *
   * @default '30%'
   */
  edgeSize?: string;
};
