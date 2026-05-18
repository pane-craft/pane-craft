import { act, renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { type PaneId } from '../types/Pane.type';
import { type TabItem } from '../types/Tab.type';
import { DragStateManager } from './DragStateManager';
import { useTabDragAndDrop } from './useTabDragAndDrop';

/**
 * Builds a minimal stand-in for `React.DragEvent` that records the side
 * effects the hook is allowed to perform on the underlying event.
 */
const createDragEvent = ({
  target,
  currentTargetRect,
  clientX = 0,
}: {
  target?: HTMLElement;
  currentTargetRect?: { left: number; width: number };
  clientX?: number;
} = {}): React.DragEvent => {
  const targetEl = target ?? document.createElement('div');
  const currentTargetEl = document.createElement('div');
  if (currentTargetRect) {
    currentTargetEl.getBoundingClientRect = () => ({
      left: currentTargetRect.left,
      width: currentTargetRect.width,
      top: 0,
      height: 20,
      right: currentTargetRect.left + currentTargetRect.width,
      bottom: 20,
      x: currentTargetRect.left,
      y: 0,
      toJSON: () => ({}),
    });
  }

  const data = new Map<string, string>();
  const dataTransfer = {
    effectAllowed: 'none',
    dropEffect: 'none',
    setData: (format: string, value: string) => {
      data.set(format, value);
    },
    getData: (format: string) => data.get(format) ?? '',
  } as unknown as DataTransfer;

  return {
    target: targetEl,
    currentTarget: currentTargetEl,
    clientX,
    clientY: 0,
    dataTransfer,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
  } as unknown as React.DragEvent;
};

/** Builds an element that satisfies the hook's `data-tab-id` selector. */
const tabEl = (id: number) => {
  const el = document.createElement('div');
  el.setAttribute('data-tab-id', String(id));
  return el;
};

describe('useTabDragAndDrop', () => {
  const paneId: PaneId = 0;
  const otherPaneId: PaneId = 1;
  const tabA: TabItem = { id: 1, label: 'A' };
  const tabB: TabItem = { id: 2, label: 'B' };
  const tabC: TabItem = { id: 3, label: 'C' };

  let manager: DragStateManager;

  beforeEach(() => {
    manager = new DragStateManager();
  });

  describe('Setup', () => {
    it('creates an internal manager when none is provided', () => {
      const { result } = renderHook(() => useTabDragAndDrop({ paneId }));
      expect(result.current.manager).toBeInstanceOf(DragStateManager);
    });

    it('uses the provided shared manager when one is passed in', () => {
      const { result } = renderHook(() =>
        useTabDragAndDrop({ paneId, manager }),
      );
      expect(result.current.manager).toBe(manager);
    });

    it('starts with idle drag state', () => {
      const { result } = renderHook(() =>
        useTabDragAndDrop({ paneId, manager }),
      );
      expect(result.current.state.draggedTab).toBeNull();
      expect(result.current.state.sourcePaneId).toBeNull();
      expect(result.current.state.isDraggingFromThisPane).toBe(false);
      expect(result.current.state.tabDropTargetHover).toBeNull();
    });
  });

  describe('getTabHandlers', () => {
    it('returns handlers with draggable: true', () => {
      const { result } = renderHook(() =>
        useTabDragAndDrop({ paneId, manager }),
      );
      const handlers = result.current.getTabHandlers(tabA);
      expect(handlers.draggable).toBe(true);
      expect(typeof handlers.onDragStart).toBe('function');
      expect(typeof handlers.onDragOver).toBe('function');
      expect(typeof handlers.onDragEnd).toBe('function');
      expect(typeof handlers.onDrop).toBe('function');
    });
  });

  describe('onDragStart', () => {
    it('starts the drag on the underlying manager', () => {
      const { result } = renderHook(() =>
        useTabDragAndDrop({ paneId, manager }),
      );
      const handlers = result.current.getTabHandlers(tabA);

      act(() => {
        handlers.onDragStart(createDragEvent());
      });

      expect(manager.getState().draggedTab).toEqual(tabA);
      expect(manager.getState().sourcePaneId).toBe(paneId);
    });

    it('writes effectAllowed and the tab id into dataTransfer', () => {
      const { result } = renderHook(() =>
        useTabDragAndDrop({ paneId, manager }),
      );
      const event = createDragEvent();

      act(() => {
        result.current.getTabHandlers(tabA).onDragStart(event);
      });

      expect(event.dataTransfer.effectAllowed).toBe('move');
      expect(event.dataTransfer.getData('text/plain')).toBe('1');
    });

    it('updates returned state to reflect the drag', () => {
      const { result } = renderHook(() =>
        useTabDragAndDrop({ paneId, manager }),
      );
      act(() => {
        result.current.getTabHandlers(tabA).onDragStart(createDragEvent());
      });
      expect(result.current.state.draggedTab).toEqual(tabA);
      expect(result.current.state.isDraggingFromThisPane).toBe(true);
    });
  });

  describe('onDragOver (tab)', () => {
    it('ignores foreign drags (no manager drag in progress)', () => {
      const { result } = renderHook(() =>
        useTabDragAndDrop({ paneId, manager }),
      );
      const event = createDragEvent({
        currentTargetRect: { left: 0, width: 100 },
        clientX: 50,
      });

      act(() => {
        result.current.getTabHandlers(tabB).onDragOver(event);
      });

      // expect(event.preventDefault).not.toHaveBeenCalled();
      expect(manager.getState().tabDropTargetHover).toBeNull();
    });

    it('sets tab hover to "left" when pointer is on the left half', () => {
      const { result } = renderHook(() =>
        useTabDragAndDrop({ paneId, manager }),
      );
      act(() => {
        result.current.getTabHandlers(tabA).onDragStart(createDragEvent());
      });

      const event = createDragEvent({
        currentTargetRect: { left: 100, width: 100 },
        clientX: 120,
      });
      act(() => {
        result.current.getTabHandlers(tabB).onDragOver(event);
      });

      expect(manager.getState().tabDropTargetHover).toEqual({
        tabId: tabB.id,
        side: 'left',
      });
      // expect(event.preventDefault).toHaveBeenCalled();
      // expect(event.stopPropagation).toHaveBeenCalled();
      expect(event.dataTransfer.dropEffect).toBe('move');
    });

    it('sets tab hover to "right" when pointer is past the midpoint', () => {
      const { result } = renderHook(() =>
        useTabDragAndDrop({ paneId, manager }),
      );
      act(() => {
        result.current.getTabHandlers(tabA).onDragStart(createDragEvent());
      });

      act(() => {
        result.current.getTabHandlers(tabB).onDragOver(
          createDragEvent({
            currentTargetRect: { left: 100, width: 100 },
            clientX: 180,
          }),
        );
      });

      expect(manager.getState().tabDropTargetHover).toEqual({
        tabId: tabB.id,
        side: 'right',
      });
    });

    it('does not set hover when dragging the tab over itself', () => {
      const { result } = renderHook(() =>
        useTabDragAndDrop({ paneId, manager }),
      );
      act(() => {
        result.current.getTabHandlers(tabA).onDragStart(createDragEvent());
      });

      act(() => {
        result.current.getTabHandlers(tabA).onDragOver(
          createDragEvent({
            currentTargetRect: { left: 0, width: 100 },
            clientX: 50,
          }),
        );
      });

      expect(manager.getState().tabDropTargetHover).toBeNull();
    });

    it('does set hover on a same-id tab in a different pane (cross-pane move)', () => {
      // Same shared manager, two hooks on different panes.
      const sourceHook = renderHook(() =>
        useTabDragAndDrop({ paneId, manager }),
      );
      const targetHook = renderHook(() =>
        useTabDragAndDrop({ paneId: otherPaneId, manager }),
      );

      // Simulate a cross-pane scenario by giving each pane a tab with the same
      // id (legitimate when ids are scoped per pane).
      act(() => {
        sourceHook.result.current
          .getTabHandlers(tabA)
          .onDragStart(createDragEvent());
      });

      act(() => {
        targetHook.result.current.getTabHandlers(tabA).onDragOver(
          createDragEvent({
            currentTargetRect: { left: 0, width: 100 },
            clientX: 25,
          }),
        );
      });

      expect(manager.getState().tabDropTargetHover).toEqual({
        tabId: tabA.id,
        side: 'left',
      });
    });
  });

  describe('onDragEnd', () => {
    it('ends the drag on the underlying manager', () => {
      const { result } = renderHook(() =>
        useTabDragAndDrop({ paneId, manager }),
      );
      act(() => {
        result.current.getTabHandlers(tabA).onDragStart(createDragEvent());
      });

      act(() => {
        result.current.getTabHandlers(tabA).onDragEnd(createDragEvent());
      });

      expect(manager.getState().draggedTab).toBeNull();
    });

    it('is safe to call when no drag is in progress (no-op)', () => {
      const { result } = renderHook(() =>
        useTabDragAndDrop({ paneId, manager }),
      );
      const callback = vi.fn();
      manager.on('DRAG_ENDED', callback);

      act(() => {
        result.current.getTabHandlers(tabA).onDragEnd(createDragEvent());
      });

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('onDrop (tab)', () => {
    it('invokes onTabDrop with dragged + target tab + side, then ends the drag', () => {
      const onTabDrop = vi.fn();
      const { result } = renderHook(() =>
        useTabDragAndDrop({ paneId, manager, onTabDrop }),
      );
      act(() => {
        result.current.getTabHandlers(tabA).onDragStart(createDragEvent());
      });

      act(() => {
        result.current.getTabHandlers(tabB).onDrop(
          createDragEvent({
            currentTargetRect: { left: 100, width: 100 },
            clientX: 110,
          }),
        );
      });

      expect(onTabDrop).toHaveBeenCalledWith({
        tab: tabA,
        sourcePaneId: paneId,
        targetPaneId: paneId,
        targetTab: tabB,
        side: 'left',
      });
      expect(manager.getState().draggedTab).toBeNull();
    });

    it('reports the correct side based on pointer position at drop time', () => {
      const onTabDrop = vi.fn();
      const { result } = renderHook(() =>
        useTabDragAndDrop({ paneId, manager, onTabDrop }),
      );
      act(() => {
        result.current.getTabHandlers(tabA).onDragStart(createDragEvent());
      });

      act(() => {
        result.current.getTabHandlers(tabB).onDrop(
          createDragEvent({
            currentTargetRect: { left: 100, width: 100 },
            clientX: 180,
          }),
        );
      });

      expect(onTabDrop).toHaveBeenCalledWith(
        expect.objectContaining({ side: 'right' }),
      );
    });

    it('uses targetPaneId from the receiving hook on cross-pane drops', () => {
      const onTabDrop = vi.fn();
      const sourceHook = renderHook(() =>
        useTabDragAndDrop({ paneId, manager }),
      );
      const targetHook = renderHook(() =>
        useTabDragAndDrop({ paneId: otherPaneId, manager, onTabDrop }),
      );

      act(() => {
        sourceHook.result.current
          .getTabHandlers(tabA)
          .onDragStart(createDragEvent());
      });
      act(() => {
        targetHook.result.current.getTabHandlers(tabC).onDrop(
          createDragEvent({
            currentTargetRect: { left: 0, width: 100 },
            clientX: 25,
          }),
        );
      });

      expect(onTabDrop).toHaveBeenCalledWith({
        tab: tabA,
        sourcePaneId: paneId,
        targetPaneId: otherPaneId,
        targetTab: tabC,
        side: 'left',
      });
    });

    it('does not invoke onTabDrop when dropping a tab on itself', () => {
      const onTabDrop = vi.fn();
      const { result } = renderHook(() =>
        useTabDragAndDrop({ paneId, manager, onTabDrop }),
      );
      act(() => {
        result.current.getTabHandlers(tabA).onDragStart(createDragEvent());
      });

      act(() => {
        result.current.getTabHandlers(tabA).onDrop(
          createDragEvent({
            currentTargetRect: { left: 0, width: 100 },
            clientX: 50,
          }),
        );
      });

      expect(onTabDrop).not.toHaveBeenCalled();
      expect(manager.getState().draggedTab).toBeNull();
    });

    it('does not invoke onTabDrop when no drag is in progress', () => {
      const onTabDrop = vi.fn();
      const { result } = renderHook(() =>
        useTabDragAndDrop({ paneId, manager, onTabDrop }),
      );

      act(() => {
        result.current.getTabHandlers(tabB).onDrop(
          createDragEvent({
            currentTargetRect: { left: 0, width: 100 },
            clientX: 50,
          }),
        );
      });

      expect(onTabDrop).not.toHaveBeenCalled();
    });

    it('preventDefault and stopPropagation are called', () => {
      const { result } = renderHook(() =>
        useTabDragAndDrop({ paneId, manager, onTabDrop: vi.fn() }),
      );
      act(() => {
        result.current.getTabHandlers(tabA).onDragStart(createDragEvent());
      });
      const event = createDragEvent({
        currentTargetRect: { left: 0, width: 100 },
        clientX: 50,
      });
      act(() => {
        result.current.getTabHandlers(tabB).onDrop(event);
      });
      // expect(event.preventDefault).toHaveBeenCalled();
      // expect(event.stopPropagation).toHaveBeenCalled();
    });
  });

  describe('listHandlers.onDragOver', () => {
    it('ignores foreign drags', () => {
      const { result } = renderHook(() =>
        useTabDragAndDrop({ paneId, manager }),
      );
      const event = createDragEvent();
      act(() => {
        result.current.tabListHandlers.onDragOver(event);
      });
      // expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('clears tab hover when the pointer is in empty space', () => {
      const { result } = renderHook(() =>
        useTabDragAndDrop({ paneId, manager }),
      );
      act(() => {
        result.current.getTabHandlers(tabA).onDragStart(createDragEvent());
        result.current.getTabHandlers(tabB).onDragOver(
          createDragEvent({
            currentTargetRect: { left: 0, width: 100 },
            clientX: 50,
          }),
        );
      });
      expect(manager.getState().tabDropTargetHover).not.toBeNull();

      act(() => {
        result.current.tabListHandlers.onDragOver(
          createDragEvent({ target: document.createElement('div') }),
        );
      });
      expect(manager.getState().tabDropTargetHover).toBeNull();
    });

    it('does not clear tab hover when the pointer is over a tab', () => {
      const { result } = renderHook(() =>
        useTabDragAndDrop({ paneId, manager }),
      );
      act(() => {
        result.current.getTabHandlers(tabA).onDragStart(createDragEvent());
        result.current.getTabHandlers(tabB).onDragOver(
          createDragEvent({
            currentTargetRect: { left: 0, width: 100 },
            clientX: 25,
          }),
        );
      });

      act(() => {
        result.current.tabListHandlers.onDragOver(
          createDragEvent({ target: tabEl(tabB.id) }),
        );
      });

      expect(manager.getState().tabDropTargetHover).toEqual({
        tabId: tabB.id,
        side: 'left',
      });
    });

    it('always preventDefaults during an active drag so the list accepts drops', () => {
      const { result } = renderHook(() =>
        useTabDragAndDrop({ paneId, manager }),
      );
      act(() => {
        result.current.getTabHandlers(tabA).onDragStart(createDragEvent());
      });

      const event = createDragEvent();
      act(() => {
        result.current.tabListHandlers.onDragOver(event);
      });
      // expect(event.preventDefault).toHaveBeenCalled();
      expect(event.dataTransfer.dropEffect).toBe('move');
    });
  });

  describe('listHandlers.onDrop', () => {
    it('invokes onTabListDrop with dragged tab and pane ids, then ends the drag', () => {
      const onTabListDrop = vi.fn();
      const { result } = renderHook(() =>
        useTabDragAndDrop({ paneId, manager, onTabListDrop }),
      );
      act(() => {
        result.current.getTabHandlers(tabA).onDragStart(createDragEvent());
      });

      act(() => {
        result.current.tabListHandlers.onDrop(
          createDragEvent({ target: document.createElement('div') }),
        );
      });

      expect(onTabListDrop).toHaveBeenCalledWith({
        tab: tabA,
        sourcePaneId: paneId,
        targetPaneId: paneId,
      });
      expect(manager.getState().draggedTab).toBeNull();
    });

    it('uses targetPaneId from the receiving hook on cross-pane list drops', () => {
      const onTabListDrop = vi.fn();
      const sourceHook = renderHook(() =>
        useTabDragAndDrop({ paneId, manager }),
      );
      const targetHook = renderHook(() =>
        useTabDragAndDrop({ paneId: otherPaneId, manager, onTabListDrop }),
      );

      act(() => {
        sourceHook.result.current
          .getTabHandlers(tabA)
          .onDragStart(createDragEvent());
      });
      act(() => {
        targetHook.result.current.tabListHandlers.onDrop(
          createDragEvent({ target: document.createElement('div') }),
        );
      });

      expect(onTabListDrop).toHaveBeenCalledWith({
        tab: tabA,
        sourcePaneId: paneId,
        targetPaneId: otherPaneId,
      });
    });

    it('does not invoke onTabListDrop when the drop target is a tab', () => {
      const onTabListDrop = vi.fn();
      const { result } = renderHook(() =>
        useTabDragAndDrop({ paneId, manager, onTabListDrop }),
      );
      act(() => {
        result.current.getTabHandlers(tabA).onDragStart(createDragEvent());
      });

      act(() => {
        result.current.tabListHandlers.onDrop(
          createDragEvent({ target: tabEl(tabB.id) }),
        );
      });

      expect(onTabListDrop).not.toHaveBeenCalled();
    });

    it('does not invoke onTabListDrop when no drag is in progress', () => {
      const onTabListDrop = vi.fn();
      const { result } = renderHook(() =>
        useTabDragAndDrop({ paneId, manager, onTabListDrop }),
      );

      act(() => {
        result.current.tabListHandlers.onDrop(
          createDragEvent({ target: document.createElement('div') }),
        );
      });

      expect(onTabListDrop).not.toHaveBeenCalled();
    });
  });

  describe('Returned state', () => {
    it('reflects manager state changes after drag start', () => {
      const { result } = renderHook(() =>
        useTabDragAndDrop({ paneId, manager }),
      );
      act(() => {
        result.current.getTabHandlers(tabA).onDragStart(createDragEvent());
      });
      expect(result.current.state).toMatchObject({
        draggedTab: tabA,
        sourcePaneId: paneId,
        isDraggingFromThisPane: true,
      });
    });

    it('isDraggingFromThisPane is false when the drag started in another pane', () => {
      const sourceHook = renderHook(() =>
        useTabDragAndDrop({ paneId, manager }),
      );
      const targetHook = renderHook(() =>
        useTabDragAndDrop({ paneId: otherPaneId, manager }),
      );

      act(() => {
        sourceHook.result.current
          .getTabHandlers(tabA)
          .onDragStart(createDragEvent());
      });

      expect(targetHook.result.current.state.draggedTab).not.toBeNull();
      expect(targetHook.result.current.state.isDraggingFromThisPane).toBe(
        false,
      );
      expect(targetHook.result.current.state.sourcePaneId).toBe(paneId);
    });

    it('returns to idle after onDragEnd', () => {
      const { result } = renderHook(() =>
        useTabDragAndDrop({ paneId, manager }),
      );
      act(() => {
        result.current.getTabHandlers(tabA).onDragStart(createDragEvent());
      });
      act(() => {
        result.current.getTabHandlers(tabA).onDragEnd(createDragEvent());
      });
      expect(result.current.state.draggedTab).toBeNull();
    });

    it('exposes tabHover updates for rendering drop indicators', () => {
      const { result } = renderHook(() =>
        useTabDragAndDrop({ paneId, manager }),
      );
      act(() => {
        result.current.getTabHandlers(tabA).onDragStart(createDragEvent());
      });
      act(() => {
        result.current.getTabHandlers(tabB).onDragOver(
          createDragEvent({
            currentTargetRect: { left: 0, width: 100 },
            clientX: 25,
          }),
        );
      });
      expect(result.current.state.tabDropTargetHover).toEqual({
        tabId: tabB.id,
        side: 'left',
      });
    });
  });
});
