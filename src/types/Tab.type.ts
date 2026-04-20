export type TabId = number;

export type TabDropTargetSide = 'left' | 'right';

export type TabItem = {
  /**
   * Unique identifier for this tab.
   *
   * @remarks
   * Must be unique relative to other tabs and does not change for the lifetime
   * of the tab. Used as the `data-tab-id` attribute and passed back to
   * `onClose`.
   */
  id: TabId;

  /**
   * The text displayed on the tab.
   *
   * @remarks
   * Long labels are truncated with an ellipsis via CSS `text-overflow`. The
   * label is exposed as a `title` tooltip.
   *
   * @example
   * ```tsx
   * <Tab id={1} label="index.ts" ... />
   * ```
   */
  label: string;

  /**
   * Whether this tab is the currently selected tab.
   *
   * @default false
   */
  isActive?: boolean;

  /**
   * Whether this tab is currently being dragged by the user.
   *
   * @remarks
   * When `true`, the tab is rendered dimmed and slightly rotated to give
   * a visual affordance that it is "in flight".
   *
   * @default false
   */
  isDragged?: boolean;

  /**
   * Whether or not this tab is a drop target when another tab is being
   * dragged, and which side of this tab is currently being hovered over.
   *
   * @remarks
   * `null` indicates the tab is not the target of a dragged tab.
   * A coloured drop-indicator line is rendered on the indicated side.
   *
   * @default null
   */
  dropTargetSide?: TabDropTargetSide | null;

  /**
   * Sets whether the tab can be closed or not.
   *
   * @remarks
   * When not closeable, the close button is not rendered at all, producing a
   * "pinned" tab that cannot be closed by the user.
   *
   * @default true
   */
  isCloseable?: boolean;

  /**
   * Callback when the user clicks the close button.
   *
   * @remarks
   * When omitted, the close button is not rendered at all, producing a
   * "pinned" tab that cannot be closed by the user.
   *
   * @param id - The `id` of the tab being closed.
   *
   * @example
   * ```tsx
   * <Tab id={3} onClose={(id) => dispatch({ type: 'CLOSE_TAB', id })} ... />
   * ```
   */
  onClose?: (id: number) => void;
};
