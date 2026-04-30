# PaneCraft

PaneCraft is a library that offers editor-like functionality out of the box, such as tabs, split panes, and drag and drop features.

Consumers can add full functionality with the top-level `DynamicTabPane`, or use smaller composable pieces like `SplitPane` or `Tab`.

## Installation

```sh
npm i @pane-craft/react
```

Peer dependencies: `react >= 18` and `react-dom >= 18`.

Import the stylesheet once at your app's entry point:

```ts
import '@pane-craft/react/styles';
```

## Quickstart

```tsx
import { useMemo } from 'react';

import { DynamicTabPane, DynamicTabPaneStateManager } from '@pane-craft/react';

export function App() {
  const manager = useMemo(
    () =>
      new dynamicTabPaneStateManager({
        initialSnapshot: {
          root: {
            isLeaf: true,
            id: 1,
            tabList: [
              {
                id: 1,
                label: 'Tab 1',
                content: <MyComponent file="index.ts" />,
              },
              {
                id: 2,
                label: 'Tab 2',
                content: <MyComponent file="styles.css" />,
              },
            ],
          },
        },
      }),
    [],
  );

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <DynamicTabPane manager={manager} />
    </div>
  );
}
```

Call `manager.getSnapshot()` at any time to serialize the current layout — pass the result back through `initialSnapshot` to restore it.

## Documentation

Coming soon.

## License

[MIT](LICENSE) © JusticeSquad
