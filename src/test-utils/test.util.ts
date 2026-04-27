/**
 * Utility functions intended only for testing and not to be included in any
 * final builds.
 */
import { TabStateManager } from '../state/TabStateManager';
import { type TabItem } from '../types/Tab.type';

/**
 * Generates a "Lorem Ipsum" string of exactly n characters.
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
 * A function for creating a test list of {@link TabItem}s.
 * @param numTabs - The number of test tabs to create.
 * @param label - The base label to assign to each tab. Optional, defaults to
 *   'Tab'.
 * @returns A list of {@link TabItem}s.
 */
export const createTabItemList = (numTabs: number, label = 'Tab'): TabItem[] =>
  Array.from({ length: numTabs }, (_, i) => ({
    id: i + 1,
    label: `${label} ${i + 1}`,
  }));

/**
 * A function for creating a tab manager with the specified tabs.
 * @param tabList - A list of {@link TabItem}s to use with the manager.
 * @param activeId - Optional tab id to set as active.
 * @returns A {@link TabStateManager} object.
 */
export const createTabManager = (
  tabList: TabItem[],
  activeId?: number,
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
