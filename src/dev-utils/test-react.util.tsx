import { type TabId, type TabItem } from '../types/Tab.type';
import { type CustomTabProps } from '../types/TabList.type';
import { createLoremIpsumText } from './test.util';

export const FRAME_DYNAMIC_PANE: React.CSSProperties = {
  width: '100vw',
  height: '100vh',
  background: '#1e1e1e',
  color: '#d4d4d4',
  fontFamily: 'ui-monospace, monospace',
  fontSize: 13,
};

/**
 * A function for getting consistent CSS for use in Storybook stories.
 * @param width - The width of the element.
 * @param height - The height of the element.
 * @param styleOverrides - A {@link React.CSSProperties} object that overrides
 *   the default styles.
 * @returns A {@link React.CSSProperties} object for styling an element.
 */
export const getBodyCss = (
  width: number,
  height: number,
  styleOverrides?: React.CSSProperties,
): React.CSSProperties => ({
  width,
  height,
  background: '#1e1e1e',
  border: '1px solid #3c3c3c',
  ...styleOverrides,
});

/**
 * A function for creating a Storybook decorator.
 * @param width - The width of the container element.
 * @param height - The height of the container element.
 * @param styleOverrides - A {@link React.CSSProperties} object that overrides
 *   the frame's default styles.
 * @returns A wrapper to display a Storybook story in.
 */
export const createFrameDecorator = (
  width: number,
  height: number,
  styleOverrides?: React.CSSProperties,
) => {
  const Decorator = (Story: React.ComponentType) => (
    <div style={getBodyCss(width, height, styleOverrides)}>
      <Story />
    </div>
  );

  return Decorator;
};

/**
 * A function for creating a tab's content area. Used in Storybook stories.
 * @param label - The base label to assign to each tab. A label of 'Tab' will
 *   display tabs labeled 'Tab 1', 'Tab 2', etc.
 * @param startingId - Text to be displayed in the body after the header text.
 *   Defaults to 'Lorem Ipsum' text.
 * @returns A React node for displaying the content.
 */
export const createTabContent = (label: string, body?: string) => {
  const bodyStyle: React.CSSProperties = {
    padding: 16,
    color: '#d4d4d4',
    fontFamily: 'ui-monospace, monospace',
    fontSize: 13,
    lineHeight: 1.5,
  };

  return (
    <div style={bodyStyle}>
      <div style={{ color: '#9cdcfe', marginBottom: 8 }}>{label}</div>
      <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
        {body ?? createLoremIpsumText(100)}
      </pre>
    </div>
  );
};

/**
 * A function for creating a test list of {@link TabItem}s.
 * @param numTabs - The number of test tabs to create.
 * @param label - The base label to assign to each tab. Optional, defaults to
 *   'Tab'.
 * @param startingId - The number to start the sequential ids with.
 * @returns A list of {@link TabItem}s.
 */
export const createTabItemList = (
  numTabs: number,
  label = 'Tab',
  startingId = 1,
): TabItem[] =>
  Array.from({ length: numTabs }, (_, i) => ({
    id: i + startingId,
    label: `${label} ${i + 1}`,
    content: createTabContent(`${label} ${i + 1}`),
  }));

/**
 * Builds the `data-testid` rendered by the component from
 * {@link createCustomTab}, so tests can query a specific custom tab by id.
 *
 * @param id - The tab id.
 * @returns The test id string.
 */
export const getCustomTabTestId = (id: TabId): string => `custom-tab-${id}`;

/**
 * Creates a minimal custom tab component for demonstrating a {@link TabList}'s
 * `CustomTabComponent` prop.
 *
 * @remarks
 * The returned component renders a `role="tab"` element containing the tab
 * label and tagged with {@link getCustomTabTestId}. Pass an `onRender`
 * callback to capture the props the host passes down — e.g. to assert the
 * `manager` is threaded through to the custom tab.
 *
 * @param onRender - Optional spy invoked with the component's props on every
 *   render.
 * @returns A React component for `CustomTabComponent`.
 */
export const createCustomTab = (
  onRender?: (props: CustomTabProps) => void,
): React.FC<CustomTabProps> => {
  const CustomTab: React.FC<CustomTabProps> = (props) => {
    onRender?.(props);

    return (
      <div data-testid={getCustomTabTestId(props.id)} role="tab">
        {props.label}
      </div>
    );
  };

  return CustomTab;
};
