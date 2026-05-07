/**
 * Utility functions intended only for Storybook stories and not to be included
 * in any final builds.
 */
import { type TabStateManager } from '../state/TabStateManager';
import { type DropZonePosition } from '../types/DropZone.type';
import { type CustomTabProps } from '../types/TabList.type';

/**
 * Display the last drop zone the user dropped into for demonstrative purposes.
 *
 * @param lastZone - The most recent drop zone the user dropped into.
 * @returns A react node that displays the most recent drop zone dropped into.
 */
export const LastDropZoneDisplay = ({
  lastZone,
}: {
  lastZone: DropZonePosition | null;
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 8,
        left: 8,
        fontSize: 16,
        color: '#d4d4d4',
      }}
    >
      Last Zone Drop: {lastZone ?? '—'}
    </div>
  );
};

/**
 * An example custom tab implementation.
 *
 * @remarks
 * For information about the parameters, please see {@link CustomTabProps}.
 */
export const CustomTab: React.FC<CustomTabProps> = ({
  id,
  label,
  isActive = false,
  isCloseable = true,
  dropTargetSide = null,
  onClick,
  onClose,
  a11y = {},
}) => {
  const baseStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '12px 16px',
    borderRadius: 6,
    fontFamily: 'arial',
    fontSize: 16,
    fontWeight: 500,
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'all 120ms ease',
    position: 'relative',
    border: '1px solid transparent',
    backgroundClip: 'padding-box',
  };

  const activeStyles: React.CSSProperties = {
    background: '#ffffff',
    color: '#111827',
    borderColor: '#d1d5db',
    boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
    zIndex: 1,
  };

  const inactiveStyles: React.CSSProperties = {
    background: '#374151',
    color: '#e5e7eb',
    borderColor: 'transparent',
    boxShadow: 'none',
  };

  const dropIndicatorStyles: React.CSSProperties =
    dropTargetSide === 'left'
      ? {
          boxShadow: 'inset 2px 0 0 0 #3b82f6',
        }
      : dropTargetSide === 'right'
        ? {
            boxShadow: 'inset -2px 0 0 0 #3b82f6',
          }
        : {};

  return (
    <div
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      style={{
        ...baseStyles,
        ...(isActive ? activeStyles : inactiveStyles),
        ...dropIndicatorStyles,
      }}
      role="tab"
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      data-tab-id={id}
      data-testid={`tab-${id}`}
      {...a11y}
    >
      <span style={{ whiteSpace: 'nowrap' }}>{label}</span>

      {isCloseable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose?.(id);
          }}
          style={{
            border: 'none',
            background: 'transparent',
            color: 'inherit',
            cursor: 'pointer',
            opacity: 0.65,
            padding: 0,
            lineHeight: 1,
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

/**
 * Same-pane "move to end" helper — used when a tab is dropped on the empty
 * space of its own tab list.
 *
 * @param tabManager - The tab state manager instance.
 * @param tabId - The id of the tab to move.
 */
export const moveTabToEndWithinPane = (
  tabManager: TabStateManager,
  tabId: number,
): void => {
  const order = tabManager.getState().order.slice();

  const fromIdx = order.indexOf(tabId);
  if (fromIdx < 0) {
    return;
  }

  order.splice(fromIdx, 1);
  order.push(tabId);

  tabManager.reorder(order);
};
