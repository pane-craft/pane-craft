import type { Meta, StoryObj } from '@storybook/react-vite';

import { createLoremIpsumText } from '../../test-utils/test.util';
import { ScrollPane } from './ScrollPane';

const meta = {
  title: 'Core/ScrollPane',
  component: ScrollPane,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    trackClickMode: { control: 'select', options: ['jump', 'increment'] },
    autoHide: { control: 'boolean' },
  },
} satisfies Meta<typeof ScrollPane>;

export default meta;
type Story = StoryObj<typeof meta>;

// Common styling for the text container
const TEXT_STYLE: React.CSSProperties = {
  padding: '8px 12px',
  color: '#cccccc',
  fontFamily: 'Segoe UI, sans-serif',
  fontSize: 13,
  lineHeight: 1.6,
};

const HORIZONTAL_DECORATOR = (Story: React.ComponentType) => (
  <div
    style={{
      width: 320,
      height: 48,
      background: '#1e1e1e',
    }}
  >
    <Story />
  </div>
);

const VERTICAL_DECORATOR = (Story: React.ComponentType) => (
  <div
    style={{
      width: 240,
      height: 240,
      background: '#1e1e1e',
    }}
  >
    <Story />
  </div>
);

/**
 * Demonstrates horizontal overflow using a long string of generated text.
 */
export const HorizontalOverflow: Story = {
  decorators: [HORIZONTAL_DECORATOR],
  args: {
    orientation: 'horizontal',
    children: (
      <div style={{ ...TEXT_STYLE, whiteSpace: 'nowrap' }}>
        {createLoremIpsumText(500)}
      </div>
    ),
  },
};

/**
 * A vertical scroll pane wrapping a large block of generated text.
 */
export const VerticalOverflow: Story = {
  decorators: [VERTICAL_DECORATOR],
  args: {
    orientation: 'vertical',
    children: <div style={TEXT_STYLE}>{createLoremIpsumText(2000)}</div>,
  },
};

/**
 * When content is short enough to fit, the scrollbar is automatically hidden.
 */
export const NoOverflow: Story = {
  decorators: [HORIZONTAL_DECORATOR],
  args: {
    orientation: 'horizontal',
    children: <div style={TEXT_STYLE}>{createLoremIpsumText(17)}</div>,
  },
};

/**
 * Disabling `autoHide` keeps the scrollbar visible as long as there is
 * overflow.
 */
export const AlwaysVisible: Story = {
  decorators: [HORIZONTAL_DECORATOR],
  args: {
    orientation: 'horizontal',
    autoHide: false,
    children: (
      <div style={{ ...TEXT_STYLE, whiteSpace: 'nowrap' }}>
        {createLoremIpsumText(500)}
      </div>
    ),
  },
};

/**
 * Clicks on the track move the scroll position by increments rather than
 * jumping.
 */
export const IncrementInteraction: Story = {
  decorators: [HORIZONTAL_DECORATOR],
  args: {
    orientation: 'horizontal',
    trackClickMode: 'increment',
    autoHide: false,
    children: (
      <div style={{ ...TEXT_STYLE, whiteSpace: 'nowrap' }}>
        {createLoremIpsumText(1000)}
      </div>
    ),
  },
};
