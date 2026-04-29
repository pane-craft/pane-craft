import { type ReactNode } from 'react';

import { type DragStateManager } from '../state/DragStateManager';
import { type TabStateManager } from '../state/TabStateManager';
import { type BaseComponentProps } from './Base.type';
import { type PaneId } from './Pane.type';
import { type TabItem } from './Tab.type';
import {
  type TabListDropPayload,
  type TabDropPayload,
} from './useTabDragAndDrop.type';

export {
  type TabListDropPayload,
  type TabDropPayload,
} from './useTabDragAndDrop.type';
export { type TabItem } from './Tab.type';
export { type PaneId } from './Pane.type';

/**
 * Props for the {@link StaticTabPane} component.
 *
 * @remarks
 * `StaticTabPane` is the batteries-included tab-and-content unit — a `TabList`
 * stacked above a content region that renders the active tab's `content`.
 */
export type StaticTabPaneProps = BaseComponentProps & {
  /**
   * Tab state manager that owns the tab collection.
   *
   * @remarks
   * Pass one in when the tab data is owned outside the component. When
   * omitted, an empty internal manager is created and lives for the
   * component's lifetime. The same manager is forwarded to the internal
   * `TabList`, so header and content always stay in sync.
   */
  tabManager?: TabStateManager;

  /**
   * Identifier used by the drag system to distinguish this tab pane from
   * other tab panes in the same drag session.
   *
   * @remarks
   * Cross-pane drag-and-drop requires every participating `StaticTabPane` to use
   * the same {@link StaticTabPaneProps.dragAndDropManager} and to manage each
   * pane have a unique `paneId`.
   *
   * @default 0
   */
  paneId?: PaneId;

  /**
   * Shared drag state manager.
   *
   * @remarks
   * Pass the same instance to every `StaticTabPane` that should participate in
   * the same drag session (typically all tab panes in a pane tree). When
   * omitted, an internal manager is created — drag-and-drop will work within
   * this component but tabs cannot be dragged into or out of other tab panes.
   */
  dragAndDropManager?: DragStateManager;

  /**
   * Whether the tab header should scroll horizontally when tabs overflow.
   *
   * @remarks
   * Forwarded to the internal `TabList`. When `true`, the tab row is
   * horizontally scrollable with an auto-hide scrollbar; when `false` the tabs
   * render in a plain flex row that overflows the container.
   *
   * @default true
   */
  isScrollable?: boolean;

  /**
   * Called after a tab is activated via click or keyboard. Fires only on
   * actual state change.
   */
  onTabClick?: (tab: TabItem) => void;

  /**
   * Called after a tab is removed via the close button. Receives the tab as
   * it existed before removal.
   */
  onTabClose?: (tab: TabItem) => void;

  /**
   * Called when a dragged tab is dropped on top of another tab in this pane.
   */
  onTabDrop?: (data: TabDropPayload) => void;

  /**
   * Called when a dragged tab is dropped on the empty space of this pane's
   * tab header.
   */
  onTabListDrop?: (data: TabListDropPayload) => void;

  /**
   * Rendered inside the content region when no tab is active (empty pane).
   *
   * @default null
   */
  emptyContent?: ReactNode;

  /**
   * Overlay nodes rendered inside the content area, alongside the active tab's
   * content.
   *
   * @remarks
   * The content area is a `position: relative` containing block sized to fit
   * the space below the tab bar. Pass absolutely-positioned overlays — most
   * commonly a `DropZone` — and they will cover only the content region (not
   * the tab bar), and stay fixed when the tab content scrolls.
   */
  children?: ReactNode;

  /**
   * Extra class name merged onto the internal `TabList` root element.
   */
  tabListClassName?: string;

  /**
   * Extra class name merged onto the content region.
   */
  contentClassName?: string;
};
