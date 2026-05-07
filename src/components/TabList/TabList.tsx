import type React from 'react';

import { useTabDragAndDrop } from '../../state/useTabDragAndDrop';
import { useTabList } from '../../state/useTabList';
import '../../styles/tokens-primitive.css';
import '../../styles/tokens-semantic.css';
import { type TabItem } from '../../types/Tab.type';
import { type TabListProps } from '../../types/TabList.type';
import { ScrollPane } from '../ScrollPane/ScrollPane';
import { Tab } from '../Tab/Tab';
import styles from './TabList.module.css';

export type { TabListProps } from '../../types/TabList.type';

/**
 * The batteries-included tab bar.
 *
 * @remarks
 * Renders an ordered, horizontally-scrollable row of `<Tab />` elements with
 * mouse selection, ARIA keyboard navigation, and tab drag-and-drop wired up
 * out of the box. Internally composes:
 *
 * - {@link useTabList} — selection + arrow-key activation,
 * - {@link useTabDragAndDrop} — HTML5 tab drag-and-drop,
 * - {@link ScrollPane} — overflow scrolling with a custom auto-hide scrollbar.
 *
 * Tab data is owned by an external (or auto-created) `TabStateManager`.
 * `TabList` does not store the tab collection itself — every render derives
 * from the manager. The same applies to drag state via `DragStateManager`.
 *
 * @example
 * Single-list, all defaults (auto-created managers, drag enabled within the
 * list only):
 * ```tsx
 * <TabList
 *   onTabClick={(tab) => console.log('opened', tab.id)}
 *   onTabClose={(tab) => console.log('closed', tab.id)}
 * />
 * ```
 *
 * @example
 * Two coordinated tab lists in different panes sharing one drag manager so
 * tabs can be dragged between them:
 * ```tsx
 * const dragManager = useMemo(() => new DragStateManager(), []);
 * const leftTabs = useMemo(() => new TabStateManager(), []);
 * const rightTabs = useMemo(() => new TabStateManager(), []);
 *
 * return (
 *   <>
 *     <TabList
 *       paneId={0}
 *       manager={leftTabs}
 *       dragAndDropManager={dragManager}
 *       onTabDrop={...}
 *       onTabListDrop={...}
 *     />
 *     <TabList
 *       paneId={1}
 *       manager={rightTabs}
 *       dragAndDropManager={dragManager}
 *       onTabDrop={...}
 *       onTabListDrop={...}
 *     />
 *   </>
 * );
 * ```
 *
 * @see {@link TabListProps} for full prop documentation.
 */
export const TabList: React.FC<TabListProps> = ({
  tabManager,
  paneId = 0,
  dragAndDropManager,
  isScrollable = true,
  onTabClick,
  onTabClose,
  onTabDrop,
  onTabListDrop,
  CustomTabComponent,
  className = '',
  a11y = {},
}) => {
  const {
    state,
    getTabHandlers: getSelectionHandlers,
    tabListHandlers: selectionListHandlers,
  } = useTabList({ manager: tabManager, onTabClick, onTabClose });

  const {
    state: dragState,
    getTabHandlers: getDragHandlers,
    tabListHandlers: dragListHandlers,
  } = useTabDragAndDrop({
    paneId,
    manager: dragAndDropManager,
    onTabDrop,
    onTabListDrop,
  });

  const tabListClasses = [styles.tabList, className].filter(Boolean).join(' ');

  const renderTab = (tab: TabItem) => {
    const selection = getSelectionHandlers(tab);
    const dragHandlers = getDragHandlers(tab);

    const isDraggedSource =
      dragState.isDraggingFromThisPane && dragState.draggedTab?.id === tab.id;
    const dropTargetSide =
      dragState.tabDropTargetHover?.tabId === tab.id
        ? dragState.tabDropTargetHover.side
        : null;

    const handleTabClick = () => {
      selection.onClick();
      tab.onClick?.();
    };

    const TabComponent = CustomTabComponent ?? Tab;

    return (
      <div
        key={tab.id}
        className={styles.tabWrapper}
        data-testid={`tab-wrapper-${tab.id}`}
        {...dragHandlers}
      >
        <TabComponent
          {...tab}
          isActive={selection.isActive}
          isDragged={isDraggedSource}
          dropTargetSide={dropTargetSide}
          onClick={handleTabClick}
          onClose={selection.onClose}
          manager={CustomTabComponent ? tabManager : undefined}
        />
      </div>
    );
  };

  const listInner = (
    <div
      role={selectionListHandlers.role}
      tabIndex={0}
      className={styles.list}
      data-testid="tab-list-container"
      onKeyDown={selectionListHandlers.onKeyDown}
    >
      {state.tabList.map(renderTab)}
    </div>
  );

  return (
    <div
      className={tabListClasses}
      data-testid="tab-list"
      data-pane-id={paneId}
      onDragOver={dragListHandlers.onDragOver}
      onDrop={dragListHandlers.onDrop}
      {...a11y}
    >
      {isScrollable ? (
        <ScrollPane orientation="horizontal">{listInner}</ScrollPane>
      ) : (
        listInner
      )}
    </div>
  );
};
