import { type TabId, type TabItem } from './Tab.type';

export { type TabId, type TabItem } from './Tab.type';

/**
 * Snapshot of the tab collection prepared for rendering.
 *
 * @remarks
 * Derived from {@link TabStateManager} on every state change. `tabs` is the
 * ordered array the consumer should iterate to render the tab bar; each entry
 * is the raw {@link TabItem} stored in the manager's `itemMap`, untouched.
 * Active-state is surfaced separately via {@link UseTabListState.activeId}
 * rather than being mutated onto each `TabItem`.
 */
export type UseTabListState = {
  /** Tabs in visual order, ready for `.map()` rendering. */
  tabList: TabItem[];
  /** The currently active tab, or `null` when the list is empty. */
  activeTab: TabItem | null;
  /** The id of the currently active tab, or `null` when the list is empty. */
  activeId: TabId | null;
};

/**
 * Per-tab selection-related props produced by
 * {@link UseTabListReturn.getTabHandlers}.
 *
 * @remarks
 * Designed to be spread onto whatever element wraps an individual
 * {@link Tab}. `isActive` and `onClose` are forwarded to `Tab` itself;
 * `onClick` is wired to the wrapper element so the tab activates on click.
 *
 * @example
 * ```tsx
 * {state.tabs.map((tab) => {
 *   const selection = getTabHandlers(tab);
 *   return (
 *     <div key={tab.id} onClick={selection.onClick}>
 *       <Tab {...tab} isActive={selection.isActive} onClose={selection.onClose} />
 *     </div>
 *   );
 * })}
 * ```
 */
export type TabSelectionHandlers = {
  /** `true` when this tab is the currently active tab. */
  isActive: boolean;
  /**
   * Activates the tab via the underlying manager.
   *
   * @remarks
   * Call from the wrapper element's `onClick`. Safe to call when the tab is
   * already active — the manager simply re-emits `ACTIVE_TAB_CHANGED`.
   */
  onClick: () => void;
  /**
   * Removes the tab via the underlying manager.
   *
   * @remarks
   * Matches the signature of {@link TabItem.onClose} so it can be passed
   * directly to `<Tab onClose={...} />`. The `id` argument is supplied by
   * `Tab`'s close button handler.
   */
  onClose: (id: TabId) => void;
};

/**
 * Handlers to spread onto the container that wraps the tab list.
 *
 * @remarks
 * Owns keyboard navigation (ArrowLeft / ArrowRight / Home / End). The
 * container must be focusable (`tabIndex={0}`) for key events to reach it;
 * {@link TabListHandlers.role} is supplied for ARIA conformance.
 */
export type TabListHandlers = {
  /** ARIA role — the tab bar is a tablist. */
  role: 'tablist';
  /**
   * Wire to `onKeyDown`. Handles:
   *
   * - `ArrowLeft` — activate the previous tab (wraps from the first).
   * - `ArrowRight` — activate the next tab (wraps from the last).
   * - `Home` — activate the first tab.
   * - `End` — activate the last tab.
   *
   * Any other key is ignored and allowed to propagate normally.
   */
  onKeyDown: (e: React.KeyboardEvent) => void;
};
