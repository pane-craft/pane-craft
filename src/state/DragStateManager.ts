import {
  type DragEvent,
  type DragState,
  type TabDropTargetHoverData,
  type DropZoneHoverData,
} from '../types/DragStateManager.type';
import { type PaneId } from '../types/Pane.type';
import { type TabItem } from '../types/Tab.type';
import { BaseStateManager } from './BaseStateManager';

/**
 * A headless state manager for tab drag-and-drop interactions.
 *
 * @remarks
 * Tracks the lifecycle of a single tab being dragged across one or more
 * panes:
 *
 * 1. The user begins dragging a tab, calling {@link DragStateManager.start}.
 * 2. As the user moves the mouse, hover state is tracked via
 *    {@link DragStateManager.setTabHover} (when over another tab) and
 *    {@link DragStateManager.setZoneHover} (when over a drop zone).
 * 3. The user releases the mouse, calling {@link DragStateManager.end} to
 *    clear the drag state. The consumer is responsible for inspecting
 *    {@link DragState.tabHover} and {@link DragState.zoneHover} before
 *    calling `end()` to decide what action to take (reorder, move, split).
 *
 * The manager doesn't make business decisions about reordering or splitting
 * panes. Those are the responsibility of the consumer.
 *
 * @example
 * ```ts
 * const drag = new DragStateManager();
 * drag.on('DRAG_ENDED', () => console.log('drop!'));
 *
 * drag.start({ id: 1, label: 'index.ts' }, 0);
 * drag.setTabHover({ tabId: 2, side: 'right' });
 * // user releases the mouse
 * drag.end();
 * ```
 */
export class DragStateManager extends BaseStateManager<DragState, DragEvent> {
  /**
   * Creates a new `DragStateManager` in the idle state.
   *
   * @param initialState - Optional partial state. Typically only used in
   *   tests to seed an in-flight drag.
   */
  constructor(initialState: Partial<DragState> = {}) {
    super({
      draggedTab: null,
      sourcePaneId: null,
      tabDropTargetHover: null,
      dropZoneHover: null,
      ...initialState,
    });
  }

  /**
   * Begins a drag.
   *
   * @remarks
   * Sets `draggedTab` and `sourcePaneId`. Hover state is reset to `null` to
   * clear any stale data from a previous drag. Emits `DRAG_STARTED` and
   * notifies subscribers.
   *
   * If a drag is already in progress, this method overwrites the existing
   * drag without emitting `DRAG_ENDED` for the previous one — the consumer
   * is expected to call {@link DragStateManager.end} before starting a new
   * drag if it wants the previous one to be cleanly torn down.
   *
   * @param tab - The tab being dragged.
   * @param sourcePaneId - The id of the pane the tab originated from.
   */
  public start(tab: TabItem, sourcePaneId: PaneId): void {
    this.state = {
      ...this.state,
      draggedTab: tab,
      sourcePaneId,
      tabDropTargetHover: null,
      dropZoneHover: null,
    };

    this.emit({
      eventType: 'DRAG_STARTED',
      payload: { tab, sourcePaneId },
    });
    this.notifySubscribers();
  }

  /**
   * Ends the current drag and resets all drag state.
   *
   * @remarks
   * Emits `DRAG_ENDED` carrying the tab and source pane that previously were
   * being dragged so that listeners performing cleanup can still see them.
   * After the event fires, the manager is back in its idle state.
   *
   * Silently exits when no drag is in progress.
   */
  public end(): void {
    const { draggedTab, sourcePaneId } = this.state;
    if (draggedTab === null || sourcePaneId === null) {
      return;
    }

    this.state = {
      ...this.state,
      draggedTab: null,
      sourcePaneId: null,
      tabDropTargetHover: null,
      dropZoneHover: null,
    };

    this.emit({
      eventType: 'DRAG_ENDED',
      payload: { tab: draggedTab, sourcePaneId },
    });
    this.notifySubscribers();
  }

  /**
   * Updates the current tab drop target.
   *
   * @remarks
   * Pass `null` to clear the hover. Silently exits when no drag is in
   * progress so that stray pointer events outside a drag don't interfere.
   *
   * Emits `TAB_HOVER_CHANGED` and notifies subscribers, even if the
   * value is unchanged.
   *
   * @param hover - The tab being hovered as a drop target, or `null` to
   *   clear.
   */
  public setTabHover(hover: TabDropTargetHoverData | null): void {
    if (!this.state.draggedTab) {
      return;
    }

    this.state.tabDropTargetHover = hover;
    this.emit({ eventType: 'TAB_HOVER_CHANGED', payload: { hover } });
    this.notifySubscribers();
  }

  /**
   * Updates the current pane drop zone target.
   *
   * @remarks
   * Pass `null` to clear the hover. Silently exits when no drag is in
   * progress so that stray pointer events outside a drag don't interfere.
   *
   * Emits `ZONE_HOVER_CHANGED` and notifies subscribers, even if the
   * value is unchanged.
   *
   * @param hover - The pane drop zone being hovered, or `null` to clear.
   */
  public setZoneHover(hover: DropZoneHoverData | null): void {
    if (!this.state.draggedTab) {
      return;
    }

    this.state.dropZoneHover = hover;
    this.emit({ eventType: 'ZONE_HOVER_CHANGED', payload: { hover } });
    this.notifySubscribers();
  }
}
