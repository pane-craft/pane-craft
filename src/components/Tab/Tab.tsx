import type React from 'react';

import '../../styles/tokens-primitive.css';
import '../../styles/tokens-semantic.css';
import { type BaseComponentProps } from '../../types/Base.type';
import { type TabItem } from '../../types/Tab.type';
import styles from './Tab.module.css';

/**
 * Props for the {@link Tab} component.
 *
 * @remarks
 * Tab is stateless. All visual states (`isActive`, `isDragged`,
 * `dropTargetSide`) are controlled externally. The parent component is
 * responsible for managing which tab is active, drag-and-drop state, etc.
 *
 * Activation is exposed through mouse click, or `Enter`/`Space` while the tab
 * is focused — both invoke `onClick`. `Space` calls `preventDefault()` to
 * suppress page scroll. Tab does not set `isActive` itself; the parent must
 * reflect the new state back in.
 *
 * Default ARIA properties:
 * `role='tab'`
 * `aria-selected={isActive}`
 * `tabIndex={isActive ? 0 : -1}`
 */
export type TabProps = BaseComponentProps & TabItem;

/**
 * A simple tab component with easy default features.
 *
 * @remarks
 * Renders a tab with a label and optional close button. All state data is
 * controlled via props — this component holds no internal state. Activation
 * is exposed through `onClick`, which fires on mouse click and on
 * `Enter`/`Space` when the tab is focused.
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
 *   onClick={() => setActiveId(0)}
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
  onClick,
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
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
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
