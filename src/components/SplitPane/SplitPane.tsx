import type React from 'react';
import { useCallback, useRef } from 'react';

import { DEFAULT_SPLIT_PANE_OPTIONS } from '../../config/defaults';
import '../../styles/tokens-primitive.css';
import '../../styles/tokens-semantic.css';
import { type SplitPaneProps } from '../../types/SplitPane.type';
import { clamp } from '../../utils/utils';
import { PaneSplitter } from '../PaneSplitter/PaneSplitter';
import styles from './SplitPane.module.css';

export type { SplitPaneProps } from '../../types/SplitPane.type';

/**
 * Resizable layout controlling two panes separated by a draggable divider.
 *
 * @remarks
 * `SplitPane` is a controlled, headless layout primitive. The parent owns
 * the split size (as a percentage of the container along the main axis)
 * and receives drag/keyboard updates via `onResize`. The component can be used
 * for any two-pane interface and doesn't influence what the children are.
 *
 * @example
 * A 30/70 horizontal split with a sidebar and an editor:
 * ```tsx
 * const [firstSize, setFirstSize] = useState(30);
 *
 * return (
 *   <SplitPane
 *     orientation="horizontal"
 *     firstSize={firstSize}
 *     onResize={setFirstSize}
 *     firstSubPane={<Sidebar />}
 *     secondSubPane={<Editor />}
 *   />
 * );
 * ```
 *
 * @example
 * A fixed (non-resizable) vertical split:
 * ```tsx
 * <SplitPane
 *   orientation="vertical"
 *   firstSize={70}
 *   disabled
 *   firstSubPane={<Preview />}
 *   secondSubPane={<Console />}
 * />
 * ```
 *
 * @see {@link SplitPaneProps} for full prop documentation.
 */
export const SplitPane: React.FC<SplitPaneProps> = ({
  firstSubPane,
  secondSubPane,
  orientation = DEFAULT_SPLIT_PANE_OPTIONS.orientation,
  firstSize,
  onResize,
  minSize = DEFAULT_SPLIT_PANE_OPTIONS.minSize,
  maxSize = DEFAULT_SPLIT_PANE_OPTIONS.maxSize,
  disabled = DEFAULT_SPLIT_PANE_OPTIONS.disabled,
  className = '',
  firstClassName,
  secondClassName,
  splitterClassName,
  a11y = {},
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const startSizeRef = useRef(firstSize);

  const handleResizeStart = useCallback((): void => {
    startSizeRef.current = firstSize;
  }, [firstSize]);

  const handleDragResize = useCallback(
    (deltaPixels: number): void => {
      if (!onResize || !containerRef.current) {
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const total = orientation === 'horizontal' ? rect.width : rect.height;
      if (total <= 0) {
        return;
      }

      const deltaPercent = (deltaPixels / total) * 100;
      const nextSize = clamp(
        startSizeRef.current + deltaPercent,
        minSize,
        maxSize,
      );
      onResize(nextSize);
    },
    [onResize, orientation, minSize, maxSize],
  );

  const handleKeyResize = useCallback(
    (deltaPercent: number): void => {
      if (!onResize) return;
      const nextSize = clamp(firstSize + deltaPercent, minSize, maxSize);
      onResize(nextSize);
    },
    [onResize, firstSize, minSize, maxSize],
  );

  const rootClasses = [
    styles.splitPane,
    orientation === 'horizontal'
      ? styles.splitPaneHorizontal
      : styles.splitPaneVertical,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const firstClasses = [styles.pane, firstClassName].filter(Boolean).join(' ');
  const secondClasses = [styles.pane, secondClassName]
    .filter(Boolean)
    .join(' ');

  const firstStyle: React.CSSProperties = { flex: `${firstSize} 1 0` };
  const secondStyle: React.CSSProperties = { flex: `${100 - firstSize} 1 0` };

  return (
    <div
      ref={containerRef}
      className={rootClasses}
      data-testid="split-pane"
      data-orientation={orientation}
      {...a11y}
    >
      <div
        className={firstClasses}
        style={firstStyle}
        data-testid="split-pane-first"
      >
        {firstSubPane}
      </div>
      <PaneSplitter
        orientation={orientation}
        disabled={disabled || !onResize}
        onResizeStart={handleResizeStart}
        onDragResize={handleDragResize}
        onKeyResize={handleKeyResize}
        ariaValueNow={Math.round(firstSize)}
        ariaValueMin={minSize}
        ariaValueMax={maxSize}
        className={splitterClassName}
      />
      <div
        className={secondClasses}
        style={secondStyle}
        data-testid="split-pane-second"
      >
        {secondSubPane}
      </div>
    </div>
  );
};
