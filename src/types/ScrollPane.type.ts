import { type BaseComponentProps, type Orientation } from './Base.type';
import { type ScrollClickMode } from './ScrollStateManager.type';

/**
 * Options controlling a scrollable pane.
 *
 * @remarks
 * These options are used by both the {@link ScrollPane} component and the
 * underlying `useScrollPane` hook.
 */
export type ScrollPaneOptions = {
  /**
   * Scroll axis of the pane.
   *
   * @default 'horizontal'
   */
  orientation?: Orientation;

  /**
   * Behavior when the user clicks the scrollbar track outside of the thumb.
   *
   * @remarks
   * - `'jump'` — the thumb jumps so that its center is at the click position.
   * - `'increment'` — the content moves ~80% of the viewport size.
   *
   * @default 'jump'
   */
  trackClickMode?: ScrollClickMode;

  /**
   * Minimum pixel length of the scrollbar thumb to ensure the thumb is always
   * usable, even with large content overflows.
   *
   * @default 20
   */
  thumbSizeMin?: number;

  /**
   * When `true`, the scrollbar is hidden until the user hovers the pane or is
   * actively dragging the thumb. When `false`, the scrollbar is always
   * visible. Scrollbar is not visible regardless when there's no overflow.
   *
   * @default true
   */
  autoHide?: boolean;

  /**
   * When `true` and `orientation` is `'horizontal'`, vertical wheel deltas
   * are converted into horizontal scrolling and the native vertical scroll
   * is suppressed.
   *
   * @remarks
   * Has no effect for `'vertical'` orientation — the browser already handles
   * vertical wheel scrolling natively.
   *
   * @default true
   */
  wheelToScroll?: boolean;
};

/**
 * Props for the {@link ScrollPane} component.
 *
 * @remarks
 * `ScrollPane` is a generic wrapper that provides a custom, auto-hiding
 * scrollbar for any scrollable content. It extends {@link ScrollPaneOptions}
 * behavior options and the common {@link BaseComponentProps}.
 */
export type ScrollPaneProps = BaseComponentProps &
  ScrollPaneOptions & {
    /**
     * The content rendered inside the scrollable viewport.
     *
     * @remarks
     * For horizontal panes the content is laid out in an `inline-flex`
     * wrapper with `min-width: max-content`, so children determine the
     * content width. For vertical panes the wrapper uses
     * `min-height: max-content`.
     */
    children?: React.ReactNode;
  };
