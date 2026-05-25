import { useCallback, useEffect, useMemo, useState } from 'react';

import { type TabId, type TabItem } from '../types/Tab.type';
import {
  type TabListHandlers,
  type TabSelectionHandlers,
  type UseTabListState,
} from '../types/useTabList.type';
import { TabStateManager } from './TabStateManager';

/**
 * Options accepted by {@link useTabList}.
 */
export type UseTabListOptions = {
  /**
   * External state manager.
   *
   * @remarks
   * Pass one in when the tab collection is owned outside the hook (e.g. when
   * several components need to share the same manager, or when the consumer
   * needs to seed state before mounting). If omitted, the hook creates its
   * own empty manager.
   */
  manager?: TabStateManager;
  /**
   * Called after a tab is activated via click or keyboard. Fires only on
   * actual state change — re-clicking the active tab does not invoke it.
   */
  onTabClick?: (tab: TabItem) => void;
  /**
   * Called after a tab is removed via the close button. Receives the tab as
   * it existed before removal.
   */
  onTabClose?: (tab: TabItem) => void;
};

/**
 * Return shape of {@link useTabList}.
 */
export type UseTabListReturn = {
  /** Derived view of the tab collection for rendering. */
  state: UseTabListState;
  /**
   * Builds the per-tab selection props (active flag, click, close). Spread or
   * destructure onto a wrapper element around each `<Tab />`.
   */
  getTabHandlers: (tab: TabItem) => TabSelectionHandlers;
  /** Handlers for the container that wraps the tab list (keyboard nav). */
  tabListHandlers: TabListHandlers;
  /** The underlying state manager. Exposed for advanced consumers. */
  manager: TabStateManager;
};

/**
 * Connects a {@link TabStateManager} to React, producing the derived tab
 * list and the event handlers needed to drive selection and keyboard
 * navigation.
 *
 * @remarks
 * The hook subscribes to the manager on mount and re-renders whenever the
 * manager notifies its subscribers. `state.tabs` is recomputed on every
 * state change by joining the manager's `order` and `itemMap`, giving a
 * ready-to-map array of `TabItem`s.
 *
 * Selection handlers (`getTabHandlers`) delegate to the manager:
 *
 * - `onClick` → `manager.setActive(tab.id)`
 * - `onClose` → `manager.removeTab(id)` (the manager then auto-adjusts
 *   the active id when the active tab is removed)
 *
 * Keyboard navigation uses *automatic activation*: arrow keys immediately
 * change the active tab rather than just moving focus. This matches the
 * behaviour expected in editor-style tab bars (VS Code, browsers) where
 * switching tabs reveals the associated panel right away.
 *
 * @param options - See {@link UseTabListOptions}.
 *
 * @example
 * ```tsx
 * const { state, getTabHandlers, listHandlers } = useTabList();
 *
 * return (
 *   <div {...listHandlers} tabIndex={0}>
 *     {state.tabs.map((tab) => {
 *       const selection = getTabHandlers(tab);
 *       return (
 *         <div key={tab.id} onClick={selection.onClick}>
 *           <Tab
 *             {...tab}
 *             isActive={selection.isActive}
 *             onClose={selection.onClose}
 *           />
 *         </div>
 *       );
 *     })}
 *   </div>
 * );
 * ```
 */
export const useTabList = (
  options: UseTabListOptions = {},
): UseTabListReturn => {
  const { manager: externalManager, onTabClick, onTabClose } = options;

  const internalManager = useMemo(
    () => externalManager ?? new TabStateManager(),
    [externalManager],
  );

  const [tabState, setTabState] = useState(() => internalManager.getState());

  // Reset local state when the manager instance is replaced.
  const [lastManager, setLastManager] = useState(internalManager);
  if (lastManager !== internalManager) {
    setLastManager(internalManager);
    setTabState(internalManager.getState());
  }

  useEffect(
    () =>
      internalManager.subscribe(() => {
        setTabState(internalManager.getState());
      }),
    [internalManager],
  );

  const handleTabClick = useCallback(
    (tab: TabItem) => {
      const previousActiveId = internalManager.getState().activeId;
      internalManager.setActive(tab.id);
      if (previousActiveId !== tab.id) {
        onTabClick?.(tab);
      }
    },
    [internalManager, onTabClick],
  );

  const handleTabClose = useCallback(
    (id: TabId) => {
      const tab = internalManager.getState().itemMap.get(id);
      if (tab === undefined) return;
      internalManager.removeTab(id);
      onTabClose?.(tab);
    },
    [internalManager, onTabClose],
  );

  const getTabHandlers = useCallback(
    (tab: TabItem): TabSelectionHandlers => ({
      isActive: tabState.activeId === tab.id,
      onClick: () => {
        handleTabClick(tab);
      },
      onClose: handleTabClose,
    }),
    [tabState.activeId, handleTabClick, handleTabClose],
  );

  const handleListKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const { order, activeId } = internalManager.getState();
      if (order.length === 0) return;

      const currentIndex = activeId !== null ? order.indexOf(activeId) : -1;
      let nextIndex: number | null = null;

      switch (e.key) {
        case 'ArrowLeft':
          nextIndex = currentIndex <= 0 ? order.length - 1 : currentIndex - 1;
          break;
        case 'ArrowRight':
          nextIndex =
            currentIndex === -1 || currentIndex === order.length - 1
              ? 0
              : currentIndex + 1;
          break;
        case 'Home':
          nextIndex = 0;
          break;
        case 'End':
          nextIndex = order.length - 1;
          break;
        default:
          return;
      }

      e.preventDefault();

      const nextId = order[nextIndex];
      if (nextId === activeId) {
        return;
      }

      // TabStateManager invariants guarantee every id in `order` is in `itemMap`.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const nextTab = internalManager.getState().itemMap.get(nextId)!;
      internalManager.setActive(nextId);
      onTabClick?.(nextTab);
    },
    [internalManager, onTabClick],
  );

  const tabListHandlers: TabListHandlers = useMemo(
    () => ({
      role: 'tablist',
      onKeyDown: handleListKeyDown,
    }),
    [handleListKeyDown],
  );

  // TabStateManager invariants guarantee every id in `order` has a matching
  // entry in `itemMap`, and that a non-null `activeId` is also a valid key.
  const tabList = tabState.order.map(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    (id) => tabState.itemMap.get(id)!,
  );

  const activeTab =
    tabState.activeId !== null
      ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        tabState.itemMap.get(tabState.activeId)!
      : null;

  const state: UseTabListState = {
    tabList,
    activeTab,
    activeId: tabState.activeId,
  };

  return {
    state,
    getTabHandlers,
    tabListHandlers,
    manager: internalManager,
  };
};
