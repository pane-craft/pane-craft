/* eslint-disable no-console */
import { useMemo } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { moveTabToEndWithinPane } from '../../dev-utils/storybook.util';
import {
  createFrameDecorator,
  createTabItemList,
} from '../../dev-utils/test-react.util';
import {
  createTabManager,
  reorderTabListWithinPane,
} from '../../dev-utils/test.util';
import { DragStateManager } from '../../state/DragStateManager';
import { TabStateManager } from '../../state/TabStateManager';
import { type TabItem } from '../../types/Tab.type';
import { TabList } from './TabList';

const meta = {
  title: 'Composite/TabList',
  component: TabList,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    paneId: { control: 'number' },
    isScrollable: { control: 'boolean' },
    className: { control: 'text' },
  },
} satisfies Meta<typeof TabList>;

export default meta;
type Story = StoryObj<typeof meta>;

const FrameDecorator = createFrameDecorator(480, 80);

// Base story ----------------------------------------------------------------

const DefaultStory = (args: React.ComponentProps<typeof TabList>) => {
  const tabManager = useMemo(
    () => createTabManager(createTabItemList(3), 1),
    [],
  );
  return (
    <TabList
      {...args}
      tabManager={tabManager}
      onTabClick={(t) => {
        console.log('click', t.id);
      }}
      onTabClose={(t) => {
        console.log('close', t.id);
      }}
      onTabDrop={({ tab, targetTab, side }) => {
        reorderTabListWithinPane(tabManager, tab.id, targetTab.id, side);
      }}
      onTabListDrop={({ tab }) => {
        moveTabToEndWithinPane(tabManager, tab.id);
      }}
    />
  );
};

/**
 * The default tab bar. The first tab is active and every tab is closeable and
 * draggable.
 */
export const Default: Story = {
  decorators: [FrameDecorator],
  render: DefaultStory,
};

// Overflow & scrolling ------------------------------------------------------

const OverflowingStory = (args: React.ComponentProps<typeof TabList>) => {
  const tabManager = useMemo(
    () => createTabManager(createTabItemList(10), 5),
    [],
  );
  return (
    <TabList
      {...args}
      tabManager={tabManager}
      onTabClick={(t) => {
        console.log('click', t.id);
      }}
      onTabDrop={({ tab, targetTab, side }) => {
        reorderTabListWithinPane(tabManager, tab.id, targetTab.id, side);
      }}
      onTabListDrop={({ tab }) => {
        moveTabToEndWithinPane(tabManager, tab.id);
      }}
    />
  );
};

/**
 * A tab list with more tabs than the container can show. Scroll horizontally
 * inside the tab bar.
 */
export const Overflowing: Story = {
  decorators: [FrameDecorator],
  render: OverflowingStory,
};

const NotScrollableStory = (args: React.ComponentProps<typeof TabList>) => {
  const tabManager = useMemo(
    () => createTabManager(createTabItemList(6), 1),
    [],
  );
  return <TabList {...args} tabManager={tabManager} />;
};

/**
 * Same data as `Overflowing` but with `isScrollable={false}`. The tabs spill
 * past the container edge instead of becoming a horizontal scroller. Not a
 * likely way a consumer would use the TabList, but included for full
 * specificity and awareness.
 */
export const NotScrollable: Story = {
  decorators: [FrameDecorator],
  args: { isScrollable: false },
  render: NotScrollableStory,
};

// Edge cases ----------------------------------------------------------------

const EmptyStory = (args: React.ComponentProps<typeof TabList>) => {
  const tabManager = useMemo(() => new TabStateManager(), []);
  return <TabList {...args} tabManager={tabManager} />;
};

/**
 * An empty tab bar — no tabs in the tabManager. Renders an empty container with
 * keyboard navigation that does nothing until tabs are added.
 */
export const Empty: Story = {
  decorators: [FrameDecorator],
  render: EmptyStory,
};

const PinnedSingleStory = (args: React.ComponentProps<typeof TabList>) => {
  const tabManager = useMemo(
    () =>
      createTabManager([{ id: 1, label: 'Pinned.md', isCloseable: false }], 1),
    [],
  );
  return <TabList {...args} tabManager={tabManager} />;
};

/**
 * A single non-closeable tab — useful for "pinned" or required documents.
 */
export const PinnedSingle: Story = {
  decorators: [FrameDecorator],
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

  const tabManagerByPane: Record<number, TabStateManager> = {
    0: left,
    1: right,
  };

  const moveTab = (
    from: number,
    to: number,
    tab: TabItem,
    atIndex?: number,
  ) => {
    tabManagerByPane[from].removeTab(tab.id);
    tabManagerByPane[to].addTab(tab, atIndex);
  };

  return (
    <div style={{ display: 'flex', gap: 16, width: 640 }}>
      {[
        { paneId: 0, tabManager: left, label: 'Pane 0' },
        { paneId: 1, tabManager: right, label: 'Pane 1' },
      ].map(({ paneId, tabManager, label }) => (
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
            tabManager={tabManager}
            dragAndDropManager={dragManager}
            onTabDrop={({
              tab,
              sourcePaneId,
              targetPaneId,
              targetTab,
              side,
            }) => {
              if (sourcePaneId === targetPaneId) {
                const order = tabManagerByPane[targetPaneId]
                  .getState()
                  .order.slice();
                const fromIdx = order.indexOf(tab.id);
                if (fromIdx >= 0) order.splice(fromIdx, 1);
                const toIdx =
                  order.indexOf(targetTab.id) + (side === 'right' ? 1 : 0);
                order.splice(toIdx, 0, tab.id);
                tabManagerByPane[targetPaneId].reorder(order);
              } else {
                const targetIdx =
                  tabManagerByPane[targetPaneId]
                    .getState()
                    .order.indexOf(targetTab.id) + (side === 'right' ? 1 : 0);
                moveTab(sourcePaneId, targetPaneId, tab, targetIdx);
              }
            }}
            onTabListDrop={({ tab, sourcePaneId, targetPaneId }) => {
              if (sourcePaneId === targetPaneId) {
                moveTabToEndWithinPane(tabManagerByPane[targetPaneId], tab.id);
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
