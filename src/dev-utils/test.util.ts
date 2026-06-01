/**
 * Utility functions intended only for testing and not to be included in any
 * final builds.
 */
import { TabStateManager } from '../state/TabStateManager';
import {
  type TabId,
  type TabDropTargetSide,
  type TabItem,
} from '../types/Tab.type';

/**
 * Generates a "Lorem Ipsum" string of exactly n characters.
 *
 * @param n - The desired length of the resulting string.
 * @returns A string of length n composed of repeating Lorem Ipsum text.
 */
export const createLoremIpsumText = (n: number): string => {
  if (n <= 0) {
    return '';
  }

  const baseText =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
    'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ' +
    'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris ' +
    'nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in ' +
    'reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla ' +
    'pariatur. Excepteur sint occaecat cupidatat non proident, sunt in ' +
    'culpa qui officia deserunt mollit anim id est laborum. ';

  const repeatCount = Math.ceil(n / baseText.length);
  return baseText.repeat(repeatCount).slice(0, n);
};

/**
 * A function for creating a tab manager with the specified tabs.
 *
 * @param tabList - A list of {@link TabItem}s to use with the manager.
 * @param activeId - Optional tab id to set as active.
 * @returns A {@link TabStateManager} object.
 */
export const createTabManager = (
  tabList: TabItem[],
  activeId?: TabId,
): TabStateManager => {
  const m = new TabStateManager();

  tabList.forEach((tab) => {
    m.addTab(tab);
  });

  if (activeId !== undefined) {
    m.setActive(activeId);
  }

  return m;
};

/**
 * Same-pane reorder helper — extracts `tabId` from its current position and
 * inserts it next to `targetTabId` on the indicated `side`.
 *
 * @param manager - The tabManager that controls the order of the tabs.
 * @param tabId - The id of the dragged tab.
 * @param targetTabId - The id of the drop target tab.
 * @param side - Which side of the drop target tab to place the dragged tab
 *   onto.
 */
export const reorderTabListWithinPane = (
  manager: TabStateManager,
  tabId: number,
  targetTabId: number,
  side: TabDropTargetSide,
): void => {
  const order = manager.getState().order.slice();

  const fromIdx = order.indexOf(tabId);
  if (fromIdx >= 0) {
    order.splice(fromIdx, 1);
  }

  const toIdx = order.indexOf(targetTabId) + (side === 'right' ? 1 : 0);
  order.splice(toIdx, 0, tabId);

  manager.reorder(order);
};

class StubResizeObserver {
  observe(): void {
    /* no-op */
  }
  unobserve(): void {
    /* no-op */
  }
  disconnect(): void {
    /* no-op */
  }
}

/**
 * Installs a dummy `ResizeObserver` on `globalThis`.
 *
 * @remarks
 * happy-dom does not implement `ResizeObserver`, so components that observe
 * element size (e.g. `ScrollPane`) throw on mount without it. Call once at the
 * top level of a test module, before rendering any components that need it.
 * Geometry is irrelevant here — overflow behavior is covered directly in
 * `ScrollPane`'s own tests.
 */
export const setStubResizeObserver = (): void => {
  (
    globalThis as unknown as { ResizeObserver: typeof ResizeObserver }
  ).ResizeObserver = StubResizeObserver as unknown as typeof ResizeObserver;
};
