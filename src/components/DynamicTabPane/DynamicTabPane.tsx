import type React from 'react';
import { useCallback, useEffect, useState } from 'react';

import '../../styles/tokens-primitive.css';
import '../../styles/tokens-semantic.css';
import {
  type DropZoneDropPayload,
  type DropZonePosition,
} from '../../types/DropZone.type';
import { type DynamicTabPaneProps } from '../../types/DynamicTabPane.type';
import {
  type LeafId,
  type SplitSide,
} from '../../types/PaneTreeStateManager.type';
import {
  type TabListDropPayload,
  type TabDropPayload,
} from '../../types/useTabDragAndDrop.type';
import { DynamicTabPaneLeaf } from '../DynamicTabPaneLeaf/DynamicTabPaneLeaf';
import { PaneTree } from '../PaneTree/PaneTree';
import styles from './DynamicTabPane.module.css';

export type { DynamicTabPaneProps } from '../../types/DynamicTabPane.type';

const DROP_POSITION_TO_SIDE: Record<
  Exclude<DropZonePosition, 'center'>,
  SplitSide
> = {
  top: 'top',
  bottom: 'bottom',
  left: 'left',
  right: 'right',
};

/**
 * Compute the insertion index inside a target pane's order when a tab is
 * dropped on top of another tab. `'left'` places the dragged tab before the
 * target; `'right'` places it after.
 */
const computeDropIndex = (
  targetOrder: readonly number[],
  targetTabId: number,
  side: 'left' | 'right',
  draggedTabId: number,
): number => {
  const filtered = targetOrder.filter((id) => id !== draggedTabId);

  const idx = filtered.indexOf(targetTabId);
  if (idx === -1) {
    return filtered.length;
  }

  return side === 'left' ? idx : idx + 1;
};

/**
 * The batteries-included dynamic tab pane, managing the tree of split panes
 * and tab lifecycles for each nested tab pane.
 *
 * @remarks
 * `DynamicTabPane` is the end-of-line component in the PaneCraft pane stack: it
 * takes a {@link DynamicTabPaneStateManager} and renders a {@link PaneTree}
 * whose every leaf is a {@link DynamicTabPaneLeaf} unit wired to a single shared
 * drag-and-drop manager. All of the plumbing between the tree, the tab
 * collections, and the drag system is handled internally — the consumer only
 * interacts with the state manager.
 *
 * Drop behaviour:
 *
 * - **Tab on tab (same pane)** — reorder: the dragged tab is moved next to
 *   the target tab, on the target's indicated side.
 * - **Tab on tab (different panes)** — cross-pane move: the dragged tab is
 *   inserted into the target pane at the target tab's side. If the source
 *   pane ends up empty it collapses.
 * - **Tab on empty tab-bar space** — cross-pane move to the end of the target
 *   pane (or reorder-to-end in the same pane).
 * - **Tab on center zone** — cross-pane move, appended.
 * - **Tab on edge zone** — pane split: a new sibling leaf is created on the
 *   dropped edge and the tab lands inside it.
 *
 * The nested {@link DynamicTabPaneLeaf} components use the state manager's own
 * `dragAndDrop` instance, so cross-pane drags work across every leaf without
 * further configuration.
 *
 * Tab content uses each {@link TabItem}'s inline `content?: ReactNode` field
 * (the same mechanism used by the underlying {@link StaticTabPane}). This
 * will be revisited in a future review phase.
 *
 * @example
 * ```tsx
 * const ws = useMemo(() => {
 *   const m = new DynamicTabPaneStateManager();
 *   m.openTab({ id: 1, label: 'index.ts', content: <Editor path="index.ts" /> });
 *   m.openTab({ id: 2, label: 'styles.css', content: <Editor path="styles.css" /> });
 *   return m;
 * }, []);
 *
 * return (
 *   <div style={{ width: '100vw', height: '100vh' }}>
 *     <DynamicTabPane manager={ws} />
 *   </div>
 * );
 * ```
 *
 * @see {@link DynamicTabPaneProps} for full prop documentation.
 */
export const DynamicTabPane: React.FC<DynamicTabPaneProps> = ({
  manager,
  emptyContent = null,
  emptyPaneContent = null,
  minSize = 10,
  disabled = false,
  dropZonePosList,
  edgeSize,
  CustomTabComponent,
  className = '',
  splitClassName,
  leafClassName,
  splitterClassName,
  tabListClassName,
  contentClassName,
  dropZoneClassName,
  a11y = {},
}) => {
  const [, setVersion] = useState(0);

  // Reset when the manager instance is swapped out.
  const [lastManager, setLastManager] = useState(manager);
  if (lastManager !== manager) {
    setLastManager(manager);
    setVersion((n) => n + 1);
  }

  useEffect(
    () =>
      manager.subscribe(() => {
        setVersion((n) => n + 1);
      }),
    [manager],
  );

  const handleTabClick = useCallback(
    (leafId: LeafId) => (): void => {
      manager.setActiveLeaf(leafId);
    },
    [manager],
  );

  const handleTabClose = useCallback(
    (tab: { id: number }): void => {
      manager.closeTab(tab.id);
    },
    [manager],
  );

  const handleTabDrop = useCallback(
    (data: TabDropPayload): void => {
      const { tab, sourcePaneId, targetPaneId, targetTab, side } = data;
      const targetTabs = manager.getTabs(targetPaneId);
      if (targetTabs === null) {
        return;
      }

      const index = computeDropIndex(
        targetTabs.getState().order,
        targetTab.id,
        side,
        tab.id,
      );
      manager.moveTab(tab.id, sourcePaneId, targetPaneId, index);
    },
    [manager],
  );

  const handleListDrop = useCallback(
    (data: TabListDropPayload): void => {
      const { tab, sourcePaneId, targetPaneId } = data;
      manager.moveTab(tab.id, sourcePaneId, targetPaneId);
    },
    [manager],
  );

  const handleDropZoneDrop = useCallback(
    (data: DropZoneDropPayload): void => {
      const { tab, sourcePaneId, targetPaneId, pos } = data;

      if (pos === 'center') {
        manager.moveTab(tab.id, sourcePaneId, targetPaneId);
        return;
      }

      manager.splitLeafWithTab(
        sourcePaneId,
        targetPaneId,
        tab.id,
        DROP_POSITION_TO_SIDE[pos],
      );
    },
    [manager],
  );

  const rootClasses = [styles.dynamicTabPane, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={rootClasses}
      data-testid="dynamicTab-pane"
      data-active-leaf-id={manager.activeLeafId ?? ''}
      {...a11y}
    >
      <PaneTree
        manager={manager.paneTreeManager}
        minSize={minSize}
        disabled={disabled}
        splitClassName={splitClassName}
        leafClassName={leafClassName}
        splitterClassName={splitterClassName}
        emptyContent={emptyContent}
        renderLeaf={({ id }) => {
          const tabs = manager.getTabs(id);

          if (tabs === null) {
            return null;
          }

          return (
            <DynamicTabPaneLeaf
              tabManager={tabs}
              paneId={id}
              dragAndDropManager={manager.dragManager}
              onTabClick={handleTabClick(id)}
              onTabClose={handleTabClose}
              onTabDrop={handleTabDrop}
              onTabListDrop={handleListDrop}
              onDropZoneDrop={handleDropZoneDrop}
              emptyContent={emptyPaneContent}
              dropZonePosList={dropZonePosList}
              edgeSize={edgeSize}
              CustomTabComponent={CustomTabComponent}
              tabListClassName={tabListClassName}
              contentClassName={contentClassName}
              dropZoneClassName={dropZoneClassName}
            />
          );
        }}
      />
    </div>
  );
};
