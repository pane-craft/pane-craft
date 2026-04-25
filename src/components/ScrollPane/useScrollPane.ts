import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { DEFAULT_SCROLL_PANE_OPTIONS } from '../../config/defaults';
import { ScrollStateManager } from '../../state/ScrollStateManager';
import { type ScrollPaneOptions } from '../../types/ScrollPane.type';
import { type ScrollState } from '../../types/ScrollStateManager.type';

/**
 * React handlers to drive the scrollbar state manager from the DOM.
 */
export type ScrollPaneHandlers = {
  /** Attach to the viewport's native `onScroll`. */
  onScroll: () => void;
  /** Attach to the outer pane wrapper for auto-hide. */
  onMouseEnter: () => void;
  /** Attach to the outer pane wrapper for auto-hide. */
  onMouseLeave: () => void;
  /** Attach to the custom scrollbar track's `onClick`. */
  onTrackClick: (e: React.MouseEvent) => void;
  /** Attach to the custom scrollbar track's `onKeyDown`. */
  onTrackKeyDown: (e: React.KeyboardEvent) => void;
  /** Attach to the custom scrollbar thumb's `onMouseDown`. */
  onThumbMouseDown: (e: React.MouseEvent) => void;
};

/**
 * Scrollbar state with hover visibility.
 */
export type ScrollPaneViewState = ScrollState & {
  /**
   * Whether the scrollbar should be visible right now, taking into account
   * `autoHide`, hover, and drag state.
   */
  isScrollbarVisible: boolean;
};

/**
 * Return shape of {@link useScrollPane}.
 */
export type UseScrollPaneReturn = {
  /** Current scrollbar state (viewport/content sizes, thumb pos, flags). */
  state: ScrollPaneViewState;
  /** Event handlers for the viewport, track, and thumb elements. */
  handlers: ScrollPaneHandlers;
  /** Ref for the scrollable viewport element. */
  viewportRef: React.RefObject<HTMLDivElement | null>;
  /** Ref for the custom scrollbar track element. */
  trackRef: React.RefObject<HTMLDivElement | null>;
  /** Ref for the content wrapper element (used to measure `contentSize`). */
  contentRef: React.RefObject<HTMLDivElement | null>;
  /** The underlying state manager. */
  manager: ScrollStateManager;
};

/**
 * Holds the scroll state via {@link ScrollStateManager}, producing the refs,
 * event handlers, and derived state needed to render a {@link ScrollPane}.
 *
 * @remarks
 * A `ResizeObserver` watches both the viewport and the content wrapper and
 * pushes size changes into the manager. Native scroll events on the viewport
 * sync the manager's `scrollOffset`; drag/track interactions update the
 * manager, which then writes the resulting offset back to the DOM.
 *
 * For horizontal panes with `wheelToScroll` enabled, a native non-passive
 * wheel listener converts vertical wheel deltas into horizontal scrolls.
 *
 * @param options - Behavior options. See {@link ScrollPaneOptions}.
 *
 * @example
 * ```tsx
 * const { state, handlers, viewportRef, trackRef, contentRef } =
 *   useScrollPane({ orientation: 'vertical' });
 * ```
 */
export const useScrollPane = (
  options: ScrollPaneOptions = {},
): UseScrollPaneReturn => {
  const { orientation, trackClickMode, thumbSizeMin, autoHide, wheelToScroll } =
    { ...DEFAULT_SCROLL_PANE_OPTIONS, ...options };

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // A new manager is created when `orientation` or `thumbSizeMin` changes
  // so its derived state stays valid. These options are typically static.
  const manager = useMemo(
    () => new ScrollStateManager({ orientation, thumbSizeMin }),
    [orientation, thumbSizeMin],
  );

  const [scrollState, setScrollState] = useState<ScrollState>(() =>
    manager.getState(),
  );

  // Reset local state when the manager instance is replaced (using the "reset
  // state when prop changes" pattern).
  const [lastManager, setLastManager] = useState(manager);
  if (lastManager !== manager) {
    setLastManager(manager);
    setScrollState(manager.getState());
  }
  const [isHovered, setIsHovered] = useState(false);

  const isHorizontal = orientation === 'horizontal';

  useEffect(
    () =>
      manager.subscribe(() => {
        setScrollState(manager.getState());
      }),
    [manager],
  );

  // Measure viewport + content sizes
  useEffect(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) {
      return;
    }

    const measure = () => {
      const viewportSize = isHorizontal
        ? viewport.clientWidth
        : viewport.clientHeight;
      const contentSize = isHorizontal
        ? content.scrollWidth
        : content.scrollHeight;
      manager.updateSize(viewportSize, contentSize);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(content);
    return () => {
      observer.disconnect();
    };
  }, [manager, isHorizontal]);

  // Sync scroll offset from manager to the DOM
  useEffect(() => {
    const unsubscribe = manager.on('SCROLL_UPDATED', ({ payload }) => {
      const viewport = viewportRef.current;
      if (!viewport) {
        return;
      }

      const current = isHorizontal ? viewport.scrollLeft : viewport.scrollTop;
      if (current === payload.offset) {
        return;
      }

      if (isHorizontal) {
        viewport.scrollLeft = payload.offset;
      } else {
        viewport.scrollTop = payload.offset;
      }
    });
    return unsubscribe;
  }, [manager, isHorizontal]);

  // Horizontal wheel-to-scroll conversion
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !isHorizontal || !wheelToScroll) {
      return;
    }

    const onWheel = (e: WheelEvent) => {
      if (!manager.getState().hasOverflow) {
        return;
      }

      const delta = e.deltaY !== 0 ? e.deltaY : e.deltaX;
      if (delta === 0) {
        return;
      }

      e.preventDefault();
      viewport.scrollLeft += delta;
    };

    viewport.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      viewport.removeEventListener('wheel', onWheel);
    };
  }, [manager, isHorizontal, wheelToScroll]);

  const handleScroll = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    // While dragging, the manager owns the truth and writes to the viewport.
    if (manager.getState().isDragging) {
      return;
    }

    const offset = isHorizontal ? viewport.scrollLeft : viewport.scrollTop;
    if (offset !== manager.getState().scrollOffset) {
      manager.setScrollOffset(offset);
    }
  }, [manager, isHorizontal]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!manager.getState().isDragging) {
      setIsHovered(false);
    }
  }, [manager]);

  const handleTrackClick = useCallback(
    (e: React.MouseEvent) => {
      const track = trackRef.current;
      if (!track || e.target !== track) {
        return;
      }

      const rect = track.getBoundingClientRect();
      const clickCoord = isHorizontal
        ? e.clientX - rect.left
        : e.clientY - rect.top;
      manager.handleTrackClick(clickCoord, trackClickMode);
    },
    [manager, isHorizontal, trackClickMode],
  );

  const handleTrackKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const { scrollOffset, viewportSize, contentSize } = manager.getState();
      const maxOffset = Math.max(0, contentSize - viewportSize);
      const step = 40;
      const pageStep = viewportSize * 0.8;

      const keyToOffset: Record<string, number | undefined> = isHorizontal
        ? {
            ArrowLeft: scrollOffset - step,
            ArrowRight: scrollOffset + step,
            PageUp: scrollOffset - pageStep,
            PageDown: scrollOffset + pageStep,
            Home: 0,
            End: maxOffset,
          }
        : {
            ArrowUp: scrollOffset - step,
            ArrowDown: scrollOffset + step,
            PageUp: scrollOffset - pageStep,
            PageDown: scrollOffset + pageStep,
            Home: 0,
            End: maxOffset,
          };

      const next = keyToOffset[e.key];
      if (next === undefined) {
        return;
      }

      e.preventDefault();
      manager.setScrollOffset(next);
    },
    [manager, isHorizontal],
  );

  const handleThumbMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      manager.setDragging(true);

      const startCoord = isHorizontal ? e.clientX : e.clientY;
      let lastCoord = startCoord;

      const onMove = (moveEvent: MouseEvent) => {
        const coord = isHorizontal ? moveEvent.clientX : moveEvent.clientY;
        const delta = coord - lastCoord;
        lastCoord = coord;
        manager.handleDrag(delta);
      };

      const onUp = () => {
        manager.setDragging(false);
        setIsHovered(false);
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    },
    [manager, isHorizontal],
  );

  const isScrollbarVisible = scrollState.hasOverflow
    ? !autoHide || isHovered || scrollState.isDragging
    : false;

  return {
    state: { ...scrollState, isScrollbarVisible },
    handlers: {
      onScroll: handleScroll,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onTrackClick: handleTrackClick,
      onTrackKeyDown: handleTrackKeyDown,
      onThumbMouseDown: handleThumbMouseDown,
    },
    viewportRef,
    trackRef,
    contentRef,
    manager,
  };
};
