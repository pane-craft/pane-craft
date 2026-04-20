import { describe, it, expect, beforeEach, vi } from 'vitest';

import { ScrollStateManager } from './ScrollStateManager';

describe('ScrollStateManager', () => {
  let manager: ScrollStateManager;

  beforeEach(() => {
    manager = new ScrollStateManager();
  });

  describe('Constructor', () => {
    it('initialises with sensible zero defaults', () => {
      const state = manager.getState();
      expect(state.scrollOffset).toBe(0);
      expect(state.viewportSize).toBe(0);
      expect(state.contentSize).toBe(0);
      expect(state.thumbSize).toBe(0);
      expect(state.thumbSizeMin).toBe(20);
      expect(state.thumbOffset).toBe(0);
      expect(state.hasOverflow).toBe(false);
      expect(state.isDragging).toBe(false);
    });

    it('respects orientation override', () => {
      const vertical = new ScrollStateManager({ orientation: 'vertical' });
      expect(vertical.getState().orientation).toBe('vertical');
    });

    it('defaults to horizontal orientation', () => {
      expect(manager.getState().orientation).toBe('horizontal');
    });

    it('respects a custom thumbSizeMin', () => {
      const customMin = new ScrollStateManager({ thumbSizeMin: 40 });

      customMin.updateSize(100, 1000);
      expect(customMin.getState().thumbSize).toBe(40);
    });
  });

  describe('updateSize', () => {
    describe('Overflow Detection', () => {
      it('detects overflow when content > viewport', () => {
        manager.updateSize(100, 200);
        expect(manager.getState().hasOverflow).toBe(true);
      });

      it('clears overflow when viewport >= content', () => {
        manager.updateSize(500, 200);
        expect(manager.getState().hasOverflow).toBe(false);
      });

      it('clears overflow when viewport equals content exactly', () => {
        manager.updateSize(200, 200);
        expect(manager.getState().hasOverflow).toBe(false);
      });
    });

    describe('Thumb Sizing', () => {
      it('calculates a proportional thumb size', () => {
        manager.updateSize(100, 200);
        expect(manager.getState().thumbSize).toBe(50);
      });

      it('enforces the default minimum thumb size of 20px', () => {
        manager.updateSize(100, 10000);
        expect(manager.getState().thumbSize).toBe(20);
      });

      it('sets thumbSize to 0 when there is no overflow', () => {
        manager.updateSize(500, 200);
        expect(manager.getState().thumbSize).toBe(0);
      });
    });

    describe('OVERFLOW_CHANGED event', () => {
      it('emits OVERFLOW_CHANGED when transitioning from no-overflow to overflow', () => {
        const callback = vi.fn();
        manager.on('OVERFLOW_CHANGED', callback);

        manager.updateSize(100, 200);
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(
          expect.objectContaining({ payload: { hasOverflow: true } }),
        );
      });

      it('emits OVERFLOW_CHANGED when transitioning from overflow to no-overflow', () => {
        const callback = vi.fn();
        manager.updateSize(100, 200);
        expect(manager.getState().hasOverflow).toBe(true);

        manager.on('OVERFLOW_CHANGED', callback);

        manager.updateSize(500, 200);
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(
          expect.objectContaining({ payload: { hasOverflow: false } }),
        );
      });

      it('does NOT emit OVERFLOW_CHANGED when overflow status is unchanged', () => {
        const callback = vi.fn();
        manager.updateSize(100, 200);
        expect(manager.getState().hasOverflow).toBe(true);

        manager.on('OVERFLOW_CHANGED', callback);

        manager.updateSize(100, 300);
        expect(manager.getState().hasOverflow).toBe(true);
        expect(callback).not.toHaveBeenCalled();
      });

      it('does NOT emit OVERFLOW_CHANGED when no-overflow remains no-overflow', () => {
        const callback = vi.fn();
        manager.on('OVERFLOW_CHANGED', callback);

        manager.updateSize(500, 100);
        expect(manager.getState().hasOverflow).toBe(false);
        manager.updateSize(600, 100);
        expect(manager.getState().hasOverflow).toBe(false);
        expect(callback).not.toHaveBeenCalled();
      });
    });
  });

  describe('setScrollOffset', () => {
    beforeEach(() => {
      // maxOffset = 200
      manager.updateSize(100, 300);
    });

    it('clamps negative values to 0', () => {
      manager.setScrollOffset(-50);
      expect(manager.getState().scrollOffset).toBe(0);
    });

    it('clamps values above maxOffset to maxOffset', () => {
      manager.setScrollOffset(999);
      expect(manager.getState().scrollOffset).toBe(200);
    });

    it('accepts a value exactly at maxOffset', () => {
      manager.setScrollOffset(200);
      expect(manager.getState().scrollOffset).toBe(200);
    });

    it('accepts a value exactly at 0', () => {
      manager.setScrollOffset(0);
      expect(manager.getState().scrollOffset).toBe(0);
    });

    it('calculates the correct thumb position at 50 % scroll', () => {
      manager.updateSize(100, 200);
      expect(manager.getState().thumbSize).toBe(50);

      manager.setScrollOffset(50);
      expect(manager.getState().thumbOffset).toBe(25);
    });

    it('places the thumb at 0 when offset is 0', () => {
      manager.setScrollOffset(0);
      expect(manager.getState().thumbOffset).toBe(0);
    });

    it('places the thumb at the end of the track when offset is maxOffset', () => {
      manager.setScrollOffset(200);

      const { thumbOffset, viewportSize, thumbSize } = manager.getState();
      expect(thumbOffset).toBeCloseTo(viewportSize - thumbSize, 5);
    });

    it('emits SCROLL_UPDATED with the clamped offset', () => {
      const callback = vi.fn();
      manager.on('SCROLL_UPDATED', callback);

      manager.setScrollOffset(999);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ payload: { offset: 200 } }),
      );
    });

    it('notifies state subscribers', () => {
      const sub = vi.fn();
      manager.subscribe(sub);

      manager.setScrollOffset(50);
      expect(sub).toHaveBeenCalled();
    });

    it('keeps thumbOffset at 0 when there is no overflow', () => {
      manager.updateSize(500, 100);
      expect(manager.getState().hasOverflow).toBe(false);

      manager.setScrollOffset(50);
      expect(manager.getState().thumbOffset).toBe(0);
      expect(manager.getState().scrollOffset).toBe(0);
    });
  });

  describe('handleTrackClick', () => {
    beforeEach(() => {
      manager.updateSize(100, 200);
    });

    it('jump mode: scrolls toward the clicked position', () => {
      manager.handleTrackClick(75, 'jump');
      expect(manager.getState().scrollOffset).toBeGreaterThan(0);
    });

    it('jump mode: clicking at track start (0) clamps to 0', () => {
      manager.handleTrackClick(0, 'jump');
      expect(manager.getState().scrollOffset).toBe(0);
    });

    it('increment mode: pages forward when clicking past the thumb', () => {
      manager.setScrollOffset(0);
      manager.handleTrackClick(80, 'increment');
      expect(manager.getState().scrollOffset).toBeGreaterThan(0);
    });

    it('increment mode: pages backward when clicking before the thumb', () => {
      manager.setScrollOffset(100);
      const prevOffset = manager.getState().scrollOffset;

      manager.handleTrackClick(0, 'increment');
      expect(manager.getState().scrollOffset).toBeLessThan(prevOffset);
    });

    it('silently exits when there is no overflow', () => {
      manager.updateSize(500, 100);
      expect(manager.getState().hasOverflow).toBe(false);

      manager.handleTrackClick(50, 'jump');
      expect(manager.getState().scrollOffset).toBe(0);
    });
  });

  describe('handleDrag', () => {
    beforeEach(() => {
      // thumbSize = 50
      // trackSpace = 50
      // maxOffset = 100
      // scrollRatio = 100/50 = 2
      manager.updateSize(100, 200);
    });

    it('translates positive drag delta to a positive scroll offset', () => {
      // scrollOffset = prevScrollOffset + (drag {10px} * scrollRatio {2})
      manager.handleDrag(10);
      expect(manager.getState().scrollOffset).toBeCloseTo(20);
    });

    it('translates negative drag delta to a negative scroll offset', () => {
      manager.setScrollOffset(50);
      manager.handleDrag(-10);
      expect(manager.getState().scrollOffset).toBeCloseTo(30);
    });

    it('clamps at the maximum offset when dragging past the end', () => {
      manager.handleDrag(10000);
      expect(manager.getState().scrollOffset).toBe(100);
    });

    it('clamps at 0 when dragging before the start', () => {
      manager.setScrollOffset(50);
      manager.handleDrag(-10000);
      expect(manager.getState().scrollOffset).toBe(0);
    });

    it('silently exits when there is no overflow', () => {
      manager.updateSize(500, 100);
      expect(manager.getState().hasOverflow).toBe(false);

      manager.handleDrag(50);
      expect(manager.getState().scrollOffset).toBe(0);
    });
  });

  describe('setDragging', () => {
    it('emits DRAG_STATE_CHANGED with isDragging: true', () => {
      const callback = vi.fn();
      manager.on('DRAG_STATE_CHANGED', callback);

      manager.setDragging(true);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ payload: { isDragging: true } }),
      );
    });

    it('emits DRAG_STATE_CHANGED with isDragging: false', () => {
      const callback = vi.fn();
      manager.on('DRAG_STATE_CHANGED', callback);

      manager.setDragging(false);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ payload: { isDragging: false } }),
      );
    });

    it('updates isDragging in state', () => {
      manager.setDragging(true);
      expect(manager.getState().isDragging).toBe(true);

      manager.setDragging(false);
      expect(manager.getState().isDragging).toBe(false);
    });

    it('notifies state subscribers', () => {
      const sub = vi.fn();
      manager.subscribe(sub);
      manager.setDragging(true);
      expect(sub).toHaveBeenCalled();
    });
  });
});
