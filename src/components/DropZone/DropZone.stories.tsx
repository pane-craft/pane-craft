/* eslint-disable no-console */
import { useMemo, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { DragStateManager } from '../../state/DragStateManager';
import { type DropZonePosition } from '../../types/DropZone.type';
import { type TabItem } from '../../types/Tab.type';
import { DropZone } from './DropZone';

const meta = {
  title: 'Core/DropZone',
  component: DropZone,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    paneId: { control: 'number' },
    edgeSize: { control: 'text' },
    className: { control: 'text' },
  },
} satisfies Meta<typeof DropZone>;

export default meta;
type Story = StoryObj<typeof meta>;

const BasicOverlayStory = (args: React.ComponentProps<typeof DropZone>) => {
  const dragManager = useMemo(() => new DragStateManager(), []);
  const tab: TabItem = { id: 1, label: 'Drag Test' };
  const [lastDrop, setLastDrop] = useState<DropZonePosition | null>(null);

  return (
    <div
      style={{
        position: 'relative',
        width: 480,
        height: 320,
        background: '#1e1e1e',
        border: '1px solid #3c3c3c',
        color: '#d4d4d4',
        fontFamily: 'ui-monospace, monospace',
        fontSize: 13,
      }}
    >
      <div style={{ padding: 16 }}>
        <div
          draggable
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', String(tab.id));
            dragManager.start(tab, 0);
          }}
          onDragEnd={() => {
            dragManager.end();
          }}
          style={{
            display: 'inline-block',
            padding: '8px 12px',
            background: '#2d2d30',
            border: '1px solid #3c3c3c',
            borderRadius: 4,
            cursor: 'grab',
          }}
        >
          Click me to drag. Drop me on any zone.
        </div>
        <div style={{ marginTop: 16 }}>Last drop: {lastDrop ?? '—'}</div>
      </div>
      <DropZone
        {...args}
        dragAndDropManager={dragManager}
        onDrop={({ pos }) => {
          console.log('dropped on', pos);
          setLastDrop(pos);
        }}
      />
    </div>
  );
};

/**
 * A stand-alone `DropZone` overlaying a single draggable card. The overlay
 * only becomes interactive while the card is in flight. Drops print the
 * chosen zone to the console.
 */
export const BasicOverlay: Story = {
  render: BasicOverlayStory,
};

/**
 * Same overlay as `BasicOverlay`, but with the four edge zones made smaller
 * via the `edgeSize` prop. The prop accepts any CSS `<length>` or
 * `<percentage>` value — `'15%'` changes size based on the parent's size,
 * but fixed-width options such as `rem` are available as well.
 *
 * Try editing the `edgeSize` control in the Storybook panel (e.g. `'10%'`,
 * `'8rem'`, `'80px'`) to see the edges resize live.
 */
export const CustomEdgeSize: Story = {
  args: { edgeSize: '15%' },
  render: BasicOverlayStory,
};
