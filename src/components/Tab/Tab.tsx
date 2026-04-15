import type React from 'react';

import '../../styles/tokens-primitive.css';
import '../../styles/tokens-semantic.css';
import { type BaseComponentProps } from '../../types/Base.type';
import { type TabDropTargetSide } from '../../types/Tab.type';
import styles from './Tab.module.css';

/**
 * Props for the {@link Tab} component.
 *
 * @remarks
 * Tab is stateless. All visual states (`isActive`, `isDragged`,
 * `dropTargetSide`) are controlled externally. The parent component is
 * responsible for managing which tab is active, drag-and-drop state, etc. Tab
 * has the following default ARIA properties:
 * `role='tab'`
 * `aria-selected={isActive}`
 * `tabIndex={isActive ? 0 : -1}`
 */
export type TabProps = BaseComponentProps & {
  /**
   * Unique identifier for this tab.
   *
   * @remarks
   * Must be unique relative to other tabs and does not change for the lifetime
   * of the tab. Used as the `data-tab-id` attribute and passed back to
   * `onClose`.
   */
  id: number;

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

/**
 * A simple tab component with easy default features.
 *
 * @remarks
 * Renders a tab with a label and optional close button. All state data is
 * controlled via props — this component holds no internal state.
 *
 * @example
 * Basic usage inside a tab bar:
 * ```tsx
 * <Tab
 *   id={0}
 *   label="My Tab"
 *   isActive={activeId === 0}
 *   isDragged={false}
 *   dropTargetSide={null}
 *   isCloseable={true}
 *   onClose={handleClose}
 * />
 * ```
 *
 * @see {@link TabProps} for full prop documentation.
 */
export const Tab: React.FC<TabProps> = ({
  id,
  label,
  isActive = false,
  isDragged = false,
  dropTargetSide = null,
  isCloseable = true,
  onClose,
  className = '',
  a11y = {},
}) => {
  const classes = [
    styles.tab,
    isActive && styles.tabActive,
    isDragged && styles.tabDragged,
    dropTargetSide && styles.tabDropTarget,
    dropTargetSide === 'left' && styles.dropLeft,
    dropTargetSide === 'right' && styles.dropRight,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classes}
      title={label}
      data-tab-id={id}
      data-testid={`tab-${id}`}
      role="tab"
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      {...a11y}
    >
      <span className={styles.tabLabel}>{label}</span>
      {isCloseable && (
        <button
          className={styles.closeButton}
          onClick={(e) => {
            e.stopPropagation();
            onClose?.(id);
          }}
          data-testid={`close-${id}`}
          aria-label={`Close ${label}`}
        >
          ×
        </button>
      )}
    </div>
  );
};
