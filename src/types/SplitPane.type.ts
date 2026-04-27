import { type ReactNode } from 'react';

import { type BaseComponentProps, type Orientation } from './Base.type';

/**
 * Props for the {@link SplitPane} component.
 *
 * @remarks
 * `SplitPane` is a binary resizable layout primitive: two children separated
 * by a draggable divider. It is fully controlled — the parent owns the
 * current {@link SplitPaneProps.firstSize} and receives updates through
 * {@link SplitPaneProps.onResize}. The component has no opinions about what
 * the children are; use it for editor/sidebar layouts, diff views,
 * documentation panes, or any other two-pane arrangement.
 */
export type SplitPaneProps = BaseComponentProps & {
  /** Content rendered in the first (left / top) sub-pane. */
  firstSubPane: ReactNode;

  /** Content rendered in the second (right / bottom) sub-pane. */
  secondSubPane: ReactNode;

  /**
   * Layout axis.
   *
   * @remarks
   * - `'horizontal'` — sub-panes laid out side-by-side with a vertical
   *   divider (`firstSize` controls the width of `firstSubPane`).
   * - `'vertical'` — sub-panes stacked with a horizontal divider
   *   (`firstSize` controls the height of `firstSubPane`).
   *
   * @default 'horizontal'
   */
  orientation?: Orientation;

  /**
   * Current size of the first sub-pane as a percentage (`0`–`100`) of the
   * container along its main axis.
   *
   * @remarks
   * The component is fully controlled: it renders whatever value it is
   * given. Clamping against {@link SplitPaneProps.minSize} and
   * {@link SplitPaneProps.maxSize} is applied to the values emitted via
   * {@link SplitPaneProps.onResize}, so well-behaved callers never see
   * out-of-range values.
   */
  firstSize: number;

  /**
   * Called with the new size (in percent) whenever the user drags the
   * splitter or presses an arrow key on the focused splitter.
   *
   * @remarks
   * The emitted value is already clamped to
   * `[minSize, maxSize]`. Omit this prop to render a fixed (non-resizable)
   * layout at `firstSize`.
   */
  onResize?: (firstSize: number) => void;

  /**
   * Minimum size of the first sub-pane as a percentage. Also caps the
   * maximum size of the second sub-pane.
   *
   * @default 10
   */
  minSize?: number;

  /**
   * Maximum size of the first sub-pane as a percentage. Also caps the
   * minimum size of the second sub-pane.
   *
   * @default 90
   */
  maxSize?: number;

  /**
   * When `true`, disables the splitter: the layout still renders at
   * `firstSize`, but dragging and arrow-key resizing are ignored.
   *
   * @default false
   */
  disabled?: boolean;

  /** Extra class name merged onto the first sub-pane's wrapper element. */
  firstClassName?: string;

  /** Extra class name merged onto the second sub-pane's wrapper element. */
  secondClassName?: string;

  /** Extra class name merged onto the splitter element. */
  splitterClassName?: string;
};
