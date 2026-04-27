import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import '../../styles/tokens-primitive.css';
import '../../styles/tokens-semantic.css';
import { type PaneSplitterProps } from '../../types/PaneSplitter.type';
import styles from './PaneSplitter.module.css';

export type { PaneSplitterProps } from '../../types/PaneSplitter.type';

/**
 * Draggable divider between two sibling panes.
 *
 * @remarks
 * Internal primitive used by {@link SplitPane} and {@link PaneTree}. Not
 * exported from the package root — consumers use the higher-level
 * components instead.
 *
 * The splitter is fully headless: it emits signed deltas (pixels during a
 * mouse drag, percent during keyboard navigation) and leaves clamping,
 * percent conversion, and state persistence to its parent. It announces
 * itself as a WAI-ARIA `separator` with `aria-orientation` and
 * `aria-valuenow`/`aria-valuemin`/`aria-valuemax`.
 *
 * @see {@link PaneSplitterProps} for prop documentation.
 */
export const PaneSplitter: React.FC<PaneSplitterProps> = ({
  orientation,
  disabled = false,
  onResizeStart,
  onDragResize,
  onResizeEnd,
  onKeyResize,
  className = '',
  ariaValueNow,
  ariaValueMin = 0,
  ariaValueMax = 100,
  ariaLabel,
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const startPosRef = useRef(0);

  // Keep the latest callbacks in refs so the document listeners set up in
  // the effect below don't have to re-subscribe on every render.
  const onDragResizeRef = useRef(onDragResize);
  const onResizeEndRef = useRef(onResizeEnd);
  onDragResizeRef.current = onDragResize;
  onResizeEndRef.current = onResizeEnd;

  useEffect(() => {
    if (!isResizing) return;

    const handleMove = (event: MouseEvent): void => {
      const current =
        orientation === 'horizontal' ? event.clientX : event.clientY;
      onDragResizeRef.current(current - startPosRef.current);
    };

    const handleUp = (): void => {
      setIsResizing(false);
      onResizeEndRef.current?.();
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };
  }, [isResizing, orientation]);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>): void => {
      if (disabled) return;
      event.preventDefault();
      startPosRef.current =
        orientation === 'horizontal' ? event.clientX : event.clientY;
      onResizeStart?.();
      setIsResizing(true);
    },
    [disabled, orientation, onResizeStart],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>): void => {
      if (disabled || !onKeyResize) return;

      const decreaseKey = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
      const increaseKey =
        orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';

      let direction = 0;
      if (event.key === decreaseKey) direction = -1;
      else if (event.key === increaseKey) direction = 1;
      else return;

      event.preventDefault();
      const magnitude = event.shiftKey ? 10 : 1;
      onKeyResize(direction * magnitude);
    },
    [disabled, onKeyResize, orientation],
  );

  const rootClasses = [
    styles.splitter,
    orientation === 'horizontal'
      ? styles.splitterHorizontal
      : styles.splitterVertical,
    isResizing && styles.splitterActive,
    disabled && styles.splitterDisabled,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={rootClasses}
      role="separator"
      aria-orientation={orientation === 'horizontal' ? 'vertical' : 'horizontal'}
      aria-valuenow={ariaValueNow}
      aria-valuemin={ariaValueMin}
      aria-valuemax={ariaValueMax}
      aria-disabled={disabled || undefined}
      aria-label={ariaLabel}
      tabIndex={disabled ? -1 : 0}
      data-testid="pane-splitter"
      data-orientation={orientation}
      data-is-resizing={isResizing}
      data-disabled={disabled || undefined}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
    />
  );
};
