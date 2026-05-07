import type React from 'react';
import { useMemo } from 'react';

import { DragStateManager } from '../../state/DragStateManager';
import '../../styles/tokens-primitive.css';
import '../../styles/tokens-semantic.css';
import { type DynamicTabPaneLeafProps } from '../../types/DynamicTabPaneLeaf.type';
import { DropZone } from '../DropZone/DropZone';
import { StaticTabPane } from '../StaticTabPane/StaticTabPane';
import styles from './DynamicTabPaneLeaf.module.css';

export type { DynamicTabPaneLeafProps } from '../../types/DynamicTabPaneLeaf.type';

/**
 * The batteries-included leaf pane: `StaticTabPane` plus a `DropZone` overlay
 * on the content region.
 *
 * @remarks
 * `DynamicTabPaneLeaf` is what consumers drop into a pane tree. It combines:
 *
 * - A `StaticTabPane` (tab bar + content region) — handles same-list
 *   reordering and cross-pane moves via the tab header.
 * - A `DropZone` overlay nested inside the `StaticTabPane`'s content area —
 *   covers only the content region (not the tab bar) and exposes five hit
 *   regions (`center` plus four edges) that the consumer can interpret as
 *   cross-pane moves or pane splits.
 *
 * Both share a single {@link DragStateManager} so the overlay knows the
 * instant a drag starts on any participating tab bar. The overlay sits
 * inside the content region — the tab bar is its sibling, not its
 * descendant — so drop zones never overlay or swallow tab-reorder gestures,
 * and they stay invisible until the pointer actually enters the content
 * area.
 *
 * The component is headless with respect to the consequences of a zone
 * drop: the `onDropZoneDrop` callback delivers the dragged tab and the
 * position, but splits and moves are the consumer's responsibility. The
 * pane-tree component (`SplitPane`) is expected to own that logic.
 *
 * @example
 * Two leaf panes sharing one drag manager — drag tabs between them, drop on
 * an edge zone to (in your handler) split the pane:
 * ```tsx
 * const drag = useMemo(() => new DragStateManager(), []);
 *
 * return (
 *   <div style={{ display: 'flex', gap: 8 }}>
 *     <DynamicTabPaneLeaf
 *       paneId={0}
 *       tabManager={left}
 *       dragAndDropManager={drag}
 *       onDropZoneDrop={handleDropZone}
 *       ...
 *     />
 *     <DynamicTabPaneLeaf
 *       paneId={1}
 *       tabManager={right}
 *       dragAndDropManager={drag}
 *       onDropZoneDrop={handleDropZone}
 *       ...
 *     />
 *   </div>
 * );
 * ```
 *
 * @see {@link DynamicTabPaneLeafProps} for full prop documentation.
 */
export const DynamicTabPaneLeaf: React.FC<DynamicTabPaneLeafProps> = ({
  tabManager,
  paneId = 0,
  dragAndDropManager,
  isScrollable = true,
  onTabClick,
  onTabClose,
  onTabDrop,
  onTabListDrop,
  onDropZoneDrop,
  emptyContent = null,
  dropZonePosList,
  edgeSize,
  CustomTabComponent,
  className = '',
  tabListClassName,
  contentClassName,
  dropZoneClassName,
  a11y = {},
}) => {
  const sharedDragManager = useMemo(
    () => dragAndDropManager ?? new DragStateManager(),
    [dragAndDropManager],
  );

  const rootClasses = [styles.dynamicTabPaneLeaf, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={rootClasses}
      data-testid="dynamic-tab-pane-leaf"
      data-pane-id={paneId}
      {...a11y}
    >
      <StaticTabPane
        tabManager={tabManager}
        paneId={paneId}
        dragAndDropManager={sharedDragManager}
        isScrollable={isScrollable}
        onTabClick={onTabClick}
        onTabClose={onTabClose}
        onTabDrop={onTabDrop}
        onTabListDrop={onTabListDrop}
        CustomTabComponent={CustomTabComponent}
        emptyContent={emptyContent}
        tabListClassName={tabListClassName}
        contentClassName={contentClassName}
      >
        <DropZone
          paneId={paneId}
          dragAndDropManager={sharedDragManager}
          onDrop={onDropZoneDrop}
          dropZonePosList={dropZonePosList}
          edgeSize={edgeSize}
          className={dropZoneClassName}
        />
      </StaticTabPane>
    </div>
  );
};
