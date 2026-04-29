/* eslint-disable no-console */
import { useEffect, useMemo, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { PaneTreeStateManager } from '../../state/PaneTreeStateManager';
import {
  type LeafId,
  type SplitSide,
} from '../../types/PaneTreeStateManager.type';
import { PaneTree } from './PaneTree';

const meta = {
  title: 'Composite/PaneTree',
  component: PaneTree,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    manager: new PaneTreeStateManager(),
    renderLeaf: () => null,
  },
} satisfies Meta<typeof PaneTree>;

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

const LEAF_COLORS = ['#1e1e1e', '#252526', '#2d2d30', '#3c3c3c', '#1b4b6b'];

const leafBody = (id: LeafId): React.ReactElement => (
  <div
    style={{
      width: '100%',
      height: '100%',
      background: LEAF_COLORS[id % LEAF_COLORS.length],
      padding: 12,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
    }}
  >
    <div style={{ color: '#9cdcfe' }}>leaf {id}</div>
    <div style={{ color: '#6a6a6a' }}>drop-in content for leaf {id}</div>
  </div>
);

const ThreePaneLayoutStory = (): React.ReactElement => {
  const treeManager = useMemo(() => {
    const t = new PaneTreeStateManager();
    t.addLeaf(1);
    t.splitLeaf(1, 2, 'right');
    t.splitLeaf(2, 3, 'bottom');
    t.resizeSplit([], [20, 80]);
    t.resizeSplit([1], [70, 30]);
    return t;
  }, []);

  return (
    <div style={FRAME_STYLE}>
      <PaneTree manager={treeManager} renderLeaf={({ id }) => leafBody(id)} />
    </div>
  );
};

/**
 * Demonstrates the three-pane IDE-style layout: sidebar | (editor / terminal).
 * Drag the splitters to resize — sizes propagate through the manager and
 * are persisted in the tree state.
 */
export const ThreePaneLayout: Story = {
  render: () => <ThreePaneLayoutStory />,
};

const InteractiveSplittingStory = (): React.ReactElement => {
  const manager = useMemo(() => {
    const t = new PaneTreeStateManager();
    t.addLeaf(1);
    return t;
  }, []);

  const [, force] = useState(0);
  useEffect(
    () =>
      manager.subscribe(() => {
        force((n) => n + 1);
      }),
    [manager],
  );

  const [focused, setFocused] = useState(1);
  const [nextId, setNextId] = useState(2);

  const split = (side: SplitSide): void => {
    manager.splitLeaf(focused, nextId, side);
    setFocused(nextId);
    setNextId((id) => id + 1);
  };

  const remove = (): void => {
    const ids = manager.getLeafIds();
    manager.removeLeaf(focused);
    const remaining = manager.getLeafIds();
    if (remaining.length > 0) {
      setFocused(remaining[0]);
    } else {
      manager.addLeaf(nextId);
      setFocused(nextId);
      setNextId((id) => id + 1);
    }
    console.log('removed', focused, 'had', ids);
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
        <PaneTree
          manager={manager}
          renderLeaf={({ id }) => (
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                setFocused(id);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setFocused(id);
                }
              }}
              style={{
                width: '100%',
                height: '100%',
                background: LEAF_COLORS[id % LEAF_COLORS.length],
                padding: 12,
                boxSizing: 'border-box',
                outline:
                  id === focused
                    ? '2px solid var(--pc-color-highlight-default, #007acc)'
                    : 'none',
                outlineOffset: -2,
                cursor: 'pointer',
              }}
            >
              <div style={{ color: '#9cdcfe' }}>leaf {id}</div>
              <div style={{ color: '#6a6a6a', fontSize: 11 }}>
                {id === focused ? 'focused' : 'click to focus'}
              </div>
            </div>
          )}
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
          focused = {focused}
        </span>
        {(['left', 'right', 'top', 'bottom'] as const).map((side) => (
          <button
            key={side}
            onClick={() => {
              split(side);
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
        <button
          onClick={remove}
          style={{
            padding: '4px 10px',
            background: '#5a1d1d',
            color: '#d4d4d4',
            border: '1px solid #7a2a2a',
            borderRadius: 2,
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 12,
            marginLeft: 8,
          }}
        >
          remove focused
        </button>
      </div>
    </div>
  );
};

/**
 * An interactive playground: split the focused leaf in any direction via
 * the toolbar at the bottom. Demonstrates all four `splitLeaf` sides plus
 * `removeLeaf` with single-child collapse behaviour.
 */
export const InteractiveSplitting: Story = {
  render: () => <InteractiveSplittingStory />,
};

const EmptyStory = (): React.ReactElement => {
  const manager = useMemo(() => new PaneTreeStateManager(), []);
  return (
    <div style={FRAME_STYLE}>
      <PaneTree
        manager={manager}
        renderLeaf={({ id }) => leafBody(id)}
        emptyContent={
          <div
            style={{
              margin: 'auto',
              color: '#6a6a6a',
              fontStyle: 'italic',
            }}
          >
            No panes yet.
          </div>
        }
      />
    </div>
  );
};

/**
 * An empty tree with custom `emptyContent`. Demonstrates how the renderer
 * handles the "no root" case without crashing.
 */
export const Empty: Story = {
  render: () => <EmptyStory />,
};
