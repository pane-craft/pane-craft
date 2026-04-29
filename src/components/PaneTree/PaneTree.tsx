import type React from 'react';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';

import { DEFAULT_SPLIT_PANE_OPTIONS } from '../../config/defaults';
import { type PaneTreeStateManager } from '../../state/PaneTreeStateManager';
import '../../styles/tokens-primitive.css';
import '../../styles/tokens-semantic.css';
import { type PaneTreeProps } from '../../types/PaneTree.type';
import {
  isLeafNode,
  type LeafId,
  type PaneNode,
  type PaneNodeSplit,
} from '../../types/PaneTreeStateManager.type';
import { clamp } from '../../utils/utils';
import { PaneSplitter } from '../PaneSplitter/PaneSplitter';
import styles from './PaneTree.module.css';

export type { PaneTreeProps } from '../../types/PaneTree.type';

const getFirstLeafId = (node: PaneNode): LeafId | null => {
  if (isLeafNode(node)) {
    return node.id;
  }

  if (node.children.length === 0) {
    return null;
  }

  return getFirstLeafId(node.children[0]);
};

/**
 * Best-effort stable key for a node among its siblings.
 *
 * @remarks
 * Leaves key by id. Splits key by their leftmost descendant leaf so that
 * wrapping or unwrapping a leaf in a split preserves the key when the
 * leftmost leaf stays the same.
 */
const getNodeKey = (node: PaneNode, fallbackIndex: number): string => {
  if (isLeafNode(node)) {
    return `leaf-${node.id}`;
  }

  const firstId = getFirstLeafId(node);
  return firstId !== null ? `subtree-${firstId}` : `split-${fallbackIndex}`;
};

type SharedRenderContext = {
  manager: PaneTreeStateManager;
  renderLeaf: PaneTreeProps['renderLeaf'];
  minSize: number;
  disabled: boolean;
  splitClassName?: string;
  leafClassName?: string;
  splitterClassName?: string;
};

type PaneTreeNodeProps = {
  node: PaneNode;
  path: readonly number[];
  context: SharedRenderContext;
};

const PaneTreeLeafNode: React.FC<{
  id: LeafId;
  context: SharedRenderContext;
}> = ({ id, context }) => {
  const leafClasses = [styles.leaf, context.leafClassName]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={leafClasses} data-testid="pane-tree-leaf" data-leaf-id={id}>
      {context.renderLeaf({ id })}
    </div>
  );
};

const PaneTreeSplitNode: React.FC<{
  node: PaneNodeSplit;
  path: readonly number[];
  context: SharedRenderContext;
}> = ({ node, path, context }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const startSizesRef = useRef(node.sizes);

  const { manager, minSize, disabled, splitClassName, splitterClassName } =
    context;

  const handleResizeStart = useCallback((): void => {
    startSizesRef.current = [...node.sizes];
  }, [node.sizes]);

  const handleDragResize = useCallback(
    (splitterIndex: number) =>
      (deltaPixels: number): void => {
        if (!containerRef.current) {
          return;
        }

        const rect = containerRef.current.getBoundingClientRect();

        const total =
          node.orientation === 'horizontal' ? rect.width : rect.height;
        if (total <= 0) {
          return;
        }
        const deltaPercent = (deltaPixels / total) * 100;

        const startSizes = startSizesRef.current;
        const startBefore = startSizes[splitterIndex];
        const startAfter = startSizes[splitterIndex + 1];
        const maxDelta = startAfter - minSize;
        const minDelta = minSize - startBefore;
        const clamped = clamp(deltaPercent, minDelta, maxDelta);

        const newSizes = [...startSizes];
        newSizes[splitterIndex] = startBefore + clamped;
        newSizes[splitterIndex + 1] = startAfter - clamped;
        manager.resizeSplit(path, newSizes);
      },
    [manager, minSize, node.orientation, path],
  );

  const handleKeyResize = useCallback(
    (splitterIndex: number) =>
      (deltaPercent: number): void => {
        const current = [...node.sizes];
        const before = current[splitterIndex];
        const after = current[splitterIndex + 1];
        const maxDelta = after - minSize;
        const minDelta = minSize - before;
        const clamped = clamp(deltaPercent, minDelta, maxDelta);
        current[splitterIndex] = before + clamped;
        current[splitterIndex + 1] = after - clamped;
        manager.resizeSplit(path, current);
      },
    [manager, minSize, node.sizes, path],
  );

  const rootClasses = [
    styles.split,
    node.orientation === 'horizontal'
      ? styles.splitHorizontal
      : styles.splitVertical,
    splitClassName,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={containerRef}
      className={rootClasses}
      data-testid="pane-tree-split"
      data-orientation={node.orientation}
    >
      {node.children.map((child, i) => {
        const childKey = getNodeKey(child, i);
        const childPath = [...path, i];
        const showSplitter = i < node.children.length - 1;

        return (
          <Fragment key={childKey}>
            <div
              className={styles.childSlot}
              style={{ flex: `${node.sizes[i]} 1 0` }}
              data-testid="pane-tree-slot"
            >
              <PaneTreeNode node={child} path={childPath} context={context} />
            </div>
            {showSplitter && (
              <PaneSplitter
                orientation={node.orientation}
                disabled={disabled}
                onResizeStart={handleResizeStart}
                onDragResize={handleDragResize(i)}
                onKeyResize={handleKeyResize(i)}
                ariaValueNow={Math.round(node.sizes[i])}
                ariaValueMin={minSize}
                ariaValueMax={100 - minSize}
                className={splitterClassName}
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
};

const PaneTreeNode: React.FC<PaneTreeNodeProps> = ({ node, path, context }) => {
  if (isLeafNode(node)) {
    return <PaneTreeLeafNode id={node.id} context={context} />;
  }
  return <PaneTreeSplitNode node={node} path={path} context={context} />;
};

/**
 * Recursive renderer controlled by a {@link PaneTreeStateManager}.
 *
 * @remarks
 * `PaneTree` walks the tree owned by `manager` and builds a nested flex
 * layout: each split becomes a `flex` container along its orientation
 * axis, each leaf is sent to `renderLeaf` for content, and a draggable
 * {@link PaneSplitter} is inserted between every pair of siblings. The
 * renderer subscribes to the manager, so any mutation triggers a re-render.
 *
 * The tree is content agnostic — `renderLeaf` can return any React node, so
 * `PaneTree` is equally useful for sidebar/editor/preview layouts, diff
 * viewers, or anything else that needs a dynamic, user-resizable pane
 * hierarchy. For the batteries-included combination with the tab system
 * (tabs-per-leaf, drop-to-split), see {@link WorkspacePane}.
 *
 * @example
 * ```tsx
 * const treeManager = useMemo(() => {
 *   const t = new PaneTreeStateManager();
 *   t.addLeaf(1);
 *   t.splitLeaf(1, 2, 'right');
 *   return t;
 * }, []);
 *
 * return (
 *   <PaneTree
 *     manager={treeManager}
 *     renderLeaf={({ id }) => <Editor fileId={id} />}
 *   />
 * );
 * ```
 *
 * @see {@link PaneTreeProps} for full prop documentation.
 */
export const PaneTree: React.FC<PaneTreeProps> = ({
  manager,
  renderLeaf,
  emptyContent = null,
  minSize = DEFAULT_SPLIT_PANE_OPTIONS.minSize,
  disabled = false,
  className = '',
  splitClassName,
  leafClassName,
  splitterClassName,
  a11y = {},
}) => {
  const [treeState, setTreeState] = useState(() => manager.getState());

  // Reset snapshot when the manager instance changes.
  const [lastManager, setLastManager] = useState(manager);
  if (lastManager !== manager) {
    setLastManager(manager);
    setTreeState(manager.getState());
  }

  useEffect(
    () =>
      manager.subscribe(() => {
        setTreeState(manager.getState());
      }),
    [manager],
  );

  const rootClasses = [styles.paneTree, className].filter(Boolean).join(' ');
  const context: SharedRenderContext = {
    manager,
    renderLeaf,
    minSize,
    disabled,
    splitClassName,
    leafClassName,
    splitterClassName,
  };

  return (
    <div className={rootClasses} data-testid="pane-tree" {...a11y}>
      {treeState.root === null ? (
        <div className={styles.empty} data-testid="pane-tree-empty">
          {emptyContent}
        </div>
      ) : (
        <PaneTreeNode node={treeState.root} path={[]} context={context} />
      )}
    </div>
  );
};
