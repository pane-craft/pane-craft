import { type ReactNode } from 'react';

import { type PaneTreeStateManager } from '../state/PaneTreeStateManager';
import { type BaseComponentProps } from './Base.type';
import { type LeafId } from './PaneTreeStateManager.type';

export { type LeafId } from './PaneTreeStateManager.type';

/**
 * Argument passed to {@link PaneTreeProps.renderLeaf}.
 */
export type PaneTreeLeaf = {
  /** The leaf's id within the tree. */
  id: LeafId;
};

/**
 * Props for the {@link PaneTree} component.
 *
 * @remarks
 * `PaneTree` is the renderer for {@link PaneTreeStateManager}. It walks the
 * tree and builds the nested flex layout automatically, interleaving draggable
 * splitters between siblings. The tree manager is opaque to the leaf content -
 * the consumer supplies {@link PaneTreeProps.renderLeaf} to map each leaf id
 * to a React node.
 */
export type PaneTreeProps = BaseComponentProps & {
  /**
   * The pane tree state manager. The component subscribes to it and
   * re-renders whenever the tree mutates.
   */
  manager: PaneTreeStateManager;

  /**
   * Called once per leaf to produce the content for that cell.
   *
   * @remarks
   * The return value is wrapped in a `div` with `data-testid="pane-tree-leaf"`
   * and `data-leaf-id={id}`. The wrapper fills its slot (`'100%'` width and
   * height); the consumer's content should be a flexible layout (e.g. a pane
   * component that fills its parent).
   *
   * Because the tree mutates by re-pointing leaf ids across splits, any
   * per-leaf React state that should survive structural changes must be
   * owned outside this function (lifted to a parent or a store).
   */
  renderLeaf: (leaf: PaneTreeLeaf) => ReactNode;

  /**
   * Rendered when the tree is empty (root is `null`). Receives no props.
   */
  emptyContent?: ReactNode;

  /**
   * Minimum size for any pane at a split, as a percentage of its parent
   * split. Splitter drags are clamped so no adjacent pane shrinks below
   * this.
   *
   * @default 10
   */
  minSize?: number;

  /**
   * When `true`, all splitters are disabled; the tree remains visible but
   * is not resizable.
   *
   * @default false
   */
  disabled?: boolean;

  /** Extra class name applied to each split container. */
  splitClassName?: string;

  /** Extra class name applied to each leaf wrapper. */
  leafClassName?: string;

  /** Extra class name applied to each splitter. */
  splitterClassName?: string;
};
