import { type ReactNode } from 'react';

import { type DragStateManager } from '../state/DragStateManager';
import { type TabStateManager } from '../state/TabStateManager';
import { type BaseComponentProps } from './Base.type';
import {
  type DropZoneDropPayload,
  type DropZonePosition,
} from './DropZone.type';
import { type PaneId } from './Pane.type';
import { type TabItem } from './Tab.type';
import {
  type TabListDropPayload,
  type TabDropPayload,
} from './useTabDragAndDrop.type';

export { type PaneId } from './Pane.type';
export { type TabItem } from './Tab.type';
export {
  type DropZoneDropPayload,
  type DropZonePosition,
} from './DropZone.type';
export {
  type TabListDropPayload,
  type TabDropPayload,
} from './useTabDragAndDrop.type';

/**
 * Props for the {@link DynamicTabPaneLeaf} component.
 *
 * @remarks
 * `DynamicTabPaneLeaf` is the batteries-included leaf pane for a pane tree — a
 * `StaticTabPane` stacked above its content, with a `DropZone` overlay
 * covering only the content region for split/move gestures. The tab bar still
 * handles its own reorder/move drops; zone drops (`onDropZoneDrop`) are left
 * for the consumer to interpret as splits or cross-pane moves.
 *
 * For simpler cases, consumers can use `StaticTabPane` directly (no split
 * support) or create a custom component composing `TabList` + `DropZone`.
 */
export type DynamicTabPaneLeafProps = BaseComponentProps & {
  /**
   * Tab state manager that owns the tab collection.
   *
   * @remarks
   * Pass one in when the tab data is owned outside the component. When
   * omitted, an empty internal manager is created and lives for the
   * component's lifetime.
   */
  tabManager?: TabStateManager;

  /**
   * Identifier used by the drag system to distinguish this pane from other
   * panes in the same drag session.
   *
   * @remarks
   * Cross-pane drag-and-drop requires every participating `DynamicTabPaneLeaf`
   * to share a single `dragAndDropManager` and have a unique `paneId`.
   *
   * @default 0
   */
  paneId?: PaneId;

  /**
   * Shared drag state manager.
   *
   * @remarks
   * Forwarded to both the internal `StaticTabPane` and `DropZone`, so the
   * overlay reacts to drags that originate in the tab bar (or in any other
   * `DynamicTabPaneLeaf` sharing the same manager). When omitted, an internal
   * manager is created — cross-pane drag-and-drop will not work.
   */
  dragAndDropManager?: DragStateManager;

  /**
   * Whether the tab header should scroll horizontally when tabs overflow.
   *
   * @default true
   */
  isScrollable?: boolean;

  /** Called after a tab is activated via click or keyboard. */
  onTabClick?: (tab: TabItem) => void;
  /** Called after a tab is removed via the close button. */
  onTabClose?: (tab: TabItem) => void;
  /** Called when a tab is dropped on another tab in this pane's header. */
  onTabDrop?: (data: TabDropPayload) => void;
  /** Called when a tab is dropped on empty space in this pane's header. */
  onTabListDrop?: (data: TabListDropPayload) => void;

  /**
   * Called when a tab is dropped on one of this pane's content-area zones.
   *
   * @remarks
   * `pos === 'center'` is generally interpreted as "move the tab into this
   * pane"; edge positions are generally interpreted as "split the pane on that
   * side and place the tab in the new sub-pane". The component itself performs
   * neither — the it's up to the consumer to implement these behaviors.
   */
  onDropZoneDrop?: (data: DropZoneDropPayload) => void;

  /** Rendered inside the content region when no tab is active. */
  emptyContent?: ReactNode;

  /**
   * Which drop zones to render. Useful for panes that should not be
   * splittable — pass `['center']` to only accept cross-pane moves.
   *
   * @default ['center', 'top', 'bottom', 'left', 'right']
   */
  dropZonePosList?: readonly DropZonePosition[];

  /**
   * Size of the edge zones as a CSS length (e.g. `'30%'`, `'4rem'`).
   *
   * @default '30%'
   */
  edgeSize?: string;

  /** Extra class name merged onto the internal `TabList` root element. */
  tabListClassName?: string;

  /** Extra class name merged onto the content region. */
  contentClassName?: string;

  /** Extra class name merged onto the internal `DropZone` root element. */
  dropZoneClassName?: string;
};
