import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { SplitPane } from './SplitPane';

const meta = {
  title: 'Core/SplitPane',
  component: SplitPane,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
    },
    minSize: { control: { type: 'number', min: 0, max: 100 } },
    maxSize: { control: { type: 'number', min: 0, max: 100 } },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof SplitPane>;

export default meta;
type Story = StoryObj<typeof meta>;

const FRAME = (children: React.ReactNode): React.ReactElement => (
  <div
    style={{
      width: 560,
      height: 320,
      background: '#1e1e1e',
      border: '1px solid #3c3c3c',
    }}
  >
    {children}
  </div>
);

const pane = (title: string, color: string): React.ReactElement => (
  <div
    style={{
      width: '100%',
      height: '100%',
      background: color,
      color: '#d4d4d4',
      fontFamily: 'ui-monospace, monospace',
      fontSize: 13,
      padding: 12,
      boxSizing: 'border-box',
    }}
  >
    {title}
  </div>
);

const ControlledPanelStory = (args: React.ComponentProps<typeof SplitPane>) => {
  const [firstSize, setFirstSize] = useState(args.firstSize);
  return FRAME(
    <SplitPane {...args} firstSize={firstSize} onResize={setFirstSize} />,
  );
};

/**
 * A horizontal split with an editor-style sidebar (30%) and main panel.
 * The size is owned by the story and passed as a controlled value.
 */
export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
    minSize: 10,
    maxSize: 90,
    firstSize: 30,
    firstSubPane: pane('Sidebar (30%)', '#252526'),
    secondSubPane: pane('Editor', '#1e1e1e'),
  },
  render: ControlledPanelStory,
};

/**
 * A vertical split showing the main content on top and a console on the
 * bottom.
 */
export const Vertical: Story = {
  args: {
    orientation: 'vertical',
    minSize: 10,
    maxSize: 90,
    firstSize: 65,
    firstSubPane: pane('Content (65%)', '#1e1e1e'),
    secondSubPane: pane('Console', '#252526'),
  },
  render: ControlledPanelStory,
};

const NestedStory = (args: React.ComponentProps<typeof SplitPane>) => {
  const [outer, setOuter] = useState(25);
  const [inner, setInner] = useState(70);
  return FRAME(
    <SplitPane
      {...args}
      firstSize={outer}
      onResize={setOuter}
      firstSubPane={pane('Sidebar', '#252526')}
      secondSubPane={
        <SplitPane
          orientation="vertical"
          firstSize={inner}
          onResize={setInner}
          firstSubPane={pane('Editor', '#1e1e1e')}
          secondSubPane={pane('Terminal', '#252526')}
        />
      }
    />,
  );
};

/**
 * A nested split: an outer horizontal split where the right pane is itself
 * a vertical split. Demonstrates that `SplitPane` composes cleanly without
 * any state manager.
 */
export const Nested: Story = {
  args: {
    orientation: 'horizontal',
    firstSize: 25,
    firstSubPane: pane('Sidebar', '#252526'),
    secondSubPane: null,
  },
  render: NestedStory,
};

const DisabledStory = (args: React.ComponentProps<typeof SplitPane>) =>
  FRAME(<SplitPane {...args} />);

/**
 * A read-only, fixed layout: the splitter is disabled so the 40/60 layout
 * can't be resized. Still announces its state via `aria-disabled`.
 */
export const Disabled: Story = {
  args: {
    orientation: 'horizontal',
    firstSize: 40,
    disabled: true,
    firstSubPane: pane('Locked 40%', '#252526'),
    secondSubPane: pane('Locked 60%', '#1e1e1e'),
  },
  render: DisabledStory,
};
