import { act, renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { createTabItemList } from '../dev-utils/test-react.util';
import { createTabManager } from '../dev-utils/test.util';
import { type TabItem } from '../types/Tab.type';
import { TabStateManager } from './TabStateManager';
import { useTabList } from './useTabList';

const keyEvent = (key: string): React.KeyboardEvent =>
  ({
    key,
    preventDefault: vi.fn(),
  }) as unknown as React.KeyboardEvent;

describe('useTabList', () => {
  const tabList: TabItem[] = createTabItemList(3);
  const invalidId = 999;

  let manager: TabStateManager;

  beforeEach(() => {
    manager = createTabManager(tabList, tabList[0].id);
  });

  describe('Manager Initialization', () => {
    it('creates an internal manager when none is provided', () => {
      const { result } = renderHook(() => useTabList());
      expect(result.current.manager).toBeInstanceOf(TabStateManager);
    });

    it('uses the provided external manager when one is passed in', () => {
      const { result } = renderHook(() => useTabList({ manager }));
      expect(result.current.manager).toBe(manager);
    });
  });

  describe('Initial State', () => {
    it('starts empty when the manager has no tabs', () => {
      const emptyManager = new TabStateManager();
      const { result } = renderHook(() =>
        useTabList({ manager: emptyManager }),
      );

      expect(result.current.state.tabList).toEqual([]);
      expect(result.current.state.activeTab).toBeNull();
      expect(result.current.state.activeId).toBeNull();
    });

    it('returns a manager with the pre-populated state', () => {
      const { result } = renderHook(() => useTabList({ manager }));

      expect(result.current.state.tabList).toEqual(tabList);
      expect(result.current.state.activeTab).toEqual(tabList[0]);
      expect(result.current.state.activeId).toBe(tabList[0].id);
    });
  });

  describe('State Confirmation', () => {
    it('returns tabs in the order tracked by the manager', () => {
      const { result } = renderHook(() => useTabList({ manager }));
      expect(result.current.state.tabList.map((t) => t.id)).toEqual([1, 2, 3]);
    });

    it('returns activeTab matching the active id', () => {
      const { result } = renderHook(() => useTabList({ manager }));

      expect(result.current.state.activeTab).toEqual(tabList[0]);
      expect(result.current.state.activeId).toBe(tabList[0].id);

      act(() => {
        manager.setActive(tabList[1].id);
      });

      expect(result.current.state.activeTab).toEqual(tabList[1]);
      expect(result.current.state.activeId).toBe(tabList[1].id);
    });
  });

  describe('Reactive Updates', () => {
    it('re-renders when a tab is added to the manager', () => {
      const emptyManager = new TabStateManager();
      const { result } = renderHook(() =>
        useTabList({ manager: emptyManager }),
      );

      expect(result.current.state.tabList).toEqual([]);

      act(() => {
        emptyManager.addTab(tabList[0]);
      });

      expect(result.current.state.tabList).toEqual([tabList[0]]);
      expect(result.current.state.activeId).toBe(tabList[0].id);
    });

    it('re-renders when a tab is removed from the manager', () => {
      const { result } = renderHook(() => useTabList({ manager }));

      expect(result.current.state.tabList.map((t) => t.id)).toEqual([1, 2, 3]);

      act(() => {
        manager.removeTab(tabList[1].id);
      });

      expect(result.current.state.tabList.map((t) => t.id)).toEqual([1, 3]);
    });

    it('re-renders when the active tab changes', () => {
      const { result } = renderHook(() => useTabList({ manager }));

      expect(result.current.state.activeId).toBe(tabList[0].id);
      expect(result.current.state.activeTab).toEqual(tabList[0]);

      act(() => {
        manager.setActive(tabList[2].id);
      });

      expect(result.current.state.activeId).toBe(tabList[2].id);
      expect(result.current.state.activeTab).toEqual(tabList[2]);
    });

    it('re-renders when tabs are reordered', () => {
      const { result } = renderHook(() => useTabList({ manager }));

      expect(result.current.state.tabList.map((t) => t.id)).toEqual([1, 2, 3]);

      act(() => {
        manager.reorder([tabList[2].id, tabList[0].id, tabList[1].id]);
      });

      expect(result.current.state.tabList.map((t) => t.id)).toEqual([3, 1, 2]);
    });
  });

  describe('Manager Reinitialization', () => {
    it('resets local state when a new external manager is passed in', () => {
      const firstManager = createTabManager(tabList.slice(0, 2));
      const secondManager = createTabManager([tabList[2]]);

      const { result, rerender } = renderHook(
        ({ mgr }: { mgr: TabStateManager }) => useTabList({ manager: mgr }),
        { initialProps: { mgr: firstManager } },
      );

      expect(result.current.state.tabList).toEqual(tabList.slice(0, 2));

      rerender({ mgr: secondManager });

      expect(result.current.state.tabList).toEqual([tabList[2]]);
      expect(result.current.state.activeId).toBe(tabList[2].id);
      expect(result.current.manager).toBe(secondManager);
    });

    it('continues to receive updates from the new manager after swap', () => {
      const firstManager = createTabManager([tabList[0]]);
      const secondManager = new TabStateManager();

      const { result, rerender } = renderHook(
        ({ mgr }: { mgr: TabStateManager }) => useTabList({ manager: mgr }),
        { initialProps: { mgr: firstManager } },
      );

      expect(result.current.state.tabList).toEqual([tabList[0]]);

      rerender({ mgr: secondManager });
      expect(result.current.state.tabList).toEqual([]);

      act(() => {
        secondManager.addTab(tabList[1]);
      });
      expect(result.current.state.tabList).toEqual([tabList[1]]);
    });
  });

  describe('getTabHandlers', () => {
    it('returns isActive=true for the currently active tab', () => {
      const { result } = renderHook(() => useTabList({ manager }));
      expect(result.current.getTabHandlers(tabList[0]).isActive).toBe(true);
    });

    it('returns isActive=false for non-active tabs', () => {
      const { result } = renderHook(() => useTabList({ manager }));
      expect(result.current.getTabHandlers(tabList[1]).isActive).toBe(false);
      expect(result.current.getTabHandlers(tabList[2]).isActive).toBe(false);
    });

    it('isActive reflects updates to the active tab over time', () => {
      const { result } = renderHook(() => useTabList({ manager }));

      act(() => {
        manager.setActive(tabList[1].id);
      });

      expect(result.current.getTabHandlers(tabList[0]).isActive).toBe(false);
      expect(result.current.getTabHandlers(tabList[1]).isActive).toBe(true);
      expect(result.current.getTabHandlers(tabList[2]).isActive).toBe(false);
    });

    it('returns onClick and onClose as functions', () => {
      const { result } = renderHook(() => useTabList({ manager }));
      const handlers = result.current.getTabHandlers(tabList[0]);

      expect(typeof handlers.onClick).toBe('function');
      expect(typeof handlers.onClose).toBe('function');
    });
  });

  describe('onClick (via getTabHandlers)', () => {
    it('activates the tab on the underlying manager', () => {
      const { result } = renderHook(() => useTabList({ manager }));

      act(() => {
        result.current.getTabHandlers(tabList[2]).onClick();
      });

      expect(manager.getState().activeId).toBe(tabList[2].id);
    });

    it('invokes onTabClick when the active tab actually changes', () => {
      const onTabClick = vi.fn();
      const { result } = renderHook(() => useTabList({ manager, onTabClick }));

      expect(onTabClick).not.toHaveBeenCalled();

      act(() => {
        result.current.getTabHandlers(tabList[1]).onClick();
      });

      expect(onTabClick).toHaveBeenCalledTimes(1);
      expect(onTabClick).toHaveBeenCalledWith(tabList[1]);
    });

    it('does NOT invoke onTabClick when re-clicking the already-active tab', () => {
      const onTabClick = vi.fn();
      const { result } = renderHook(() => useTabList({ manager, onTabClick }));

      act(() => {
        result.current.getTabHandlers(tabList[0]).onClick();
      });

      expect(onTabClick).not.toHaveBeenCalled();
    });

    it('does not throw when no onTabClick callback is provided', () => {
      const { result } = renderHook(() => useTabList({ manager }));

      expect(() => {
        act(() => {
          result.current.getTabHandlers(tabList[1]).onClick();
        });
      }).not.toThrow();
    });
  });

  describe('onClose (via getTabHandlers)', () => {
    it('removes the tab from the underlying manager', () => {
      const { result } = renderHook(() => useTabList({ manager }));

      expect(manager.getState().itemMap.has(tabList[1].id)).toBe(true);

      act(() => {
        result.current.getTabHandlers(tabList[1]).onClose(tabList[1].id);
      });

      expect(manager.getState().itemMap.has(tabList[1].id)).toBe(false);
      expect(manager.getState().order).not.toContain(tabList[1].id);
    });

    it('invokes onTabClose with the tab as it existed before removal', () => {
      const onTabClose = vi.fn();
      const { result } = renderHook(() => useTabList({ manager, onTabClose }));

      act(() => {
        result.current.getTabHandlers(tabList[0]).onClose(tabList[1].id);
      });

      expect(onTabClose).toHaveBeenCalledTimes(1);
      expect(onTabClose).toHaveBeenCalledWith(tabList[1]);
    });

    it('is a no-op when the tab id does not exist in the manager', () => {
      const onTabClose = vi.fn();
      const { result } = renderHook(() => useTabList({ manager, onTabClose }));

      act(() => {
        result.current.getTabHandlers(tabList[0]).onClose(invalidId);
      });

      expect(onTabClose).not.toHaveBeenCalled();
      expect(manager.getState().itemMap.size).toBe(3);
    });

    it('does not throw when no onTabClose callback is provided', () => {
      const { result } = renderHook(() => useTabList({ manager }));

      expect(() => {
        act(() => {
          result.current.getTabHandlers(tabList[0]).onClose(tabList[1].id);
        });
      }).not.toThrow();
    });
  });

  describe('tabListHandlers', () => {
    it('has role="tablist" for ARIA conformance', () => {
      const { result } = renderHook(() => useTabList({ manager }));
      expect(result.current.tabListHandlers.role).toBe('tablist');
    });

    it('exposes onKeyDown as a function', () => {
      const { result } = renderHook(() => useTabList({ manager }));
      expect(typeof result.current.tabListHandlers.onKeyDown).toBe('function');
    });
  });

  describe('Keyboard Navigation', () => {
    it('ArrowLeft moves to the previous tab', () => {
      manager.setActive(tabList[1].id);
      const { result } = renderHook(() => useTabList({ manager }));

      expect(manager.getState().activeId).toBe(tabList[1].id);

      act(() => {
        result.current.tabListHandlers.onKeyDown(keyEvent('ArrowLeft'));
      });

      expect(manager.getState().activeId).toBe(tabList[0].id);
    });

    it('ArrowLeft wraps from the first tab to the last', () => {
      const { result } = renderHook(() => useTabList({ manager }));

      expect(manager.getState().activeId).toBe(tabList[0].id);

      act(() => {
        result.current.tabListHandlers.onKeyDown(keyEvent('ArrowLeft'));
      });

      expect(manager.getState().activeId).toBe(tabList[2].id);
    });

    it('ArrowRight moves to the next tab', () => {
      const { result } = renderHook(() => useTabList({ manager }));

      expect(manager.getState().activeId).toBe(tabList[0].id);

      act(() => {
        result.current.tabListHandlers.onKeyDown(keyEvent('ArrowRight'));
      });

      expect(manager.getState().activeId).toBe(tabList[1].id);
    });

    it('ArrowRight wraps from the last tab to the first', () => {
      manager.setActive(tabList[2].id);
      const { result } = renderHook(() => useTabList({ manager }));

      expect(manager.getState().activeId).toBe(tabList[2].id);

      act(() => {
        result.current.tabListHandlers.onKeyDown(keyEvent('ArrowRight'));
      });

      expect(manager.getState().activeId).toBe(tabList[0].id);
    });

    it('Home jumps to the first tab', () => {
      manager.setActive(tabList[2].id);
      const { result } = renderHook(() => useTabList({ manager }));

      expect(manager.getState().activeId).toBe(tabList[2].id);

      act(() => {
        result.current.tabListHandlers.onKeyDown(keyEvent('Home'));
      });

      expect(manager.getState().activeId).toBe(tabList[0].id);
    });

    it('End jumps to the last tab', () => {
      const { result } = renderHook(() => useTabList({ manager }));

      expect(manager.getState().activeId).toBe(tabList[0].id);

      act(() => {
        result.current.tabListHandlers.onKeyDown(keyEvent('End'));
      });

      expect(manager.getState().activeId).toBe(tabList[2].id);
    });

    it('ArrowRight goes to the first tab when no tab is currently active', () => {
      const noActiveManager = new TabStateManager({
        order: tabList.slice(0, 2).map((t) => t.id),
        itemMap: new Map(tabList.slice(0, 2).map((t) => [t.id, t])),
        activeId: null,
      });
      const { result } = renderHook(() =>
        useTabList({ manager: noActiveManager }),
      );

      act(() => {
        result.current.tabListHandlers.onKeyDown(keyEvent('ArrowRight'));
      });

      expect(noActiveManager.getState().activeId).toBe(tabList[0].id);
    });

    it('ArrowLeft wraps to the last tab when no tab is currently active', () => {
      const noActiveManager = new TabStateManager({
        order: tabList.slice(0, 2).map((t) => t.id),
        itemMap: new Map(tabList.slice(0, 2).map((t) => [t.id, t])),
        activeId: null,
      });
      const { result } = renderHook(() =>
        useTabList({ manager: noActiveManager }),
      );

      act(() => {
        result.current.tabListHandlers.onKeyDown(keyEvent('ArrowLeft'));
      });

      expect(noActiveManager.getState().activeId).toBe(tabList[1].id);
    });

    it('is a no-op when the tab list is empty', () => {
      const emptyManager = new TabStateManager();
      const { result } = renderHook(() =>
        useTabList({ manager: emptyManager }),
      );
      const event = keyEvent('ArrowRight');

      act(() => {
        result.current.tabListHandlers.onKeyDown(event);
      });

      expect(emptyManager.getState().activeId).toBeNull();

      // `preventDefault` here is a vi.fn() mock with no `this` dependency, so
      // the unbound-method rule's loose-binding concern doesn't apply.
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('ignores keys other than ArrowLeft/ArrowRight/Home/End', () => {
      const onTabClick = vi.fn();
      const { result } = renderHook(() => useTabList({ manager, onTabClick }));
      const event = keyEvent('Tab');

      act(() => {
        result.current.tabListHandlers.onKeyDown(event);
      });

      expect(manager.getState().activeId).toBe(tabList[0].id);

      // `preventDefault` here is a vi.fn() mock with no `this` dependency, so
      // the unbound-method rule's loose-binding concern doesn't apply.
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(onTabClick).not.toHaveBeenCalled();
    });

    it('calls preventDefault on handled keys to suppress browser defaults', () => {
      const { result } = renderHook(() => useTabList({ manager }));
      const event = keyEvent('ArrowRight');

      // `preventDefault` here is a vi.fn() mock with no `this` dependency, so
      // the unbound-method rule's loose-binding concern doesn't apply.
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(event.preventDefault).not.toHaveBeenCalled();

      act(() => {
        result.current.tabListHandlers.onKeyDown(event);
      });

      // `preventDefault` here is a vi.fn() mock with no `this` dependency, so
      // the unbound-method rule's loose-binding concern doesn't apply.
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(event.preventDefault).toHaveBeenCalledTimes(1);
    });

    it('invokes onTabClick when keyboard navigation changes the active tab', () => {
      const onTabClick = vi.fn();
      const { result } = renderHook(() => useTabList({ manager, onTabClick }));

      expect(onTabClick).not.toHaveBeenCalled();

      act(() => {
        result.current.tabListHandlers.onKeyDown(keyEvent('End'));
      });

      expect(onTabClick).toHaveBeenCalledTimes(1);
      expect(onTabClick).toHaveBeenCalledWith(tabList[2]);
    });

    it('does not invoke onTabClick when navigation lands on the already-active tab', () => {
      const singleManager = createTabManager([tabList[0]]);
      const onTabClick = vi.fn();
      const { result } = renderHook(() =>
        useTabList({ manager: singleManager, onTabClick }),
      );

      act(() => {
        result.current.tabListHandlers.onKeyDown(keyEvent('ArrowLeft'));
      });

      expect(onTabClick).not.toHaveBeenCalled();
      expect(singleManager.getState().activeId).toBe(tabList[0].id);
    });

    it('does not throw when no onTabClick callback is provided', () => {
      const { result } = renderHook(() => useTabList({ manager }));
      expect(() => {
        act(() => {
          result.current.tabListHandlers.onKeyDown(keyEvent('ArrowRight'));
        });
      }).not.toThrow();
    });
  });

  describe('Subscription Cleanup', () => {
    it('unsubscribes from the manager when the hook unmounts', () => {
      const subscribers = (
        manager as unknown as { subscriberSet: Set<() => void> }
      ).subscriberSet;
      const before = subscribers.size;

      const { unmount } = renderHook(() => useTabList({ manager }));

      expect(subscribers.size).toBe(before + 1);

      unmount();

      expect(subscribers.size).toBe(before);
    });
  });
});
