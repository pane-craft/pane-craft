/* eslint-disable no-console */
import { useMemo, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { DragStateManager } from '../../state/DragStateManager';
import { TabStateManager } from '../../state/TabStateManager';
import {
  createFrameDecorator,
  createTabItemList,
} from '../../test-utils/test-react.util';
import {
  createTabManager,
  reorderTabListWithinPane,
} from '../../test-utils/test.util';
import { type DropZonePosition } from '../../types/DropZone.type';
import { type TabItem } from '../../types/Tab.type';
import { DynamicTabPaneLeaf } from './DynamicTabPaneLeaf';

const meta = {
  title: 'Composite/DynamicTabPaneLeaf',
  component: DynamicTabPaneLeaf,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    paneId: { control: 'number' },
    isScrollable: { control: 'boolean' },
    className: { control: 'text' },
  },
} satisfies Meta<typeof DynamicTabPaneLeaf>;

export default meta;
type Story = StoryObj<typeof meta>;
type DynamicTabPaneLeafArgs = React.ComponentProps<typeof DynamicTabPaneLeaf>;

const FrameDecorator = createFrameDecorator(560, 320);

const TABS = createTabItemList(3, 'Tab');

// Base story --------------------------------------------------------------

const DefaultStory = (args: DynamicTabPaneLeafArgs) => {
  const tabManager = useMemo(() => createTabManager(TABS, 1), []);
  const [lastZone, setLastZone] = useState<DropZonePosition | null>(null);

  return (
    <>
      <DynamicTabPaneLeaf
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
        onDropZoneDrop={({ tab, pos }) => {
          console.log('zone drop', tab.id, pos);
          setLastZone(pos);
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 8,
          left: 8,
          fontSize: 11,
          color: '#6a6a6a',
        }}
      >
        last zone drop: {lastZone ?? '—'}
      </div>
    </>
  );
};

/**
 * The default `DynamicTabPaneLeaf` leaf pane. The tab bar handles reordering;
 * the content area's drop zones fire `onDropZoneDrop` (logged here). Splits
 * are controlled by the `PaneTree`, so nothing actually splits in this story.
 */
export const Default: Story = {
  decorators: [FrameDecorator],
  render: DefaultStory,
};

// Cross-pane drag-and-drop -----------------------------------------------

const CrossPaneDragAndDropStory = () => {
  const dragManager = useMemo(() => new DragStateManager(), []);
  const left = useMemo(
    () => createTabManager(createTabItemList(2, 'Left Tab', 11), 11),
    [],
  );
  const right = useMemo(
    () => createTabManager(createTabItemList(1, 'Right Tab', 21), 21),
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
    <div style={{ display: 'flex', gap: 16, width: 880, height: 320 }}>
      {[
        { paneId: 0 as const, manager: left, label: 'Pane 0' },
        { paneId: 1 as const, manager: right, label: 'Pane 1' },
      ].map(({ paneId, manager, label }) => (
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
          <DynamicTabPaneLeaf
            paneId={paneId}
            tabManager={manager}
            dragAndDropManager={dragManager}
            onTabDrop={({
              tab,
              sourcePaneId,
              targetPaneId,
              targetTab,
              side,
            }) => {
              if (sourcePaneId === targetPaneId) {
                reorderTabListWithinPane(
                  tabManagerByPane[targetPaneId],
                  tab.id,
                  targetTab.id,
                  side,
                );
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
            onDropZoneDrop={({ tab, sourcePaneId, targetPaneId, pos }) => {
              if (pos === 'center') {
                if (sourcePaneId === targetPaneId) {
                  return;
                }
                moveTab(sourcePaneId, targetPaneId, tab);
              } else {
                // A real app would split `targetPaneId` on `pos` and place
                // `tab` in the new sub-pane. Log demonstratively.
                console.log(
                  'split',
                  targetPaneId,
                  'on',
                  pos,
                  'with',
                  tab.label,
                );
              }
            }}
          />
        </div>
      ))}
    </div>
  );
};

/**
 * Two `DynamicTabPaneLeaf`s sharing one `DragStateManager`.
 * `DynamicTabPaneLeaf` can be dragged between panes (tab bar), and the
 * content-area drop zones can accept cross-pane moves and logged "split"
 * intents.
 *
 * The `onDropZoneDrop` handler below interprets `center` as a move and the
 * edge zones as *logged* splits (a real pane tree would actually split).
 */
export const CrossPaneDragAndDrop: Story = {
  render: CrossPaneDragAndDropStory,
};

// Center-only leaf -------------------------------------------------------

const CenterOnlyStory = (args: DynamicTabPaneLeafArgs) => {
  const tabManager = useMemo(() => createTabManager(TABS, 1), []);
  return (
    <DynamicTabPaneLeaf
      {...args}
      tabManager={tabManager}
      onTabDrop={({ tab, targetTab, side }) => {
        reorderTabListWithinPane(tabManager, tab.id, targetTab.id, side);
      }}
      onDropZoneDrop={({ pos }) => {
        console.log('dropped on', pos);
      }}
    />
  );
};

/**
 * A leaf pane that refuses splits: `dropZonePosList={['center']}` so only
 * cross-pane moves are accepted by the content-area overlay.
 */
export const CenterOnly: Story = {
  decorators: [FrameDecorator],
  args: { dropZonePosList: ['center'] },
  render: CenterOnlyStory,
};

// Empty state ------------------------------------------------------------

const EmptyStory = (args: DynamicTabPaneLeafArgs) => {
  const tabManager = useMemo(() => new TabStateManager(), []);
  return (
    <DynamicTabPaneLeaf
      {...args}
      tabManager={tabManager}
      emptyContent={
        <div
          style={{
            padding: 16,
            color: '#6a6a6a',
            fontStyle: 'italic',
            fontFamily: 'ui-monospace, monospace',
            fontSize: 13,
          }}
        >
          No files are open. Drop a tab here to add one.
        </div>
      }
    />
  );
};

/**
 * An empty leaf pane with custom empty content. The drop zone overlay still
 * appears during a drag, so the pane can accept a move even when empty.
 */
export const Empty: Story = {
  decorators: [FrameDecorator],
  render: EmptyStory,
};
