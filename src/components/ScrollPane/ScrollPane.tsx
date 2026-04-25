import type React from 'react';
import { useId } from 'react';

import { DEFAULT_SCROLL_PANE_OPTIONS } from '../../config/defaults';
import '../../styles/tokens-primitive.css';
import '../../styles/tokens-semantic.css';
import { type BaseComponentProps } from '../../types/Base.type';
import { type ScrollPaneOptions } from '../../types/ScrollPane.type';
import styles from './ScrollPane.module.css';
import { useScrollPane } from './useScrollPane';

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

/**
 * A generic scrolling container with a custom, auto-hiding scrollbar.
 *
 * @remarks
 * Wraps arbitrary children in a scrollable viewport and renders a styled
 * track + thumb on top. Native browser scrolling drives the DOM; the
 * internal `ScrollStateManager` mirrors offset and size state to render the
 * custom thumb. Supports both `'horizontal'` and `'vertical'` orientations,
 * and optionally converts vertical wheel deltas into horizontal scrolling
 * for horizontal panes.
 *
 * @example
 * A horizontal scroll pane wrapping a tab list:
 * ```tsx
 * <ScrollPane orientation="horizontal" autoHide>
 *   {tabs.map((tab) => <Tab key={tab.id} {...tab} />)}
 * </ScrollPane>
 * ```
 *
 * @example
 * A vertical scroll pane with always-visible scrollbar:
 * ```tsx
 * <ScrollPane orientation="vertical" autoHide={false}>
 *   <LongDocument />
 * </ScrollPane>
 * ```
 *
 * @see {@link ScrollPaneProps} for full prop documentation.
 */
export const ScrollPane: React.FC<ScrollPaneProps> = ({
  children,
  orientation = DEFAULT_SCROLL_PANE_OPTIONS.orientation,
  trackClickMode = DEFAULT_SCROLL_PANE_OPTIONS.trackClickMode,
  thumbSizeMin = DEFAULT_SCROLL_PANE_OPTIONS.thumbSizeMin,
  autoHide = DEFAULT_SCROLL_PANE_OPTIONS.autoHide,
  wheelToScroll = DEFAULT_SCROLL_PANE_OPTIONS.wheelToScroll,
  className = '',
  a11y = {},
}) => {
  const { state, handlers, viewportRef, trackRef, contentRef } = useScrollPane({
    orientation,
    trackClickMode,
    thumbSizeMin,
    autoHide,
    wheelToScroll,
  });

  const viewportId = useId();

  const isHorizontal = orientation === 'horizontal';

  const paneClasses = [styles.scrollPane, className].filter(Boolean).join(' ');
  const viewportClasses = [
    styles.viewport,
    isHorizontal ? styles.viewportHorizontal : styles.viewportVertical,
  ].join(' ');
  const contentClasses = [
    styles.content,
    isHorizontal ? styles.contentHorizontal : styles.contentVertical,
  ].join(' ');
  const trackClasses = [
    styles.track,
    isHorizontal ? styles.trackHorizontal : styles.trackVertical,
    state.isScrollbarVisible && styles.trackVisible,
  ]
    .filter(Boolean)
    .join(' ');
  const thumbClasses = [
    styles.thumb,
    isHorizontal ? styles.thumbHorizontal : styles.thumbVertical,
  ].join(' ');

  const thumbStyle: React.CSSProperties = isHorizontal
    ? {
        width: `${state.thumbSize}px`,
        transform: `translateX(${state.thumbOffset}px)`,
      }
    : {
        height: `${state.thumbSize}px`,
        transform: `translateY(${state.thumbOffset}px)`,
      };

  return (
    <div
      className={paneClasses}
      data-testid="scroll-pane"
      data-orientation={orientation}
      onMouseEnter={handlers.onMouseEnter}
      onMouseLeave={handlers.onMouseLeave}
      {...a11y}
    >
      <div
        ref={viewportRef}
        id={viewportId}
        className={viewportClasses}
        data-testid="scroll-pane-viewport"
        onScroll={handlers.onScroll}
      >
        <div
          ref={contentRef}
          className={contentClasses}
          data-testid="scroll-pane-content"
        >
          {children}
        </div>
      </div>

      {state.hasOverflow && (
        <div
          ref={trackRef}
          className={trackClasses}
          data-testid="scroll-pane-track"
          onClick={handlers.onTrackClick}
          onKeyDown={handlers.onTrackKeyDown}
          role="scrollbar"
          tabIndex={0}
          aria-orientation={orientation}
          aria-valuemin={0}
          aria-valuemax={Math.max(0, state.contentSize - state.viewportSize)}
          aria-valuenow={state.scrollOffset}
          aria-controls={viewportId}
        >
          <div
            className={thumbClasses}
            style={thumbStyle}
            data-testid="scroll-pane-thumb"
            onMouseDown={handlers.onThumbMouseDown}
            role="presentation"
          />
        </div>
      )}
    </div>
  );
};
