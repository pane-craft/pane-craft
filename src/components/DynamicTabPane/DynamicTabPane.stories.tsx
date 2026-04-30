import { useEffect, useMemo, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { DynamicTabPaneStateManager } from '../../state/DynamicTabPaneStateManager';
import {
  createTabContent,
  createTabItemList,
} from '../../test-utils/test-react.util';
import { createLoremIpsumText } from '../../test-utils/test.util';
import {
  type LeafId,
  type SplitSide,
} from '../../types/PaneTreeStateManager.type';
import { DynamicTabPane } from './DynamicTabPane';

const meta = {
  title: 'Composite/DynamicTabPane',
  component: DynamicTabPane,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    manager: new DynamicTabPaneStateManager(),
  },
} satisfies Meta<typeof DynamicTabPane>;

export default meta;
type Story = StoryObj<typeof meta>;

const FRAME_STYLE: React.CSSProperties = {
  width: '100vw',
  height: '100vh',
  background: '#1e1e1e',
  color: '#d4d4d4',
  fontFamily: 'ui-monospace, monospace',
  fontSize: 13,
};

const BasicStory = (): React.ReactElement => {
  const manager = useMemo(
    () =>
      new DynamicTabPaneStateManager({
        initialSnapshot: {
          root: { isLeaf: true, id: 1, tabList: createTabItemList(3, 'Tab') },
        },
      }),
    [],
  );

  return (
    <div style={FRAME_STYLE}>
      <DynamicTabPane manager={manager} />
    </div>
  );
};

/**
 * Three tabs in a single pane, declared up-front via `initialSnapshot`. Drag a
 * tab to any edge to split; drop on the center to move across panes; drop on
 * another tab to reorder. Close the last tab in a pane and the pane collapses
 * automatically.
 */
export const Basic: Story = {
  render: () => <BasicStory />,
};

const IdeLayoutStory = (): React.ReactElement => {
  const manager = useMemo(() => {
    const tabs = createTabItemList(5, 'Tab');

    return new DynamicTabPaneStateManager({
      initialSnapshot: {
        root: {
          isLeaf: false,
          orientation: 'horizontal',
          sizes: [20, 80],
          children: [
            { isLeaf: true, id: 1, tabList: [tabs[0]] },
            {
              isLeaf: false,
              orientation: 'vertical',
              sizes: [70, 30],
              children: [
                { isLeaf: true, id: 2, tabList: [tabs[1], tabs[2], tabs[3]] },
                { isLeaf: true, id: 3, tabList: [tabs[4]] },
              ],
            },
          ],
        },
        activeLeafId: 2,
      },
    });
  }, []);

  return (
    <div style={FRAME_STYLE}>
      <DynamicTabPane manager={manager} />
    </div>
  );
};

/**
 * Pre-seeded multi-pane layout that mimics an IDE: a sidebar pane on the
 * left, an editor pane in the middle, and a terminal-style pane below. The
 * entire layout — including pane sizes, tab distribution, and the active
 * leaf — is declared in a single `initialSnapshot`. All three panes share a
 * single drag manager, so tabs can be dragged freely between any pane and
 * dropped on edges to create further splits.
 */
export const IdeLayout: Story = {
  render: () => <IdeLayoutStory />,
};

const InteractivePlaygroundStory = (): React.ReactElement => {
  const manager = useMemo(() => new DynamicTabPaneStateManager(), []);
  const [, force] = useState(0);

  useEffect(
    () =>
      manager.subscribe(() => {
        force((n) => n + 1);
      }),
    [manager],
  );

  const [nextTabId, setNextTabId] = useState(1);

  const openNew = (): void => {
    const tabLabel = `Tab ${nextTabId}`;
    manager.openTab({
      id: nextTabId,
      label: tabLabel,
      content: createTabContent(tabLabel, createLoremIpsumText(150)),
    });
    setNextTabId((n) => n + 1);
  };

  const splitActive = (side: SplitSide): void => {
    const active = manager.activeLeafId;
    if (active === null) {
      return;
    }

    const activeTab = manager.getTabs(active)?.activeTab;
    if (activeTab === undefined || activeTab === null) {
      return;
    }

    manager.splitLeafWithTab(active, active, activeTab.id, side);
  };

  const renderLeafBadge = (leafId: LeafId): React.ReactNode => {
    if (leafId !== manager.activeLeafId) {
      return null;
    }

    return (
      <span
        style={{
          background: '#007acc',
          color: 'white',
          padding: '1px 6px',
          borderRadius: 4,
          fontSize: 10,
          marginLeft: 6,
        }}
      >
        active
      </span>
    );
  };

  return (
    <div
      style={{
        ...FRAME_STYLE,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ flex: '1 1 0', minHeight: 0 }}>
        <DynamicTabPane
          manager={manager}
          emptyContent={
            <div
              style={{
                margin: 'auto',
                color: '#6a6a6a',
                fontStyle: 'italic',
              }}
            >
              {'DynamicTab is empty. Click "Open tab" to begin.'}
            </div>
          }
        />
      </div>
      <div
        style={{
          display: 'flex',
          gap: 6,
          padding: 8,
          borderTop: '1px solid #3c3c3c',
          background: '#252526',
          alignItems: 'center',
        }}
      >
        <span style={{ color: '#6a6a6a', marginRight: 6 }}>
          active leaf ={' '}
          {manager.activeLeafId === null ? '—' : String(manager.activeLeafId)}
          {manager.activeLeafId !== null &&
            renderLeafBadge(manager.activeLeafId)}
        </span>
        <button
          onClick={openNew}
          style={{
            padding: '4px 10px',
            background: '#3c3c3c',
            color: '#d4d4d4',
            border: '1px solid #555',
            borderRadius: 2,
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 12,
          }}
        >
          open tab
        </button>
        {(['left', 'right', 'top', 'bottom'] as const).map((side) => (
          <button
            key={side}
            onClick={() => {
              splitActive(side);
            }}
            style={{
              padding: '4px 10px',
              background: '#3c3c3c',
              color: '#d4d4d4',
              border: '1px solid #555',
              borderRadius: 2,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 12,
            }}
          >
            split {side}
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * Empty dynamic pane with custom `emptyContent`. Demonstrates the runtime API:
 * `openTab` adds a tab to the active leaf (creating a leaf if the dynamic pane
 * is empty), and `splitLeafWithTab` carves the active leaf into a new
 * sibling pane on the chosen edge. Useful for exploring behavior without
 * drag-and-drop.
 */
export const InteractivePlayground: Story = {
  render: () => <InteractivePlaygroundStory />,
};
