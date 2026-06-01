import {
  type TabEvent,
  type TabId,
  type TabItem,
  type TabState,
} from '../types/TabStateManager.type';
import { BaseStateManager } from './BaseStateManager';

/**
 * Manages the state and business logic for an ordered collection of tabs.
 *
 * @remarks
 * This manager is headless — it owns no DOM or framework references. It
 * enforces the following invariants at all times:
 *
 * - `order` and `itemMap` represent the same set of ids — every id in `order`
 *   is a key in `itemMap`, and vice versa.
 * - `order` contains no duplicate ids.
 * - When `activeId` is non-null, it is guaranteed to be a valid key in
 *   `itemMap`. `activeId` may still be `null` even when tabs exist, e.g. when
 *   the consumer wants to require an explicit user selection.
 * - When the active tab is removed, focus is automatically transferred to the
 *   nearest remaining tab (the tab at the same index, or the last tab if the
 *   removed one was the last).
 * - `reorder` silently rejects arrays whose length does not match the current
 *   tab count to prevent accidental data loss.
 *
 * The constructor validates the structural invariants up-front and throws on
 * violation, so consumers (such as {@link useTabList}) can rely on consistent
 * state without defensive checks downstream.
 *
 * `TabState`:
 * - `order` — ordered array of `TabId`s representing the visual sequence.
 * - `itemMap` — `Map<TabId, TabItem>` for O(1) lookups.
 * - `activeId` — the ID of the currently selected tab, or `null`.
 * - `paneId` — optional identifier for the pane or container that owns this
 *   tab group.
 *
 * `TabEvent`:
 * - `TAB_ADDED` — a new tab was added.
 * - `TAB_REMOVED` — a tab was removed.
 * - `ACTIVE_TAB_CHANGED` — the active tab changed.
 * - `TABS_REORDERED` — the tab order was updated.
 *
 * @example
 * ```ts
 * const manager = new TabStateManager({ paneId: 0 });
 * manager.addTab({ id: 1, label: 'Home' });
 * manager.addTab({ id: 2, label: 'Settings' });
 * manager.setActive(2);
 *
 * manager.on('ACTIVE_TAB_CHANGED', ({ payload }) => {
 *   console.log('now active:', payload.id);
 * });
 * ```
 */
export class TabStateManager extends BaseStateManager<TabState, TabEvent> {
  /**
   * Creates a new `TabStateManager`.
   *
   * @param initialState - Optional partial state.
   *
   * @throws When the provided `order`, `itemMap`, and `activeId` violate the
   *   structural invariants documented on the class. All violations are
   *   collected and reported in a single error so the caller can address them
   *   in one round-trip rather than fixing one, re-running, and discovering
   *   the next.
   */
  constructor(initialState: Partial<TabState> = {}) {
    const itemMap = initialState.itemMap ?? new Map<TabId, TabItem>();
    const order = initialState.order ?? [];
    const activeId = initialState.activeId ?? null;

    const errorList: string[] = [];
    const seenOrderIdSet = new Set<TabId>();
    const duplicateOrderIdSet = new Set<TabId>();
    const orderIdsMissingFromMap = new Set<TabId>();

    for (const id of order) {
      if (seenOrderIdSet.has(id)) {
        duplicateOrderIdSet.add(id);
      }
      seenOrderIdSet.add(id);

      if (!itemMap.has(id)) {
        orderIdsMissingFromMap.add(id);
      }
    }

    for (const id of duplicateOrderIdSet) {
      errorList.push(`order contains duplicate id ${String(id)}`);
    }

    for (const id of orderIdsMissingFromMap) {
      errorList.push(
        `order contains id ${String(id)} that is not present in itemMap`,
      );
    }

    for (const id of itemMap.keys()) {
      if (!seenOrderIdSet.has(id)) {
        errorList.push(
          `itemMap contains id ${String(id)} that is not present in order`,
        );
      }
    }

    if (activeId !== null && !itemMap.has(activeId)) {
      errorList.push(`activeId ${String(activeId)} is not present in itemMap`);
    }

    if (errorList.length > 0) {
      throw new Error(
        `TabStateManager: invalid initial state:\n  - ${errorList.join('\n  - ')}`,
      );
    }

    super({ activeId, order, itemMap, paneId: initialState.paneId });
  }

  /**
   * Returns the full `TabItem` object for the currently active tab.
   *
   * @returns The active `TabItem`, or `null` if no tab is active (i.e. the
   *   collection is empty).
   */
  public get activeTab(): TabItem | null {
    const { activeId, itemMap } = this.state;
    return activeId !== null ? (itemMap.get(activeId) ?? null) : null;
  }

  /**
   * Adds a new tab to the collection.
   *
   * @remarks
   * The tab is inserted at `index` (or appended if omitted). If the
   * collection was empty before this call, the new tab is always made active
   * regardless of `autoSelect`.
   *
   * After mutating state, emits a `TAB_ADDED` event and notifies state
   * subscribers.
   *
   * @param tab - The full `TabItem` data to add. `tab.id` must be unique
   *   within this manager; adding a duplicate ID will silently overwrite the
   *   existing entry in `itemMap`.
   * @param index - Zero-based position to insert the tab. Defaults to the end
   *   of the current order.
   * @param autoSelect - When `true` (the default), this tab becomes active
   *   immediately. Set to `false` to add a background tab.
   */
  public addTab(tab: TabItem, index?: number, autoSelect = true): void {
    const targetIndex = index ?? this.state.order.length;

    this.state.itemMap.set(tab.id, tab);
    this.state.order.splice(targetIndex, 0, tab.id);

    if (autoSelect || this.state.activeId === null) {
      this.state.activeId = tab.id;
    }

    this.emit({ eventType: 'TAB_ADDED', payload: { tab, index: targetIndex } });
    this.notifySubscribers();
  }

  /**
   * Removes a tab by ID and automatically manages active-tab focus.
   *
   * @remarks
   * When the removed tab is active:
   * - If no tabs remain, `activeId` becomes `null`.
   * - Otherwise, the tab at `min(removedIndex, newLength - 1)` becomes active.
   *
   * Emits a `TAB_REMOVED` event (carrying `nextActiveId`) and notifies state
   * subscribers. This method immediately exits if `id` does not exist in the
   * collection.
   *
   * @param id - The id of the tab to remove.
   */
  public removeTab(id: TabId): void {
    if (!this.state.itemMap.has(id)) {
      return;
    }

    const currentIndex = this.state.order.indexOf(id);
    this.state.itemMap.delete(id);
    this.state.order.splice(currentIndex, 1);

    let nextActiveId = this.state.activeId;

    if (this.state.activeId === id) {
      if (this.state.order.length === 0) {
        nextActiveId = null;
      } else {
        const nextIndex = Math.min(currentIndex, this.state.order.length - 1);
        nextActiveId = this.state.order[nextIndex];
      }
      this.state.activeId = nextActiveId;
    }

    this.emit({ eventType: 'TAB_REMOVED', payload: { id, nextActiveId } });
    this.notifySubscribers();
  }

  /**
   * Sets the active tab.
   *
   * @remarks
   * Silently ignores calls where `id` is not present in the collection
   * (prevents activating a tab that doesn't exist).
   *
   * Emits an `ACTIVE_TAB_CHANGED` event and notifies state subscribers.
   *
   * @param id - The id of the tab to activate, or `null` to deselect all.
   */
  public setActive(id: TabId): void {
    if (!this.state.itemMap.has(id)) return;

    this.state.activeId = id;
    this.emit({ eventType: 'ACTIVE_TAB_CHANGED', payload: { id } });
    this.notifySubscribers();
  }

  /**
   * Replaces the current tab order with a new ordering of the same ids.
   *
   * @remarks
   * The `newOrder` array must contain exactly the same number of ids as the
   * current `order` — this guards against accidental tab loss. If the lengths
   * do not match, the call silently exits. The active tab is not changed.
   *
   * Emits a `TABS_REORDERED` event and notifies state subscribers.
   *
   * @param newOrder - An array of all existing `TabId`s in the desired order.
   */
  public reorder(newOrder: TabId[]): void {
    if (newOrder.length !== this.state.order.length) {
      return;
    }

    this.state.order = [...newOrder];
    this.emit({
      eventType: 'TABS_REORDERED',
      payload: { order: this.state.order },
    });
    this.notifySubscribers();
  }
}
