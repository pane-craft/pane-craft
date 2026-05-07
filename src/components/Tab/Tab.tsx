import type React from 'react';

import '../../styles/tokens-primitive.css';
import '../../styles/tokens-semantic.css';
import { type TabProps } from '../../types/Tab.type';
import styles from './Tab.module.css';

export { type TabProps } from '../../types/Tab.type';

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
