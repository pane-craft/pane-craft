/* eslint-disable no-console */
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Tab } from './Tab';

const meta = {
  title: 'Core/Tab',
  component: Tab,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    id: { control: 'number' },
    label: { control: 'text' },
    isActive: { control: 'boolean' },
    isDragged: { control: 'boolean' },
    dropTargetSide: {
      control: 'select',
      options: [null, 'left', 'right'],
    },
    isCloseable: { control: 'boolean' },
    onClose: {},
    className: { control: 'text' },
  },
} satisfies Meta<typeof Tab>;

export default meta;
type Story = StoryObj<typeof meta>;

// Base states ----------------------------------------------------------------

/**
 * The default resting state — inactive, not being dragged, no close callback.
 */
export const Default: Story = {
  args: {
    id: 0,
    label: 'Default Tab',
  },
};

/**
 * The currently selected tab. Rendered with a colored top-border accent and a
 * lighter background.
 */
export const Active: Story = {
  args: {
    id: 1,
    label: 'Active Tab',
    isActive: true,
  },
};

// Close button variants ------------------------------------------------------

/**
 * An inactive tab with a close button and callback. The close button carries
 * an `aria-label` of `"Close ${label}"` so screen readers announce the target.
 */
export const WithCloseCallback: Story = {
  args: {
    id: 10,
    label: 'Close Callback',
    onClose: (id) => {
      console.log('close', id);
    },
  },
};

/**
 * A "pinned" tab — `isCloseable={false}` removes the close button entirely so
 * the tab cannot be dismissed by the user.
 */
export const WithoutClose: Story = {
  args: {
    id: 11,
    label: 'Without Close',
    isCloseable: false,
  },
};

// Drag-and-drop states -------------------------------------------------------

/**
 * The tab the user is currently dragging.
 *
 * Rendered dimmed and slightly larger. Your controller should set
 * `isDragged={true}` on the source tab while a drag is in progress.
 */
export const Dragging: Story = {
  args: {
    id: 20,
    label: 'Dragging',
    isDragged: true,
  },
};

/**
 * A drop target with the indicator on the **left** edge.
 *
 * A tab becomes a drop target when the user is dragging a different tab on top
 * of this tab. Use when the dragged tab is hovering over the left half of this
 * tab, indicating it will be inserted to the left.
 */
export const DropTargetLeft: Story = {
  args: {
    id: 21,
    label: 'Dropping Left',
    isActive: false,
    isDragged: false,
    dropTargetSide: 'left',
    isCloseable: false,
  },
};

/**
 * A drop target with the indicator on the **right** edge.
 *
 * A tab becomes a drop target when the user is dragging a different tab on top
 * of this tab. Use when the dragged tab is hovering over the right half of this
 * tab, indicating it will be inserted to the right.
 */
export const DropTargetRight: Story = {
  args: {
    id: 22,
    label: 'Dropping Right',
    isActive: false,
    isDragged: false,
    dropTargetSide: 'right',
    isCloseable: false,
  },
};

// Accessibility --------------------------------------------------------------

/**
 * Demonstrates the `a11y` prop, which passes ARIA properties to the root `div`
 * element of the tab. Consumers can override default values or forward
 * additional properties. The default values `Tab` uses are:
 *
 * - `role="tab"` — identifies the element as a tab control
 * - `aria-selected` — based on `isActive`, tells assistive technology knows
 *   which tab is current
 * - `tabIndex` — `0` for the active tab, `-1` for all others
 *
 * See APG Tabs Pattern (https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) for
 * more information.
 */
export const AccessibilityOverride: Story = {
  args: {
    id: 30,
    label: 'A11y Override',
    a11y: {
      tabIndex: 1,
      'aria-label': 'test-label',
    },
  },
};

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

/**
 * A title long enough to overflow the tab's `max-width`, appending an ellipsis
 * via CSS `text-overflow`.
 */
export const LongLabel: Story = {
  args: {
    id: 40,
    label: 'A longer label that overflows',
  },
};
