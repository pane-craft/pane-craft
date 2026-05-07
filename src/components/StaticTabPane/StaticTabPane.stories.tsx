/* eslint-disable no-console */
import { useMemo } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  createFrameDecorator,
  createTabContent,
  createTabItemList,
  getBodyCss,
} from '../../dev-utils/test-react.util';
import {
  createTabManager,
  reorderTabListWithinPane,
} from '../../dev-utils/test.util';
import { DragStateManager } from '../../state/DragStateManager';
import { TabStateManager } from '../../state/TabStateManager';
import { type TabItem } from '../../types/Tab.type';
import { DropZone } from '../DropZone/DropZone';
import { StaticTabPane } from './StaticTabPane';

const meta = {
  title: 'Composite/StaticTabPane',
  component: StaticTabPane,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    paneId: { control: 'number' },
    isScrollable: { control: 'boolean' },
    className: { control: 'text' },
  },
} satisfies Meta<typeof StaticTabPane>;

export default meta;
type Story = StoryObj<typeof meta>;
type StaticTabPaneArgs = React.ComponentProps<typeof StaticTabPane>;

const FrameDecorator = createFrameDecorator(560, 320);

const TABS = createTabItemList(4, 'Tab');
const MANY_TABS = createTabItemList(14, 'Tab');

// Base story ----------------------------------------------------------------

const DefaultStory = (args: StaticTabPaneArgs) => {
  const tabManager = useMemo(() => createTabManager(TABS, 1), []);
  return (
    <StaticTabPane
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
    />
  );
};

/**
 * The default tab pane with four tabs. The active tab's `content` is rendered
 * in the body region below the header. Dragging a tab onto another tab
 * reorders them via the supplied `onTabDrop` handler.
 */
export const Default: Story = {
  decorators: [FrameDecorator],
  render: DefaultStory,
};

// Overflow & scrolling ------------------------------------------------------

const OverflowingHeaderStory = (args: StaticTabPaneArgs) => {
  const tabManager = useMemo(() => createTabManager(MANY_TABS, 5), []);

  return (
    <StaticTabPane
      {...args}
      tabManager={tabManager}
      onTabDrop={({ tab, targetTab, side }) => {
        reorderTabListWithinPane(tabManager, tab.id, targetTab.id, side);
      }}
    />
  );
};

/**
 * A tab pane whose header has more tabs than fit in the container. The header
 * scrolls horizontally while the content region fills the remaining space.
 */
export const OverflowingHeader: Story = {
  decorators: [FrameDecorator],
  render: OverflowingHeaderStory,
};

// Edge cases ----------------------------------------------------------------

const EmptyStory = (args: StaticTabPaneArgs) => {
  const tabManager = useMemo(() => new TabStateManager(), []);

  return (
    <StaticTabPane
      {...args}
      tabManager={tabManager}
      emptyContent={
        <div
          style={{
            color: '#b1b1b1',
            fontStyle: 'italic',
            padding: '1rem',
          }}
        >
          No files are open.
        </div>
      }
    />
  );
};

/**
 * An empty tab pane — no tabs in the tabManager. The content region shows the
 * supplied `emptyContent`.
 */
export const Empty: Story = {
  decorators: [FrameDecorator],
  render: EmptyStory,
};

const PinnedSingleStory = (args: StaticTabPaneArgs) => {
  const tabManager = useMemo(
    () =>
      createTabManager(
        [
          {
            id: 1,
            label: 'Pinned.md',
            isCloseable: false,
            content: createTabContent(
              'Pinned.md',
              '# This tab cannot be closed.',
            ),
          },
        ],
        1,
      ),
    [],
  );
  return <StaticTabPane {...args} tabManager={tabManager} />;
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
    () => createTabManager(createTabItemList(3, 'Left Tab', 11), 11),
    [],
  );
  const right = useMemo(
    () => createTabManager(createTabItemList(2, 'Right Tab', 21), 21),
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
    <div style={{ display: 'flex', gap: 16, width: 840, height: 320 }}>
      {[
        { paneId: 0 as const, tabManager: left, label: 'Pane 0' },
        { paneId: 1 as const, tabManager: right, label: 'Pane 1' },
      ].map(({ paneId, tabManager, label }) => (
        <div
          key={paneId}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            background: '#1e1e1e',
            border: '1px solid #3c3c3c',
            padding: 4,
            minHeight: 0,
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
          <StaticTabPane
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
                if (fromIdx >= 0) {
                  order.splice(fromIdx, 1);
                }

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
 * Two `StaticTabPane`s sharing a single `DragStateManager`. Tabs can be dragged
 * between panes; same-pane drops reorder, cross-pane drops move.
 *
 * Whichever pane currently owns the active tab renders its content in the
 * body region.
 */
export const CrossPaneDragAndDrop: Story = {
  render: CrossPaneDragAndDropStory,
};

// DropZone overlay ----------------------------------------------------------

const WithDropZoneStory = () => {
  const dragManager = useMemo(() => new DragStateManager(), []);
  const tabManager = useMemo(() => createTabManager(TABS, 1), []);

  return (
    <div style={getBodyCss(560, 320)}>
      <StaticTabPane tabManager={tabManager} dragAndDropManager={dragManager}>
        <DropZone
          dragAndDropManager={dragManager}
          onDrop={({ tab, pos }) => {
            console.log('dropped', tab.label, 'on', pos);
          }}
        />
      </StaticTabPane>
    </div>
  );
};

/**
 * A `StaticTabPane` with a `DropZone` passed as `children`. The drop zones
 * cover only the content region — drag a tab over the tab bar and the
 * overlay does not intercept; release over a zone in the body to log the
 * chosen position. The story is intentionally passive (no move/split logic
 * wired up) so the `DropZone` contract is visible in isolation.
 */
export const WithDropZone: Story = {
  render: WithDropZoneStory,
};

const WithCenterOnlyDropZoneStory = () => {
  const dragManager = useMemo(() => new DragStateManager(), []);
  const tabManager = useMemo(() => createTabManager(TABS.slice(0, 1), 1), []);

  return (
    <div style={getBodyCss(480, 280)}>
      <StaticTabPane tabManager={tabManager} dragAndDropManager={dragManager}>
        <DropZone
          dropZonePosList={['center']}
          dragAndDropManager={dragManager}
          onDrop={({ pos }) => {
            console.log('dropped on (center-only)', pos);
          }}
        />
      </StaticTabPane>
    </div>
  );
};

/**
 * A `StaticTabPane` with a `center`-only `DropZone` — useful for panes that
 * accept cross-pane moves but should not be split. Edge zones are not
 * rendered, so a drag near the perimeter of the content area falls through.
 */
export const WithCenterOnlyDropZone: Story = {
  render: WithCenterOnlyDropZoneStory,
};
