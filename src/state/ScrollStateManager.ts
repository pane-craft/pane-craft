import {
  type ScrollState,
  type ScrollEvent,
  type ScrollClickMode,
} from '../types/ScrollStateManager.type';
import { BaseStateManager } from './BaseStateManager';

const THUMB_SIZE_MIN_DEFAULT = 20;

/**
 * A headless state manager for custom scrollbar logic.
 *
 * @remarks
 * Handles all mathematical calculations required to render and drive a custom
 * scrollbar: thumb sizing, boundary clamping, drag translation, and
 * track-click interaction. It is entirely framework-agnostic and relies on
 * the host environment (e.g. a `ResizeObserver`) to push size updates via
 * {@link ScrollStateManager.updateSize}.
 *
 * `ScrollState`:
 * - `scrollOffset` — current scroll position in pixels.
 * - `viewportSize` — the size of the visible scrollable area.
 * - `contentSize` — the total size of the scrollable content.
 * - `thumbSize` — calculated thumb length in pixels.
 * - `thumbSizeMin` - clamp for `thumbSize`.
 * - `thumbOffset` — calculated thumb position relative to the track start.
 * - `hasOverflow` — whether content overflows the viewport.
 * - `isDragging` — whether the user is currently dragging the thumb.
 *
 * `ScrollEvent`:
 * - `SCROLL_UPDATED` — fired on every scroll offset change.
 * - `OVERFLOW_CHANGED` — fired when overflow status transitions.
 * - `DRAG_STATE_CHANGED` — fired when drag state changes.
 *
 * @example
 * ```ts
 * const scrollbar = new ScrollStateManager({ orientation: 'vertical' });
 * scrollbar.updateSize(400, 1200);
 * scrollbar.on('SCROLL_UPDATED', ({ payload }) => {
 *   container.scrollTop = payload.offset;
 * });
 * scrollbar.setScrollOffset(300);
 * ```
 */
export class ScrollStateManager extends BaseStateManager<
  ScrollState,
  ScrollEvent
> {
  /**
   * Creates a new `ScrollStateManager`.
   *
   * @param initialState - Optional partial state to override defaults.
   *   Only `orientation` and `thumbSizeMin` are typically useful at
   *   construction time; all size/position fields default to `0`.
   */
  constructor(initialState: Partial<ScrollState> = {}) {
    super({
      scrollOffset: 0,
      viewportSize: 0,
      contentSize: 0,
      orientation: initialState.orientation ?? 'horizontal',
      thumbSize: 0,
      thumbSizeMin: THUMB_SIZE_MIN_DEFAULT,
      thumbOffset: 0,
      hasOverflow: false,
      isDragging: false,
      ...initialState,
    });
  }

  /**
   * Updates the viewport and content sizes and recalculates all derived state.
   *
   * @remarks
   * After updating dimensions this method:
   * 1. Recalculates `hasOverflow` (`contentSize > viewportSize`).
   * 2. Recalculates `thumbSize` as `(viewportSize / contentSize) * viewportSize`,
   *    clamped to a minimum of `thumbSizeMin` (default
   *    `THUMB_SIZE_MIN_DEFAULT`px).
   * 3. Re-clamps the current `scrollOffset` to the new valid range.
   * 4. Emits `OVERFLOW_CHANGED` if the overflow status changed.
   * 5. Notifies all state subscribers.
   *
   * @param viewportSize - The size of the visible area in pixels
   *   (width for `'horizontal'`, height for `'vertical'`).
   * @param contentSize - The total size of the scrollable content in pixels.
   */
  public updateSize(viewportSize: number, contentSize: number): void {
    const previousHasOverflow = this.state.hasOverflow;

    const hasOverflow = contentSize > viewportSize;

    const rawThumbSize = (viewportSize / contentSize) * viewportSize;
    const thumbSize = hasOverflow
      ? Math.max(
          rawThumbSize,
          this.state.thumbSizeMin ?? THUMB_SIZE_MIN_DEFAULT,
        )
      : 0;

    this.state = {
      ...this.state,
      viewportSize,
      contentSize,
      hasOverflow,
      thumbSize,
    };

    this.setScrollOffset(this.state.scrollOffset);

    if (previousHasOverflow !== hasOverflow) {
      this.emit({ eventType: 'OVERFLOW_CHANGED', payload: { hasOverflow } });
    }
  }

  /**
   * Sets the scroll offset, clamping it to the valid range `[0, maxOffset]`.
   *
   * @remarks
   * `maxOffset` is `contentSize - viewportSize`. Any value outside this range
   * is silently clamped. After updating the offset, `thumbOffset` is
   * recalculated so that the thumb position stays in sync:
   *
   * ```
   * thumbOffset = (scrollOffset / maxOffset) * (viewportSize - thumbSize)
   * ```
   *
   * Emits a `SCROLL_UPDATED` event and notifies subscribers on every call,
   * even if the clamped value is unchanged.
   *
   * @param offset - The desired scroll position in pixels.
   */
  public setScrollOffset(offset: number): void {
    const maxOffset = Math.max(
      0,
      this.state.contentSize - this.state.viewportSize,
    );
    const clampedOffset = Math.min(Math.max(0, offset), maxOffset);

    let thumbOffset = 0;
    if (this.state.hasOverflow) {
      const scrollPercentage = maxOffset > 0 ? clampedOffset / maxOffset : 0;
      const trackSpace = this.state.viewportSize - this.state.thumbSize;
      thumbOffset = scrollPercentage * trackSpace;
    }

    this.state.scrollOffset = clampedOffset;
    this.state.thumbOffset = thumbOffset;

    this.emit({
      eventType: 'SCROLL_UPDATED',
      payload: { offset: clampedOffset },
    });
    this.notifySubscribers();
  }

  /**
   * Handles a click on the scrollbar track.
   *
   * @remarks
   * Two interaction modes are supported:
   *
   * - **`'jump'`** — Centers the thumb on the click coordinate. The target
   *   scroll offset is computed as:
   *   ```
   *   (clickCoord / viewportSize) * contentSize − thumbSize / 2
   *   ```
   * - **`'increment'`** — Pages the content toward the click by
   *   `viewportSize * 0.8` in the appropriate direction (determined by
   *   whether the click is before or after the current thumb position).
   *
   * This method silently exits when there is no overflow.
   *
   * @param clickCoord - The coordinate of the click in pixels, measured from
   *   the start of the track.
   * @param mode - The interaction behavior (`'jump'` or `'increment'`).
   */
  public handleTrackClick(clickCoord: number, mode: ScrollClickMode): void {
    if (!this.state.hasOverflow) return;

    if (mode === 'jump') {
      const percentage = clickCoord / this.state.viewportSize;
      const target =
        percentage * this.state.contentSize - this.state.thumbSize / 2;
      this.setScrollOffset(target);
    } else {
      const direction = clickCoord < this.state.thumbOffset ? -1 : 1;
      const step = this.state.viewportSize * 0.8 * direction;
      this.setScrollOffset(this.state.scrollOffset + step);
    }
  }

  /**
   * Translates physical pointer movement into a scroll offset delta.
   *
   * @remarks
   * Computes a `scrollRatio` — the number of content pixels that correspond
   * to one track pixel — and applies it to `deltaPixels`:
   *
   * ```
   * scrollRatio  = (contentSize - viewportSize) / (viewportSize - thumbSize)
   * scrollDelta  = deltaPixels * scrollRatio
   * ```
   *
   * The resulting offset is forwarded to {@link ScrollStateManager.setScrollOffset},
   * which handles clamping, thumb repositioning, and subscriber notification.
   *
   * This method silently exits when there is no overflow.
   *
   * @param deltaPixels - The pointer movement in pixels (positive = scroll
   *   forward/down, negative = scroll backward/up).
   */
  public handleDrag(deltaPixels: number): void {
    if (!this.state.hasOverflow) return;

    const maxOffset = this.state.contentSize - this.state.viewportSize;
    const trackSpace = this.state.viewportSize - this.state.thumbSize;

    const scrollRatio = maxOffset / trackSpace;
    const scrollDelta = deltaPixels * scrollRatio;

    this.setScrollOffset(this.state.scrollOffset + scrollDelta);
  }

  /**
   * Updates the dragging flag and notifies listeners.
   *
   * @remarks
   * Emits a `DRAG_STATE_CHANGED` event so that consumers (e.g. the host
   * component) can apply visual feedback such as preventing text selection
   * or changing the cursor style.
   *
   * @param isDragging - `true` when the user starts dragging the thumb;
   *   `false` when the drag ends.
   */
  public setDragging(isDragging: boolean): void {
    this.state.isDragging = isDragging;
    this.emit({ eventType: 'DRAG_STATE_CHANGED', payload: { isDragging } });
    this.notifySubscribers();
  }
}
