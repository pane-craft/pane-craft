import type React from 'react';

import { useTabList } from '../../state/useTabList';
import '../../styles/tokens-primitive.css';
import '../../styles/tokens-semantic.css';
import { type StaticTabPaneProps } from '../../types/StaticTabPane.type';
import { TabList } from '../TabList/TabList';
import styles from './StaticTabPane.module.css';

export type { StaticTabPaneProps } from '../../types/StaticTabPane.type';

/**
 * The batteries-included tab-and-content pane.
 *
 * @remarks
 * Renders a `TabList` at the top and the currently active tab's `content`
 * below it in a flex-column layout. Tab data is owned by an external (or
 * auto-created) `TabStateManager`; `StaticTabPane` does not store tabs or
 * active state itself — it subscribes to the manager and re-renders on
 * change.
 *
 * Header behaviour (selection, keyboard, close, scroll, drag-and-drop) is
 * delegated entirely to `TabList`. Close-then-fallback is handled by the
 * underlying `TabStateManager`: when the active tab is closed, it promotes
 * an adjacent tab and the content region swaps automatically.
 *
 * The content region is wrapped in a `position: relative` content area, and
 * `children` are rendered alongside the active tab content inside that area.
 * Use this slot to add absolutely-positioned overlays — typically a
 * `DropZone` — that should cover the content but not the tab bar.
 *
 * @example
 * Single pane with inline content:
 * ```tsx
 * const tabManager = useMemo(() => new TabStateManager(), []);
 * useEffect(() => {
 *   tabManager.addTab({ id: 1, label: 'README', content: <Readme /> });
 *   tabManager.addTab({ id: 2, label: 'Settings', content: <Settings /> });
 * }, [manager]);
 *
 * return <StaticTabPane tabManager={tabManager} onTabClick={onOpen} />;
 * ```
 *
 * @example
 * Two coordinated panes sharing a single drag manager so tabs can be dragged
 * between them:
 * ```tsx
 * const dragManager = useMemo(() => new DragStateManager(), []);
 *
 * return (
 *   <div style={{ display: 'flex' }}>
 *     <StaticTabPane
 *       paneId={0}
 *       tabManager={leftTabs}
 *       dragAndDropManager={dragManager}
 *       ...
 *     />
 *     <StaticTabPane
 *       paneId={1}
 *       tabManager={rightTabs}
 *       dragAndDropManager={dragManager}
 *       ...
 *     />
 *   </div>
 * );
 * ```
 *
 * @see {@link StaticTabPaneProps} for full prop documentation.
 * @see {@link TabList} for the tab-bar-only variant.
 */
export const StaticTabPane: React.FC<StaticTabPaneProps> = ({
  tabManager,
  paneId = 0,
  dragAndDropManager,
  isScrollable = true,
  onTabClick,
  onTabClose,
  onTabDrop,
  onTabListDrop,
  emptyContent = null,
  children,
  className = '',
  tabListClassName,
  contentClassName,
  a11y = {},
}) => {
  const { state, manager: resolvedTabManager } = useTabList({
    manager: tabManager,
  });

  const rootClasses = [styles.staticTabPane, className]
    .filter(Boolean)
    .join(' ');
  const contentClasses = [styles.content, contentClassName]
    .filter(Boolean)
    .join(' ');

  const activeTab = state.activeTab;
  const contentNode =
    activeTab !== null ? (activeTab.content ?? null) : emptyContent;

  return (
    <div
      className={rootClasses}
      data-testid="static-tab-pane"
      data-pane-id={paneId}
      {...a11y}
    >
      <TabList
        tabManager={resolvedTabManager}
        paneId={paneId}
        dragAndDropManager={dragAndDropManager}
        isScrollable={isScrollable}
        onTabClick={onTabClick}
        onTabClose={onTabClose}
        onTabDrop={onTabDrop}
        onTabListDrop={onTabListDrop}
        className={tabListClassName}
      />
      <div
        className={styles.contentArea}
        data-testid="static-tab-pane-content-area"
      >
        <div
          role="tabpanel"
          tabIndex={0}
          className={contentClasses}
          data-testid="static-tab-pane-content"
          data-active-tab-id={activeTab?.id ?? ''}
        >
          {contentNode}
        </div>
        {children}
      </div>
    </div>
  );
};
