/* eslint-disable no-console */
import { useMemo } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { DragStateManager } from '../../state/DragStateManager';
import { TabStateManager } from '../../state/TabStateManager';
import {
  createTabItemList,
  createTabManager,
} from '../../test-utils/test.util';
import { type TabDropTargetSide, type TabItem } from '../../types/Tab.type';
import { TabList } from './TabList';

const meta = {
  title: 'Composite/TabList',
  component: TabList,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    paneId: { control: 'number' },
    scrollable: { control: 'boolean' },
    className: { control: 'text' },
  },
} satisfies Meta<typeof TabList>;

export default meta;
type Story = StoryObj<typeof meta>;

const FRAME_DECORATOR = (Story: React.ComponentType) => (
  <div
    style={{
      width: 480,
      height: 80,
      background: '#1e1e1e',
      border: '1px solid #3c3c3c',
    }}
  >
    <Story />
  </div>
);

/**
 * Same-pane reorder helper — extracts `tabId` from its current position and
 * inserts it next to `targetTabId` on the indicated `side`.
 */
const reorderWithinPane = (
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

/**
 * Same-pane "move to end" helper — used when a tab is dropped on the empty
 * space of its own tab list.
 */
const moveToEndWithinPane = (manager: TabStateManager, tabId: number): void => {
  const order = manager.getState().order.slice();

  const fromIdx = order.indexOf(tabId);
  if (fromIdx < 0) {
    return;
  }

  order.splice(fromIdx, 1);
  order.push(tabId);

  manager.reorder(order);
};

// Base story ----------------------------------------------------------------

const DefaultStory = (args: React.ComponentProps<typeof TabList>) => {
  const manager = useMemo(() => createTabManager(createTabItemList(3), 1), []);
  return (
    <TabList
      {...args}
      manager={manager}
      onTabClick={(t) => {
        console.log('click', t.id);
      }}
      onTabClose={(t) => {
        console.log('close', t.id);
      }}
      onTabDrop={({ tab, targetTab, side }) => {
        reorderWithinPane(manager, tab.id, targetTab.id, side);
      }}
      onTabListDrop={({ tab }) => {
        moveToEndWithinPane(manager, tab.id);
      }}
    />
  );
};

/**
 * The default tab bar. The first tab is active and every tab is closeable and
 * draggable.
 */
export const Default: Story = {
  decorators: [FRAME_DECORATOR],
  render: DefaultStory,
};

// Overflow & scrolling ------------------------------------------------------

const OverflowingStory = (args: React.ComponentProps<typeof TabList>) => {
  const manager = useMemo(() => createTabManager(createTabItemList(10), 5), []);
  return (
    <TabList
      {...args}
      manager={manager}
      onTabClick={(t) => {
        console.log('click', t.id);
      }}
      onTabDrop={({ tab, targetTab, side }) => {
        reorderWithinPane(manager, tab.id, targetTab.id, side);
      }}
      onTabListDrop={({ tab }) => {
        moveToEndWithinPane(manager, tab.id);
      }}
    />
  );
};

/**
 * A tab list with more tabs than the container can show. Scroll horizontally
 * inside the tab bar.
 */
export const Overflowing: Story = {
  decorators: [FRAME_DECORATOR],
  render: OverflowingStory,
};

const NotScrollableStory = (args: React.ComponentProps<typeof TabList>) => {
  const manager = useMemo(() => createTabManager(createTabItemList(6), 1), []);
  return <TabList {...args} manager={manager} />;
};

/**
 * Same data as `Overflowing` but with `scrollable={false}`. The tabs spill
 * past the container edge instead of becoming a horizontal scroller. Not a
 * likely way a consumer would use the TabList, but included for full
 * specificity and awareness.
 */
export const NotScrollable: Story = {
  decorators: [FRAME_DECORATOR],
  args: { scrollable: false },
  render: NotScrollableStory,
};

// Edge cases ----------------------------------------------------------------

const EmptyStory = (args: React.ComponentProps<typeof TabList>) => {
  const manager = useMemo(() => new TabStateManager(), []);
  return <TabList {...args} manager={manager} />;
};

/**
 * An empty tab bar — no tabs in the manager. Renders an empty container with
 * keyboard navigation that does nothing until tabs are added.
 */
export const Empty: Story = {
  decorators: [FRAME_DECORATOR],
  render: EmptyStory,
};

const PinnedSingleStory = (args: React.ComponentProps<typeof TabList>) => {
  const manager = useMemo(
    () =>
      createTabManager([{ id: 1, label: 'Pinned.md', isCloseable: false }], 1),
    [],
  );
  return <TabList {...args} manager={manager} />;
};

/**
 * A single non-closeable tab — useful for "pinned" or required documents.
 */
export const PinnedSingle: Story = {
  decorators: [FRAME_DECORATOR],
  render: PinnedSingleStory,
};

// Cross-pane drag-and-drop --------------------------------------------------

const CrossPaneDragAndDropStory = () => {
  const dragManager = useMemo(() => new DragStateManager(), []);
  const left = useMemo(
    () => createTabManager(createTabItemList(3, 'Left'), 11),
    [],
  );
  const right = useMemo(
    () => createTabManager(createTabItemList(2, 'Right'), 21),
    [],
  );

  const managerByPane: Record<number, TabStateManager> = {
    0: left,
    1: right,
  };

  const moveTab = (
    from: number,
    to: number,
    tab: TabItem,
    atIndex?: number,
  ) => {
    managerByPane[from].removeTab(tab.id);
    managerByPane[to].addTab(tab, atIndex);
  };

  return (
    <div style={{ display: 'flex', gap: 16, width: 640 }}>
      {[
        { paneId: 0, manager: left, label: 'Pane 0' },
        { paneId: 1, manager: right, label: 'Pane 1' },
      ].map(({ paneId, manager, label }) => (
        <div
          key={paneId}
          style={{
            flex: 1,
            background: '#1e1e1e',
            border: '1px solid #3c3c3c',
            padding: 4,
          }}
        >
          <div
            style={{
              color: '#888',
              fontSize: 11,
              padding: '0 4px 4px',
            }}
          >
            {label}
          </div>
          <TabList
            paneId={paneId}
            manager={manager}
            dragAndDropManager={dragManager}
            onTabDrop={({
              tab,
              sourcePaneId,
              targetPaneId,
              targetTab,
              side,
            }) => {
              if (sourcePaneId === targetPaneId) {
                const order = managerByPane[targetPaneId]
                  .getState()
                  .order.slice();
                const fromIdx = order.indexOf(tab.id);
                if (fromIdx >= 0) order.splice(fromIdx, 1);
                const toIdx =
                  order.indexOf(targetTab.id) + (side === 'right' ? 1 : 0);
                order.splice(toIdx, 0, tab.id);
                managerByPane[targetPaneId].reorder(order);
              } else {
                const targetIdx =
                  managerByPane[targetPaneId]
                    .getState()
                    .order.indexOf(targetTab.id) + (side === 'right' ? 1 : 0);
                moveTab(sourcePaneId, targetPaneId, tab, targetIdx);
              }
            }}
            onTabListDrop={({ tab, sourcePaneId, targetPaneId }) => {
              if (sourcePaneId === targetPaneId) {
                moveToEndWithinPane(managerByPane[targetPaneId], tab.id);
                return;
              }
              moveTab(sourcePaneId, targetPaneId, tab);
            }}
          />
        </div>
      ))}
    </div>
  );
};

/**
 * Two `TabList` components sharing a single `DragStateManager`. Tabs can be
 * dragged between panes; same-pane drops reorder, cross-pane drops move.
 *
 * This is intended to demonstrate the minimal handlers for cross-pane drag and
 * drop functionality. Consumers are encouraged to wire their own
 * `onTabDrop`/`onTabListDrop` for real applications.
 */
export const CrossPaneDragAndDrop: Story = {
  render: CrossPaneDragAndDropStory,
};
