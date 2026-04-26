import { describe, it, expect, beforeEach, vi } from 'vitest';

import { type PaneId } from '../types/Pane.type';
import { type TabItem } from '../types/Tab.type';
import { DragStateManager } from './DragStateManager';

describe('DragStateManager', () => {
  let manager: DragStateManager;
  const sourcePaneId: PaneId = 0;
  const tabA: TabItem = { id: 1, label: 'A' };
  const tabB: TabItem = { id: 2, label: 'B' };

  beforeEach(() => {
    manager = new DragStateManager();
  });

  describe('Constructor', () => {
    it('initialises in the idle state', () => {
      const state = manager.getState();
      expect(state.draggedTab).toBeNull();
      expect(state.sourcePaneId).toBeNull();
      expect(state.tabDropTargetHover).toBeNull();
      expect(state.dropZoneHover).toBeNull();
    });

    it('accepts an in-flight initial state', () => {
      const seeded = new DragStateManager({
        draggedTab: tabA,
        sourcePaneId: 7,
      });
      const state = seeded.getState();
      expect(state.draggedTab).toEqual(tabA);
      expect(state.sourcePaneId).toBe(7);
    });
  });

  describe('start', () => {
    it('captures the dragged tab and source pane', () => {
      manager.start(tabA, sourcePaneId);
      const state = manager.getState();
      expect(state.draggedTab).toEqual(tabA);
      expect(state.sourcePaneId).toBe(sourcePaneId);
    });

    it('clears any previous hover state', () => {
      manager.start(tabA, sourcePaneId);
      manager.setTabHover({ tabId: 99, side: 'left' });
      manager.setZoneHover({ paneId: 3, pos: 'center' });

      manager.start(tabB, 1);
      const state = manager.getState();
      expect(state.tabDropTargetHover).toBeNull();
      expect(state.dropZoneHover).toBeNull();
      expect(state.draggedTab).toEqual(tabB);
      expect(state.sourcePaneId).toBe(1);
    });

    it('emits DRAG_STARTED with the tab and source pane', () => {
      const callback = vi.fn();
      manager.on('DRAG_STARTED', callback);

      manager.start(tabA, sourcePaneId);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'DRAG_STARTED',
          payload: { tab: tabA, sourcePaneId },
        }),
      );
    });

    it('notifies state subscribers', () => {
      const sub = vi.fn();
      manager.subscribe(sub);
      manager.start(tabA, sourcePaneId);
      expect(sub).toHaveBeenCalled();
    });
  });

  describe('end', () => {
    it('resets all drag state', () => {
      manager.start(tabA, sourcePaneId);
      manager.setTabHover({ tabId: 5, side: 'right' });
      manager.setZoneHover({ paneId: 2, pos: 'top' });

      manager.end();
      const state = manager.getState();
      expect(state.draggedTab).toBeNull();
      expect(state.sourcePaneId).toBeNull();
      expect(state.tabDropTargetHover).toBeNull();
      expect(state.dropZoneHover).toBeNull();
    });

    it('emits DRAG_ENDED carrying the tab and source pane that were dragged', () => {
      const callback = vi.fn();
      manager.start(tabA, sourcePaneId);
      manager.on('DRAG_ENDED', callback);

      manager.end();
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'DRAG_ENDED',
          payload: { tab: tabA, sourcePaneId },
        }),
      );
    });

    it('silently exits when no drag is in progress', () => {
      const callback = vi.fn();
      const sub = vi.fn();
      manager.on('DRAG_ENDED', callback);
      manager.subscribe(sub);

      manager.end();
      expect(callback).not.toHaveBeenCalled();
      expect(sub).not.toHaveBeenCalled();
    });

    it('notifies state subscribers', () => {
      manager.start(tabA, sourcePaneId);
      const sub = vi.fn();
      manager.subscribe(sub);

      manager.end();
      expect(sub).toHaveBeenCalled();
    });
  });

  describe('setTabHover', () => {
    beforeEach(() => {
      manager.start(tabA, sourcePaneId);
    });

    it('updates the tab hover target', () => {
      manager.setTabHover({ tabId: 5, side: 'left' });
      expect(manager.getState().tabDropTargetHover).toEqual({
        tabId: 5,
        side: 'left',
      });
    });

    it('clears the tab hover when passed null', () => {
      manager.setTabHover({ tabId: 5, side: 'left' });
      manager.setTabHover(null);
      expect(manager.getState().tabDropTargetHover).toBeNull();
    });

    it('does not affect zone hover state', () => {
      manager.setZoneHover({ paneId: 3, pos: 'center' });
      manager.setTabHover({ tabId: 5, side: 'right' });
      expect(manager.getState().dropZoneHover).toEqual({
        paneId: 3,
        pos: 'center',
      });
    });

    it('emits TAB_HOVER_CHANGED with the new value', () => {
      const callback = vi.fn();
      manager.on('TAB_HOVER_CHANGED', callback);

      manager.setTabHover({ tabId: 5, side: 'left' });
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'TAB_HOVER_CHANGED',
          payload: { hover: { tabId: 5, side: 'left' } },
        }),
      );
    });

    it('emits TAB_HOVER_CHANGED with null when clearing', () => {
      const callback = vi.fn();
      manager.setTabHover({ tabId: 5, side: 'right' });
      manager.on('TAB_HOVER_CHANGED', callback);

      manager.setTabHover(null);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ payload: { hover: null } }),
      );
    });

    it('notifies state subscribers', () => {
      const sub = vi.fn();
      manager.subscribe(sub);
      manager.setTabHover({ tabId: 5, side: 'left' });
      expect(sub).toHaveBeenCalled();
    });

    it('silently exits when no drag is in progress', () => {
      const idle = new DragStateManager();
      const callback = vi.fn();
      const sub = vi.fn();
      idle.on('TAB_HOVER_CHANGED', callback);
      idle.subscribe(sub);

      idle.setTabHover({ tabId: 5, side: 'left' });
      expect(idle.getState().tabDropTargetHover).toBeNull();
      expect(callback).not.toHaveBeenCalled();
      expect(sub).not.toHaveBeenCalled();
    });
  });

  describe('setZoneHover', () => {
    beforeEach(() => {
      manager.start(tabA, sourcePaneId);
    });

    it('updates the zone hover target', () => {
      manager.setZoneHover({ paneId: 3, pos: 'right' });
      expect(manager.getState().dropZoneHover).toEqual({
        paneId: 3,
        pos: 'right',
      });
    });

    it('clears the zone hover when passed null', () => {
      manager.setZoneHover({ paneId: 3, pos: 'right' });
      manager.setZoneHover(null);
      expect(manager.getState().dropZoneHover).toBeNull();
    });

    it('does not affect tab hover state', () => {
      manager.setTabHover({ tabId: 5, side: 'right' });
      manager.setZoneHover({ paneId: 3, pos: 'top' });
      expect(manager.getState().tabDropTargetHover).toEqual({
        tabId: 5,
        side: 'right',
      });
    });

    it('emits ZONE_HOVER_CHANGED with the new value', () => {
      const callback = vi.fn();
      manager.on('ZONE_HOVER_CHANGED', callback);

      manager.setZoneHover({ paneId: 3, pos: 'bottom' });
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'ZONE_HOVER_CHANGED',
          payload: { hover: { paneId: 3, pos: 'bottom' } },
        }),
      );
    });

    it('emits ZONE_HOVER_CHANGED with null when clearing', () => {
      const callback = vi.fn();
      manager.setZoneHover({ paneId: 3, pos: 'left' });
      manager.on('ZONE_HOVER_CHANGED', callback);

      manager.setZoneHover(null);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ payload: { hover: null } }),
      );
    });

    it('notifies state subscribers', () => {
      const sub = vi.fn();
      manager.subscribe(sub);
      manager.setZoneHover({ paneId: 3, pos: 'center' });
      expect(sub).toHaveBeenCalled();
    });

    it('silently exits when no drag is in progress', () => {
      const idle = new DragStateManager();
      const callback = vi.fn();
      const sub = vi.fn();
      idle.on('ZONE_HOVER_CHANGED', callback);
      idle.subscribe(sub);

      idle.setZoneHover({ paneId: 3, pos: 'center' });
      expect(idle.getState().dropZoneHover).toBeNull();
      expect(callback).not.toHaveBeenCalled();
      expect(sub).not.toHaveBeenCalled();
    });
  });

  describe('lifecycle integration', () => {
    it('end() after start() then setTabHover() emits DRAG_ENDED with original tab', () => {
      const callback = vi.fn();
      manager.start(tabA, sourcePaneId);
      manager.setTabHover({ tabId: 9, side: 'left' });
      manager.on('DRAG_ENDED', callback);

      manager.end();
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: { tab: tabA, sourcePaneId },
        }),
      );
    });

    it('start() called twice without end() does NOT emit DRAG_ENDED for the first', () => {
      const callback = vi.fn();
      manager.start(tabA, sourcePaneId);
      manager.on('DRAG_ENDED', callback);

      manager.start(tabB, 1);
      expect(callback).not.toHaveBeenCalled();
    });

    it('start() called twice without end() overwrites the in-flight tab', () => {
      manager.start(tabA, sourcePaneId);
      manager.start(tabB, 1);
      const state = manager.getState();
      expect(state.draggedTab).toEqual(tabB);
      expect(state.sourcePaneId).toBe(1);
    });
  });
});
