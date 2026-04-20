import { describe, it, expect, beforeEach, vi } from 'vitest';

import { type PaneId } from '../types/Pane.type';
import { TabStateManager } from './TabStateManager';

describe('TabStateManager', () => {
  let manager: TabStateManager;
  const paneId: PaneId = 0;

  beforeEach(() => {
    manager = new TabStateManager({ paneId });
  });

  describe('Constructor', () => {
    it('initialises with an empty state', () => {
      const state = manager.getState();
      expect(state.order).toHaveLength(0);
      expect(state.activeId).toBeNull();
      expect(state.paneId).toBe(paneId);
    });

    it('accepts a pre-seeded itemMap', () => {
      const itemMap = new Map([
        [1, { id: 1, label: 'Tab 1' }],
        [2, { id: 2, label: 'Tab 2' }],
      ]);
      const seeded = new TabStateManager({
        itemMap,
        order: [1, 2],
        activeId: 1,
      });
      expect(seeded.getState().order).toEqual([1, 2]);
      expect(seeded.getState().activeId).toBe(1);
    });
  });

  describe('addTab', () => {
    it('auto-selects the first tab added', () => {
      manager.addTab({ id: 1, label: 'Tab 1' });
      expect(manager.getState().activeId).toBe(1);
    });

    it('appends to the end by default', () => {
      manager.addTab({ id: 1, label: 'Tab 1' });
      manager.addTab({ id: 2, label: 'Tab 2' });
      expect(manager.getState().order).toEqual([1, 2]);
    });

    it('inserts at a specified index', () => {
      manager.addTab({ id: 1, label: 'Tab 1' });
      manager.addTab({ id: 3, label: 'Tab 3' });
      manager.addTab({ id: 2, label: 'Tab 2' }, 1);
      expect(manager.getState().order).toEqual([1, 2, 3]);
    });

    it('auto-selects when autoSelect is true (default)', () => {
      manager.addTab({ id: 1, label: 'Tab 1' });
      manager.addTab({ id: 2, label: 'Tab 2' });
      expect(manager.getState().activeId).toBe(2);
    });

    it('does not change active tab when autoSelect is false', () => {
      manager.addTab({ id: 1, label: 'Tab 1' });
      manager.addTab({ id: 2, label: 'Tab 2' }, undefined, false);
      expect(manager.getState().activeId).toBe(1);
    });

    it('still selects when autoSelect is false but no tab is currently active', () => {
      manager.addTab({ id: 1, label: 'Tab 1' }, undefined, false);
      expect(manager.getState().activeId).toBe(1);
    });

    it('emits TAB_ADDED with the correct payload', () => {
      const callback = vi.fn();
      manager.on('TAB_ADDED', callback);

      manager.addTab({ id: 1, label: 'Test' });
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'TAB_ADDED',
          payload: { tab: { id: 1, label: 'Test' }, index: 0 },
        }),
      );
    });

    it('emits TAB_ADDED with the correct index when inserting mid-list', () => {
      const callback = vi.fn();
      manager.addTab({ id: 1, label: 'Tab 1' });
      manager.addTab({ id: 3, label: 'Tab 3' });
      manager.on('TAB_ADDED', callback);

      manager.addTab({ id: 2, label: 'Tab 2' }, 1);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: {
            tab: { id: 2, label: 'Tab 2' },
            index: 1,
          },
        }),
      );
    });

    it('notifies state subscribers', () => {
      const sub = vi.fn();
      manager.subscribe(sub);
      manager.addTab({ id: 1, label: 'Tab 1' });
      expect(sub).toHaveBeenCalled();
    });
  });

  describe('removeTab', () => {
    it('maintains the active tab when a different tab is removed', () => {
      manager.addTab({ id: 1, label: 'Tab 1' });
      manager.addTab({ id: 2, label: 'Tab 2' });
      manager.setActive(1);

      manager.removeTab(2);
      expect(manager.getState().activeId).toBe(1);
    });

    it('selects the adjacent tab when the active tab is removed', () => {
      manager.addTab({ id: 1, label: 'Tab 1' });
      manager.addTab({ id: 2, label: 'Tab 2' });
      manager.addTab({ id: 3, label: 'Tab 3' });
      manager.setActive(2);

      manager.removeTab(2);
      expect(manager.getState().activeId).toBe(3);
    });

    it('selects the previous tab when the last tab is removed', () => {
      manager.addTab({ id: 1, label: 'Tab 1' });
      manager.addTab({ id: 2, label: 'Tab 2' });
      manager.setActive(2);

      manager.removeTab(2);
      expect(manager.getState().activeId).toBe(1);
    });

    it('sets activeId to null when the only tab is removed', () => {
      manager.addTab({ id: 1, label: 'Tab 1' });
      manager.removeTab(1);
      expect(manager.getState().activeId).toBeNull();
      expect(manager.getState().order).toHaveLength(0);
    });

    it('removes the tab from the order array', () => {
      manager.addTab({ id: 1, label: 'Tab 1' });
      manager.addTab({ id: 2, label: 'Tab 2' });
      manager.removeTab(1);
      expect(manager.getState().order).toEqual([2]);
    });

    it('silently exits when the id does not exist', () => {
      manager.addTab({ id: 1, label: 'Tab 1' });
      manager.removeTab(999);
      expect(manager.getState().order).toHaveLength(1);
    });

    it('emits TAB_REMOVED with the correct nextActiveId', () => {
      const callback = vi.fn();
      manager.addTab({ id: 1, label: 'Tab 1' });
      manager.addTab({ id: 2, label: 'Tab 2' });
      manager.setActive(2);
      manager.on('TAB_REMOVED', callback);

      manager.removeTab(2);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: { id: 2, nextActiveId: 1 },
        }),
      );
    });

    it('emits TAB_REMOVED with nextActiveId: null when last tab removed', () => {
      const callback = vi.fn();
      manager.addTab({ id: 1, label: 'Tab 1' });
      manager.on('TAB_REMOVED', callback);

      manager.removeTab(1);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: { id: 1, nextActiveId: null },
        }),
      );
    });

    it('notifies state subscribers', () => {
      const sub = vi.fn();
      manager.addTab({ id: 1, label: 'Tab 1' });
      manager.subscribe(sub);
      manager.removeTab(1);
      expect(sub).toHaveBeenCalled();
    });
  });

  describe('setActive', () => {
    it('changes the active tab', () => {
      manager.addTab({ id: 1, label: 'Tab 1' });
      manager.addTab({ id: 2, label: 'Tab 2' });

      expect(manager.getState().activeId).toBe(2);
      manager.setActive(1);
      expect(manager.getState().activeId).toBe(1);
    });

    it('silently exits when the id does not exist in the collection', () => {
      manager.addTab({ id: 1, label: 'Tab 1' });
      manager.setActive(999);
      expect(manager.getState().activeId).toBe(1);
    });

    it('emits ACTIVE_TAB_CHANGED with the new id', () => {
      const callback = vi.fn();
      manager.addTab({ id: 1, label: 'Tab 1' });
      manager.addTab({ id: 2, label: 'Tab 2' });
      manager.on('ACTIVE_TAB_CHANGED', callback);

      manager.setActive(1);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ payload: { id: 1 } }),
      );
    });

    it('notifies state subscribers', () => {
      const sub = vi.fn();
      manager.addTab({ id: 1, label: 'Tab 1' });
      manager.subscribe(sub);
      manager.setActive(1);
      expect(sub).toHaveBeenCalled();
    });
  });

  describe('activeTab getter', () => {
    it('returns the active TabItem', () => {
      const tab = { id: 1, label: 'Tab 1' };
      manager.addTab(tab);
      expect(manager.activeTab).toEqual(tab);
    });

    it('returns null when there are no tabs', () => {
      expect(manager.activeTab).toBeNull();
    });

    it('reflects the most recently activated tab', () => {
      manager.addTab({ id: 1, label: 'Tab 1' });
      manager.addTab({ id: 2, label: 'Tab 2' });
      manager.setActive(1);
      expect(manager.activeTab?.id).toBe(1);
    });
  });

  describe('reorder', () => {
    it('updates the order array to the new sequence', () => {
      manager.addTab({ id: 1, label: 'Tab 1' });
      manager.addTab({ id: 2, label: 'Tab 2' });
      manager.addTab({ id: 3, label: 'Tab 3' });

      manager.reorder([3, 1, 2]);
      expect(manager.getState().order).toEqual([3, 1, 2]);
    });

    it('does not change the active tab', () => {
      manager.addTab({ id: 1, label: 'Tab 1' });
      manager.addTab({ id: 2, label: 'Tab 2' });
      manager.setActive(1);

      manager.reorder([2, 1]);
      expect(manager.getState().activeId).toBe(1);
    });

    it('silently exits when the new order length does not match', () => {
      manager.addTab({ id: 1, label: 'Tab 1' });
      manager.addTab({ id: 2, label: 'Tab 2' });

      manager.reorder([1]);
      expect(manager.getState().order).toEqual([1, 2]);
    });

    it('emits TABS_REORDERED with the new order', () => {
      const callback = vi.fn();
      manager.addTab({ id: 1, label: 'Tab 1' });
      manager.addTab({ id: 2, label: 'Tab 2' });
      manager.on('TABS_REORDERED', callback);

      manager.reorder([2, 1]);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ payload: { order: [2, 1] } }),
      );
    });

    it('notifies state subscribers', () => {
      const sub = vi.fn();
      manager.addTab({ id: 1, label: 'Tab 1' });
      manager.addTab({ id: 2, label: 'Tab 2' });
      manager.subscribe(sub);
      manager.reorder([2, 1]);
      expect(sub).toHaveBeenCalled();
    });
  });
});
