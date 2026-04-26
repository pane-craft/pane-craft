import { useCallback, useEffect, useMemo, useState } from 'react';

import { type PaneId } from '../types/Pane.type';
import { type TabDropTargetSide, type TabItem } from '../types/Tab.type';
import {
  type TabDragHandlers,
  type TabListDragHandlers,
  type TabDropPayload,
  type TabListDropPayload,
  type UseTabDragAndDropState,
} from '../types/useTabDragAndDrop.type';
import { DragStateManager } from './DragStateManager';

/**
 * Options accepted by {@link useTabDragAndDrop}.
 */
export type UseTabDragAndDropOptions = {
  /** Identifier of the pane this hook is wired to. */
  paneId: PaneId;
  /**
   * Shared drag state manager.
   *
   * @remarks
   * Cross-pane drag-and-drop requires every participating pane to use the
   * same {@link DragStateManager} instance — typically created once in a
   * provider near the top of the tree and threaded through. If omitted, the
   * hook creates its own internal manager scoped to a single pane.
   */
  manager?: DragStateManager;
  /**
   * Called when a dragged tab is dropped on top of another tab in this pane.
   * The consumer typically translates this into a reorder/move operation.
   */
  onTabDrop?: (data: TabDropPayload) => void;
  /**
   * Called when a dragged tab is dropped on the empty space inside this
   * pane's tab list. Conventionally treated as "append to the end".
   */
  onTabListDrop?: (data: TabListDropPayload) => void;
};

/**
 * Return shape of {@link useTabDragAndDrop}.
 */
export type UseTabDragAndDropReturn = {
  /** Derived drag state for rendering. */
  state: UseTabDragAndDropState;
  /**
   * Builds the set of HTML5 drag event handlers for an individual tab. Spread
   * the returned object onto the tab element.
   */
  getTabHandlers: (tab: TabItem) => TabDragHandlers;
  /** Drag event handlers for the tab list container. */
  tabListHandlers: TabListDragHandlers;
  /** The underlying state manager. Exposed for advanced consumers. */
  manager: DragStateManager;
};

/**
 * Connects a {@link DragStateManager} to React, producing event handlers for
 * tab and tab-list DOM elements.
 *
 * @remarks
 * The hook is sends DOM events into the manager and exposes drag state for
 * rendering, but it doesn't decide what a drop means. The consumer wires up
 * `onTabDrop` and `onListDrop` to perform the reorder/move logic on its tabs.
 *
 * Lifecycle of a drag:
 *
 * 1. `onDragStart` — calls {@link DragStateManager.start} and writes the tab
 *    id into `dataTransfer` so the browser treats the gesture as a valid
 *    drag.
 * 2. `onDragOver` (tab) — measures pointer position relative to the tab,
 *    computes the `'left'`/`'right'` side, and pushes it into the manager.
 *    Also calls `preventDefault()` so the element accepts a drop.
 * 3. `onDragOver` (list) — clears the tab hover when the pointer moves into
 *    empty space around the tabs.
 * 4. `onDrop` (tab) — fires `onTabDrop` with the dragged tab, target tab,
 *    and side, then calls {@link DragStateManager.end}.
 * 5. `onDrop` (list) — fires `onListDrop`, then calls
 *    {@link DragStateManager.end}.
 * 6. `onDragEnd` — always called by the browser after a drag completes
 *    (drop or cancel). Calls {@link DragStateManager.end} as a safety net;
 *    the second call is a no-op if a drop already ended the drag.
 *
 * Self-drop guards: dragging a tab onto itself does not fire the tab hover
 * (no drop indicator on the source tab) and does not invoke the consumer's
 * drop callback.
 *
 * Other drags (e.g. files dragged in from the OS) are ignored — the hook only
 * calls `preventDefault()` while one of its own drags is in flight, so the
 * browser handles unrelated drags through its default behaviour.
 *
 * @param options - See {@link UseTabDragAndDropOptions}.
 *
 * @example
 * ```tsx
 * const { state, getTabHandlers, listHandlers } = useTabDragAndDrop({
 *   paneId: 0,
 *   onTabDrop: ({ tab, targetTab, side }) => reorder(tab, targetTab, side),
 *   onListDrop: ({ tab }) => appendToEnd(tab),
 * });
 *
 * return (
 *   <div {...listHandlers}>
 *     {tabs.map((tab) => (
 *       <Tab
 *         key={tab.id}
 *         {...tab}
 *         isDragged={state.draggedTab?.id === tab.id}
 *         dropTargetSide={
 *           state.tabHover?.tabId === tab.id ? state.tabHover.side : null
 *         }
 *         {...getTabHandlers(tab)}
 *       />
 *     ))}
 *   </div>
 * );
 * ```
 */
export const useTabDragAndDrop = (
  options: UseTabDragAndDropOptions,
): UseTabDragAndDropReturn => {
  const {
    paneId,
    manager: externalManager,
    onTabDrop,
    onTabListDrop,
  } = options;

  const internalManager = useMemo(
    () => externalManager ?? new DragStateManager(),
    [externalManager],
  );

  const [dragState, setDragState] = useState(() => internalManager.getState());

  // Reset local state when the manager instance is replaced.
  const [lastManager, setLastManager] = useState(internalManager);
  if (lastManager !== internalManager) {
    setLastManager(internalManager);
    setDragState(internalManager.getState());
  }

  useEffect(
    () =>
      internalManager.subscribe(() => {
        setDragState(internalManager.getState());
      }),
    [internalManager],
  );

  const handleTabDragStart = useCallback(
    (e: React.DragEvent, tab: TabItem) => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(tab.id));
      internalManager.start(tab, paneId);
    },
    [internalManager, paneId],
  );

  const handleTabDragOver = useCallback(
    (e: React.DragEvent, tab: TabItem) => {
      if (internalManager.getState().draggedTab === null) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'move';

      const { draggedTab, sourcePaneId } = internalManager.getState();
      if (draggedTab?.id === tab.id && sourcePaneId === paneId) {
        return;
      }

      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const midpoint = rect.left + rect.width / 2;
      const side: TabDropTargetSide = e.clientX < midpoint ? 'left' : 'right';

      internalManager.setTabHover({ tabId: tab.id, side });
    },
    [internalManager, paneId],
  );

  const handleTabDragEnd = useCallback(() => {
    internalManager.end();
  }, [internalManager]);

  const handleTabDrop = useCallback(
    (e: React.DragEvent, targetTab: TabItem) => {
      e.preventDefault();
      e.stopPropagation();

      const { draggedTab, sourcePaneId } = internalManager.getState();
      if (draggedTab === null || sourcePaneId === null) {
        internalManager.end();
        return;
      }

      if (draggedTab.id === targetTab.id && sourcePaneId === paneId) {
        internalManager.end();
        return;
      }

      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const midpoint = rect.left + rect.width / 2;
      const side: TabDropTargetSide = e.clientX < midpoint ? 'left' : 'right';

      onTabDrop?.({
        tab: draggedTab,
        sourcePaneId,
        targetPaneId: paneId,
        targetTab,
        side,
      });
      internalManager.end();
    },
    [internalManager, paneId, onTabDrop],
  );

  const handleListDragOver = useCallback(
    (e: React.DragEvent) => {
      if (!internalManager.getState().draggedTab) {
        return;
      }

      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';

      const target = e.target as HTMLElement;
      const isOverTab = target.closest('[data-tab-id]') !== null;
      if (!isOverTab && internalManager.getState().tabDropTargetHover) {
        internalManager.setTabHover(null);
      }
    },
    [internalManager],
  );

  const handleListDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();

      const { draggedTab, sourcePaneId } = internalManager.getState();
      if (draggedTab === null || sourcePaneId === null) {
        internalManager.end();
        return;
      }

      // Additional check that tab isn't being dropped onto for tab list drop.
      // Tab-level onDrop calls stopPropagation, so reaching here means the
      // drop happened on empty space.
      const target = e.target as HTMLElement;
      const isOverTab = target.closest('[data-tab-id]') !== null;
      if (isOverTab) {
        return;
      }

      onTabListDrop?.({
        tab: draggedTab,
        sourcePaneId,
        targetPaneId: paneId,
      });
      internalManager.end();
    },
    [internalManager, paneId, onTabListDrop],
  );

  const getTabHandlers = useCallback(
    (tab: TabItem): TabDragHandlers => ({
      draggable: true,
      onDragStart: (e) => {
        handleTabDragStart(e, tab);
      },
      onDragOver: (e) => {
        handleTabDragOver(e, tab);
      },
      onDragEnd: handleTabDragEnd,
      onDrop: (e) => {
        handleTabDrop(e, tab);
      },
    }),
    [handleTabDragStart, handleTabDragOver, handleTabDragEnd, handleTabDrop],
  );

  const tabListHandlers: TabListDragHandlers = useMemo(
    () => ({
      onDragOver: handleListDragOver,
      onDrop: handleListDrop,
    }),
    [handleListDragOver, handleListDrop],
  );

  const state: UseTabDragAndDropState = {
    draggedTab: dragState.draggedTab,
    sourcePaneId: dragState.sourcePaneId,
    isDraggingFromThisPane:
      dragState.draggedTab !== null && dragState.sourcePaneId === paneId,
    tabDropTargetHover: dragState.tabDropTargetHover,
  };

  return {
    state,
    getTabHandlers,
    tabListHandlers,
    manager: internalManager,
  };
};
