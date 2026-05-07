/* eslint-disable no-console */
import { useMemo, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { DynamicTabPane } from '../../components/DynamicTabPane';
import {
  DynamicTabPaneLeaf,
  type DynamicTabPaneLeafProps,
} from '../../components/DynamicTabPaneLeaf';
import {
  StaticTabPane,
  type StaticTabPaneProps,
} from '../../components/StaticTabPane';
import { TabList } from '../../components/TabList/TabList';
import {
  CustomTab,
  LastDropZoneDisplay,
  moveTabToEndWithinPane,
} from '../../dev-utils/storybook.util';
import {
  createFrameDecorator,
  createTabItemList,
  FRAME_DYNAMIC_PANE,
} from '../../dev-utils/test-react.util';
import {
  createTabManager,
  reorderTabListWithinPane,
} from '../../dev-utils/test.util';
import { DragStateManager } from '../../state/DragStateManager';
import { DynamicTabPaneStateManager } from '../../state/DynamicTabPaneStateManager';
import { type DropZonePosition } from '../../types/DropZone.type';

const meta = {
  title: 'AdvancedUsage/CustomTabs',
  component: TabList,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof TabList>;

export default meta;
type Story = StoryObj<typeof meta>;

// TabList --------------------------------------------------------------------

const TabListStory = () => {
  const dragManager = useMemo(() => new DragStateManager(), []);
  const tabManager = useMemo(
    () => createTabManager(createTabItemList(4), 2),
    [],
  );

  return (
    <TabList
      tabManager={tabManager}
      dragAndDropManager={dragManager}
      CustomTabComponent={CustomTab}
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
 * Demonstrates a custom tab implementation applied to a {@link TabList}
 * component.
 */
export const TabListUsage: Story = {
  decorators: [createFrameDecorator(520, 100)],
  render: TabListStory,
};

// StaticTabPane --------------------------------------------------------------

const StaticTabPaneStory = (props: StaticTabPaneProps) => {
  const tabManager = useMemo(
    () => createTabManager(createTabItemList(3), 1),
    [],
  );

  return (
    <StaticTabPane
      {...props}
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
      CustomTabComponent={CustomTab}
    />
  );
};

/**
 * Demonstrates a custom tab implementation applied to a {@link StaticTabPane}
 * component.
 */
export const StaticTabPaneUsage: Story = {
  decorators: [createFrameDecorator(560, 320)],
  render: StaticTabPaneStory,
};

// DynamicTabPaneLeaf ---------------------------------------------------------

const DynamicTabPaneLeafStory = (props: DynamicTabPaneLeafProps) => {
  const tabManager = useMemo(
    () => createTabManager(createTabItemList(3), 1),
    [],
  );
  const [lastZone, setLastZone] = useState<DropZonePosition | null>(null);

  return (
    <>
      <DynamicTabPaneLeaf
        {...props}
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
        CustomTabComponent={CustomTab}
      />
      <LastDropZoneDisplay lastZone={lastZone} />
    </>
  );
};

/**
 * Demonstrates a custom tab implementation applied to a
 * {@link DynamicTabPaneLeaf} component.
 */
export const DynamicTabPaneLeafUsage: Story = {
  decorators: [createFrameDecorator(520, 320, { position: 'relative' })],
  render: DynamicTabPaneLeafStory,
};

// DynamicTabPane -------------------------------------------------------------

const DynamicTabPaneStory = (): React.ReactElement => {
  const manager = useMemo(
    () =>
      new DynamicTabPaneStateManager({
        initialSnapshot: {
          root: { isLeaf: true, id: 1, tabList: createTabItemList(3) },
        },
      }),
    [],
  );

  return (
    <div style={FRAME_DYNAMIC_PANE}>
      <DynamicTabPane manager={manager} CustomTabComponent={CustomTab} />
    </div>
  );
};

/**
 * Demonstrates a custom tab implementation applied to a {@link DynamicTabPane}
 * component.
 */
export const DynamicTabPaneUsage: Story = {
  render: () => <DynamicTabPaneStory />,
};
