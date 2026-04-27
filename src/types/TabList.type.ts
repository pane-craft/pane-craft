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
 * Props for the {@link TabList} component.
 *
 * @remarks
 * `TabList` is the batteries-included tab bar. It composes:
 *
 * - `useTabList` for selection state and keyboard navigation,
 * - `useTabDragAndDrop` for tab drag-and-drop (always enabled), and
 * - `ScrollPane` for horizontal overflow scrolling (toggleable via
 *   {@link TabListProps.scrollable}).
 *
 * Each managed tab is rendered with a `<Tab />`. The component is fully
 * controlled by the supplied (or internally created) state managers — there
 * is no internal tab data store of its own.
 *
 * For finer-grained control (e.g. custom tab rendering, custom keyboard
 * behaviour, drag disabled), drop down one layer and call `useTabList`
 * directly while rendering your own tabs.
 */
export type TabListProps = BaseComponentProps & {
  /**
   * Tab state manager that owns the tab collection.
   *
   * @remarks
   * Pass one in when the tab data is owned outside the component (e.g. when
   * several views need to share the same tabs, or when state needs to be
   * seeded before mount). When omitted, an empty internal manager is created
   * and lives for the component's lifetime.
   */
  manager?: TabStateManager;
  /**
   * Identifier used by the drag system to distinguish this tab list from
   * other tab lists in the same drag session.
   *
   * @remarks
   * Cross-pane drag-and-drop requires every participating `TabList` to use
   * the same {@link TabListProps.dragAndDropManager} **and** to have a unique
   * `paneId`. For single-list usage the default of `0` is fine.
   *
   * @default 0
   */
  paneId?: PaneId;
  /**
   * Shared drag state manager.
   *
   * @remarks
   * Pass the same instance to every `TabList` that should participate in the
   * same drag session (typically all tab lists in a pane tree). When omitted,
   * an internal manager is created — drag-and-drop will work within this
   * component but tabs cannot be dragged into or out of other tab lists.
   */
  dragAndDropManager?: DragStateManager;
  /**
   * Whether to wrap the tab row in a horizontal `ScrollPane`.
   *
   * @remarks
   * When `true` the tab row is horizontally scrollable with a custom
   * auto-hide scrollbar; long tab lists scroll instead of wrapping. When
   * `false` the tabs render in a plain flex row that overflows the container.
   *
   * @default true
   */
  scrollable?: boolean;
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
   * Called when a dragged tab is dropped on top of another tab in this list.
   *
   * @remarks
   * The component does not perform the reorder/move itself — wire this to
   * the manager(s) and decide what the drop should do. Typical
   * implementations call `manager.reorder(...)` for same-pane drops and
   * `manager.removeTab(...)` + `targetManager.addTab(..., index)` for
   * cross-pane drops.
   */
  onTabDrop?: (data: TabDropPayload) => void;
  /**
   * Called when a dragged tab is dropped on the empty space of this list.
   * Conventionally treated as "append to the end".
   */
  onTabListDrop?: (data: TabListDropPayload) => void;
};
