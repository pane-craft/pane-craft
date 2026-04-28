import { type Orientation } from './Base.type';

/**
 * Props for the internal `PaneSplitter` component.
 *
 * @remarks
 * `PaneSplitter` is an internal primitive — the draggable divider rendered
 * between two sibling panes in a {@link SplitPane} or {@link PaneTree}.
 * It is not exported from the public package entry point; consumers
 * interact with it indirectly through those higher-level components.
 *
 * The splitter is fully headless with respect to sizing: it emits
 * pointer/keyboard deltas and leaves the numeric math (percent conversion,
 * clamping, persistence) to the parent.
 */
export type PaneSplitterProps = {
  /**
   * Layout axis of the parent container.
   *
   * @remarks
   * - `'horizontal'` — parent lays children out in a row; the splitter is
   *   a vertical bar with `col-resize` cursor. Drag deltas are read from
   *   `event.clientX`.
   * - `'vertical'` — parent lays children out in a column; the splitter is
   *   a horizontal bar with `row-resize` cursor. Drag deltas are read from
   *   `event.clientY`.
   */
  orientation: Orientation;

  /**
   * When `true`, the splitter ignores pointer and keyboard input and is
   * announced with `aria-disabled="true"`. Useful for read-only layouts.
   *
   * @default false
   */
  disabled?: boolean;

  /**
   * Called once at the start of a pointer drag, before any
   * {@link PaneSplitterProps.onDragResize} invocations. Use this to
   * snapshot the current size.
   */
  onResizeStart?: () => void;

  /**
   * Called on every `mousemove` during a pointer drag with the cumulative
   * pixel delta *since resize start*.
   *
   * @param deltaPixels - Signed pixel offset from the mousedown position.
   *   Positive = right/down; negative = left/up.
   */
  onDragResize: (deltaPixels: number) => void;

  /**
   * Called once when a pointer drag ends (mouseup).
   */
  onResizeEnd?: () => void;

  /**
   * Called on arrow-key press with a signed percentage step. The caller is
   * expected to clamp and apply the step to the underlying size.
   *
   * @remarks
   * Steps are `±1` (ArrowLeft/Up = `-1`, ArrowRight/Down = `+1`) with
   * `Shift` multiplying magnitude to `±10`.
   */
  onKeyResize?: (deltaPercent: number) => void;

  /** Extra class name merged onto the splitter root. */
  className?: string;

  /**
   * Current value for `aria-valuenow`.
   *
   * @remarks
   * Typically the percentage size of the pane before the splitter. Omit
   * if the splitter is keyboard-inaccessible.
   */
  ariaValueNow?: number;

  /** Minimum value for `aria-valuemin`. Defaults to `0`. */
  ariaValueMin?: number;

  /** Maximum value for `aria-valuemax`. Defaults to `100`. */
  ariaValueMax?: number;

  /** Optional `aria-label` for assistive tech. */
  ariaLabel?: string;
};
