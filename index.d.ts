import { AriaAttributes } from '../../node_modules/.pnpm/react@19.2.4/node_modules/react';
import { AriaRole } from '../../node_modules/.pnpm/react@19.2.4/node_modules/react';
import { default as default_2 } from '../../../node_modules/.pnpm/react@19.2.4/node_modules/react';
import { ReactNode } from '../../node_modules/.pnpm/react@19.2.4/node_modules/react';

/**
 * Shared base props inherited by every component in the library.
 *
 * @remarks
 * Provides a consistent system for consumers to add accessibility attributes
 * and custom classNames across all components.
 */
declare type BaseComponentProps = {
    /**
     * Additional CSS class names merged onto the root element.
     */
    className?: string;
    /**
     * ARIA and accessibility attributes forwarded to the root element.
     *
     * @remarks
     * Accepts any valid ARIA attribute (role, aria-*, tabIndex, etc.).
     * This lets consumers compose accessible patterns (e.g. tab lists)
     * without the component needing to know about them.
     *
     * @example
     * ```tsx
     * <Tab a11y={{ role: 'tab', tabIndex: 0, 'aria-selected': isActive }} />
     * ```
     */
    a11y?: AriaAttributes & {
        role?: AriaRole;
        tabIndex?: number;
    };
};

/**
 * Abstract base class for managing state and event subscriptions.
 *
 * @remarks
 * Provides a reusable foundation for headless state managers. It combines
 * two independent notification mechanisms:
 *
 * 1. **State subscriptions** — general-purpose listeners that are called
 *    whenever the state changes, regardless of what caused the change.
 * 2. **Typed event system** — strongly-typed, discriminated-union events
 *    that carry a specific payload and allow consumers to react to
 *    fine-grained state transitions (e.g. `TAB_ADDED`, `SCROLL_UPDATED`).
 *
 * Concrete subclasses must define their own `TState` and `TEvent` types and
 * are responsible for calling {@link BaseStateManager.notifySubscribers} and
 * {@link BaseStateManager.emit} in the appropriate methods.
 *
 * @template TState - The shape of the state object being managed.
 * @template TEvent - A discriminated union of all events this manager can
 *   emit. Each member must have an `eventType: string` discriminant and an
 *   optional `payload`.
 *
 * @example
 * ```ts
 * type CounterState = { count: number };
 * type CounterEvent =
 *   | { eventType: 'INCREMENTED'; payload: { amount: number } }
 *   | { eventType: 'RESET'; payload: undefined };
 *
 * class CounterManager extends BaseStateManager<CounterState, CounterEvent> {
 *   increment(amount: number) {
 *     this.state.count += amount;
 *     this.emit({ eventType: 'INCREMENTED', payload: { amount } });
 *     this.notifySubscribers();
 *   }
 * }
 * ```
 */
declare abstract class BaseStateManager<TState, TEvent extends {
    eventType: string;
    payload?: unknown;
}> {
    /** The current internal state. Mutated directly by subclasses. */
    protected state: TState;
    /**
     * The set of callbacks registered via {@link BaseStateManager.subscribe}.
     * Each callback is invoked on every call to
     * {@link BaseStateManager.notifySubscribers}.
     */
    protected subscriberSet: Set<() => void>;
    /**
     * A map from event type discriminant to the list of handlers registered
     * for that event via {@link BaseStateManager.on}.
     */
    protected eventListenerMap: Map<TEvent["eventType"], ((event: TEvent) => void)[]>;
    /**
     * Creates a new state manager instance with the provided initial state.
     *
     * @param initialState - The starting value for {@link BaseStateManager.state}.
     */
    constructor(initialState: TState);
    /**
     * Registers a handler for a specific event type.
     *
     * @remarks
     * Multiple handlers can be registered for the same event type; they are
     * called in registration order. The handler receives the full, strongly-typed
     * event object (including its `payload`) as its sole argument.
     *
     * @param eventType - The discriminant string that identifies the event.
     * @param callback - The function to invoke when the event is emitted.
     *   The `event` argument is narrowed to the specific union member whose
     *   `eventType` matches `K`.
     * @returns A zero-argument unsubscribe function. Call it to stop receiving
     *   events without needing to hold a reference to the original callback.
     *
     * @example
     * ```ts
     * const unsubscribe = manager.on('INCREMENTED', ({ payload }) => {
     *   console.log('incremented by', payload.amount);
     * });
     * // after the subscription is no longer needed
     * unsubscribe(); // handler will no longer be called
     * ```
     *
     * @template K - Inferred from `eventType`; constrains `callback` to the
     *   matching union member.
     */
    on<K extends TEvent['eventType']>(eventType: K, callback: (event: Extract<TEvent, {
        eventType: K;
    }>) => void): () => void;
    /**
     * Broadcasts an event to all handlers currently registered for its type.
     *
     * @remarks
     * Handlers are called synchronously in registration order.
     *
     * @param event - The event object to broadcast. Its `eventType` is used to
     *   look up the handler list.
     */
    protected emit(event: TEvent): void;
    /**
     * Subscribes to any state change notification.
     *
     * @remarks
     * The callback receives no arguments; consumers should call
     * {@link BaseStateManager.getState} inside the callback to read the latest
     * state. This is intentional — it keeps the subscription API simple and
     * compatible with external state-sync patterns (e.g. React's
     * `useSyncExternalStore`).
     *
     * @param callback - A zero-argument function invoked after every state change.
     * @returns An unsubscribe function. Call it to remove the listener.
     *
     * @example
     * ```ts
     * const unsubscribe = manager.subscribe(() => {
     *   renderUI(manager.getState());
     * });
     * // later…
     * unsubscribe();
     * ```
     */
    subscribe(callback: () => void): () => void;
    /**
     * Invokes all registered state-change subscribers.
     *
     * @remarks
     * Subclasses should call this at the end of any method that mutates
     * {@link BaseStateManager.state} so that consumers always receive
     * up-to-date snapshots.
     */
    protected notifySubscribers(): void;
    /**
     * Returns a shallow copy of the current state.
     *
     * @remarks
     * The returned object is a one-level-deep clone, which prevents callers
     * from accidentally mutating top-level state properties. Note that nested
     * objects (e.g. `Map` instances inside `TState`) are still shared
     * references — subclasses that store complex structures should override
     * this method to provide a deeper copy if needed.
     *
     * @returns A `Readonly` shallow clone of the current state.
     */
    getState(): Readonly<TState>;
}

declare type DragEvent_2 = {
    eventType: 'DRAG_STARTED';
    payload: {
        tab: TabItem;
        sourcePaneId: PaneId;
    };
} | {
    eventType: 'DRAG_ENDED';
    payload: {
        tab: TabItem;
        sourcePaneId: PaneId;
    };
} | {
    eventType: 'TAB_HOVER_CHANGED';
    payload: {
        hover: TabDropTargetHoverData | null;
    };
} | {
    eventType: 'DROP_ZONE_HOVER_CHANGED';
    payload: {
        hover: DropZoneHoverData | null;
    };
};
export { DragEvent_2 as DragEvent }

/**
 * The in-flight drag state.
 *
 * @remarks
 * `tabDropTargetHover` and `dropZoneHover` are independent fields. Typically
 * mutually exclusive drop targets — the consumer is expected to clear one
 * before setting the other if it wants to enforce that invariant.
 */
export declare type DragState = {
    /** The tab currently being dragged, or `null` when no drag is active. */
    draggedTab: TabItem | null;
    /** The pane the dragged tab originated from, or `null` when idle. */
    sourcePaneId: PaneId | null;
    /** The current tab drop target, or `null` if no tab is hovered. */
    tabDropTargetHover: TabDropTargetHoverData | null;
    /** The current pane drop zone target, or `null` if no zone is hovered. */
    dropZoneHover: DropZoneHoverData | null;
};

/**
 * A headless state manager for tab drag-and-drop interactions.
 *
 * @remarks
 * Tracks the lifecycle of a single tab being dragged across one or more
 * panes:
 *
 * 1. The user begins dragging a tab, calling {@link DragStateManager.start}.
 * 2. As the user moves the mouse, hover state is tracked via
 *    {@link DragStateManager.setTabHover} (when over another tab) and
 *    {@link DragStateManager.setDropZoneHover} (when over a drop zone).
 * 3. The user releases the mouse, calling {@link DragStateManager.end} to
 *    clear the drag state. The consumer is responsible for inspecting
 *    {@link DragState.tabDropTargetHover} and {@link DragState.dropZoneHover}
 *    before calling `end()` to decide what action to take (reorder, move,
 *    split).
 *
 * The manager doesn't make business decisions about reordering or splitting
 * panes. Those are the responsibility of the consumer.
 *
 * @example
 * ```ts
 * const drag = new DragStateManager();
 * drag.on('DRAG_ENDED', () => console.log('drop!'));
 *
 * drag.start({ id: 1, label: 'index.ts' }, 0);
 * drag.setTabHover({ tabId: 2, side: 'right' });
 * // user releases the mouse
 * drag.end();
 * ```
 */
export declare class DragStateManager extends BaseStateManager<DragState, DragEvent_2> {
    /**
     * Creates a new `DragStateManager` in the idle state.
     *
     * @param initialState - Optional partial state. Typically only used in
     *   tests to seed an in-flight drag.
     */
    constructor(initialState?: Partial<DragState>);
    /**
     * Begins a drag.
     *
     * @remarks
     * Sets `draggedTab` and `sourcePaneId`. Hover state is reset to `null` to
     * clear any stale data from a previous drag. Emits `DRAG_STARTED` and
     * notifies subscribers.
     *
     * If a drag is already in progress, this method overwrites the existing
     * drag without emitting `DRAG_ENDED` for the previous one — the consumer
     * is expected to call {@link DragStateManager.end} before starting a new
     * drag if it wants the previous one to be cleanly torn down.
     *
     * @param tab - The tab being dragged.
     * @param sourcePaneId - The id of the pane the tab originated from.
     */
    start(tab: TabItem, sourcePaneId: PaneId): void;
    /**
     * Ends the current drag and resets all drag state.
     *
     * @remarks
     * Emits `DRAG_ENDED` carrying the tab and source pane that previously were
     * being dragged so that listeners performing cleanup can still see them.
     * After the event fires, the manager is back in its idle state.
     *
     * Silently exits when no drag is in progress.
     */
    end(): void;
    /**
     * Updates the current tab drop target.
     *
     * @remarks
     * Pass `null` to clear the hover. Silently exits when no drag is in
     * progress so that stray pointer events outside a drag don't interfere.
     *
     * Emits `TAB_HOVER_CHANGED` and notifies subscribers, even if the
     * value is unchanged.
     *
     * @param hover - The tab being hovered as a drop target, or `null` to
     *   clear.
     */
    setTabHover(hover: TabDropTargetHoverData | null): void;
    /**
     * Updates the current pane drop zone target.
     *
     * @remarks
     * Pass `null` to clear the hover. Silently exits when no drag is in
     * progress so that stray pointer events outside a drag don't interfere.
     *
     * Emits `DROP_ZONE_HOVER_CHANGED` and notifies subscribers, even if the
     * value is unchanged.
     *
     * @param hover - The pane drop zone being hovered, or `null` to clear.
     */
    setDropZoneHover(hover: DropZoneHoverData | null): void;
}

/**
 * The complete list of drop zone positions, in the order the overlay renders
 * them. `'center'` renders first so the edge zones sit on top and are
 * prioritized in receiving pointer events.
 */
export declare const DROP_ZONE_POSITIONS: readonly DropZonePosition[];

/**
 * An overlay that exposes {@link DropZonePosition} regions inside a pane as
 * tab drop targets.
 *
 * @remarks
 * `DropZone` sits absolutely-positioned inside a pane and renders one of each
 * of the {@link DropZonePosition} regions. The overlay stays invisible and
 * ignores pointer events while no drag is in progress, and it remains
 * invisible while a drag is in flight if the pointer is outside the overlay's
 * bounding box. The zones only fade in once the dragged item enters the
 * overlay, and they highlight whichever zone the pointer is over.
 *
 * The component is headless with respect to the consequences of a drop: it
 * fires `onDrop` with the dragged tab and the zone that received it, but
 * never mutates the tab collection or splits the pane itself. The consumer
 * is expected to interpret edge drops as splits and the center drop as a
 * cross-pane move.
 *
 * The host element must be `position: relative` (or otherwise a containing
 * block) so that the overlay's `inset: 0` fills the pane. The component is
 * designed for consumers to place a single `DropZone` as the last child of a
 * `StaticTabPane`'s content region.
 *
 * @example
 * Single-pane move-only overlay (no split support):
 * ```tsx
 * const dragManager = useMemo(() => new DragStateManager(), []);
 *
 * return (
 *   <div style={{ position: 'relative' }}>
 *     <StaticTabPane dragAndDropManager={dragManager} ... />
 *     <DropZone
 *       paneId={0}
 *       dragAndDropManager={dragManager}
 *       dropZonePosList={['center']}
 *       onDrop={({ tab, sourcePaneId }) => moveTab(sourcePaneId, 0, tab)}
 *     />
 *   </div>
 * );
 * ```
 *
 * @see {@link DropZoneProps} for full prop documentation.
 */
export declare const DropZone: default_2.FC<DropZoneProps>;

/**
 * Delivered to the consumer when a dragged tab is dropped on a drop zone.
 *
 * @remarks
 * The consumer is expected to translate this into a move-or-split operation.
 * When `pos === 'center'` the drop is expected to be a "move into target
 * pane"; edge positions are expected to be a "split the target pane on that
 * side and place the tab in the new sub-pane".
 */
export declare type DropZoneDropPayload = {
    /** The tab that was being dragged. */
    tab: TabItem;
    /** The pane the dragged tab originated from. */
    sourcePaneId: PaneId;
    /** The pane whose drop zone received the drop. */
    targetPaneId: PaneId;
    /** Which zone of the target pane received the drop. */
    pos: DropZonePosition;
};

/**
 * Handlers to spread onto an individual drop zone element.
 */
export declare type DropZoneHandlers = {
    /** Wire to `onDragOver`. */
    onDragOver: (e: React.DragEvent) => void;
    /** Wire to `onDragLeave`. */
    onDragLeave: (e: React.DragEvent) => void;
    /** Wire to `onDrop`. */
    onDrop: (e: React.DragEvent) => void;
};

/**
 * Identifies the drop zone the user is currently hovering over while dragging
 * a tab.
 *
 * @remarks
 * A `'center'` drop moves the tab into the target pane's tab list, while
 * `'top'`/`'bottom'`/`'left'`/`'right'` drops split the pane and place the tab
 * in the new split pane.
 */
export declare type DropZoneHoverData = {
    /** The id of the pane whose drop zone is being hovered. */
    paneId: PaneId;
    /** Which region of the pane is being hovered. */
    pos: DropZonePosition;
};

/**
 * Possible regions inside a pane that can act as a drop target.
 *
 * @remarks
 * - `'top'`, `'bottom'`, `'left'`, `'right'` correspond to the four edges of a
 *   pane. A drop in one of these zones is designed to trigger a split that
 *   places the dragged tab into a new pane on that side.
 * - `'center'` corresponds to the body of the pane. A drop here is designed to
 *   move the dragged tab into the existing pane's tab list rather than
 *   creating a new one.
 */
export declare type DropZonePosition = 'top' | 'bottom' | 'left' | 'right' | 'center';

/**
 * Props for the {@link DropZone} component.
 *
 * @remarks
 * `DropZone` is an overlay that sits inside a pane and exposes one of each of
 * the {@link DropZonePosition} regions as tab drop targets. The overlay is
 * invisible and non-interactive while no drag is in progress, and stays
 * invisible while a drag is in flight as long as the pointer is outside the
 * overlay's bounds. The zones fade in only when the pointer enters the
 * overlay during a drag, and highlight whichever zone the pointer is over.
 *
 * The component is headless with respect to the consequences of a drop: it
 * fires `onDrop` with the dragged tab and the zone that received it, but
 * never mutates the tab collection or splits the pane itself — that's left to
 * consumer-level logic.
 */
export declare type DropZoneProps = BaseComponentProps & {
    /**
     * Identifier of the pane the overlay belongs to.
     *
     * @remarks
     * Reported back to the consumer in `onDrop` as `targetPaneId`, and written
     * into the shared drag manager via `DropZoneHoverData.paneId` so that
     * cross-pane drag sessions can distinguish one pane's zones from another's.
     *
     * @default 0
     */
    paneId?: PaneId;
    /**
     * Shared drag state manager.
     *
     * @remarks
     * Pass the same instance used by the source `TabList`/`StaticTabPane` so the
     * overlay can see the in-flight drag. When omitted, an internal manager is
     * created — the overlay will never become visible because no drag will
     * originate inside it.
     */
    dragAndDropManager?: DragStateManager;
    /**
     * Called when a dragged tab is dropped on one of this overlay's zones.
     */
    onDrop?: (data: DropZoneDropPayload) => void;
    /**
     * Which zones to render. Useful for panes that should only accept certain
     * drop actions (e.g. a leaf pane that cannot be split further might pass
     * `['center']` to only accept moves).
     *
     * @default ['center', 'top', 'bottom', 'left', 'right']
     */
    dropZonePosList?: readonly DropZonePosition[];
    /**
     * Size of the edge zones (`top`, `bottom`, `left`, `right`) as a CSS
     * length. `center` fills the remaining area.
     *
     * @remarks
     * Accepts any CSS `<length>` or `<percentage>` value — e.g. `'30%'`,
     * `'4rem'`, or a custom property reference.
     *
     * @default '30%'
     */
    edgeSize?: string;
};

/**
 * A snapshot of a single leaf pane: its id plus the tabs it owns and which
 * tab is active.
 *
 * @remarks
 * The `tabs` array's order is the visual tab order. `activeTabId`, when
 * provided, must reference a tab in `tabs`; if omitted (or unresolvable), the
 * first tab is used as the default.
 */
export declare type DynamicTabLeafSnapshot = {
    isLeaf: true;
    /** The leaf's unique id within the dynamic pane tree. */
    id: LeafId;
    /**
     * The tabs hosted by this leaf in their display order.
     *
     * @remarks
     * Each tab carries the same fields as a runtime {@link TabItem} — including
     * the renderable `content` slot. Consumers persisting the snapshot beyond
     * the current process should serialize only the data they need (e.g. ids
     * and labels) and rebuild `content` on load.
     */
    tabList: TabItem[];
    /**
     * The id of the tab that should be active when the snapshot is loaded.
     *
     * @remarks
     * When omitted or unresolvable, the first tab in `tabs` is selected as the
     * default. Set to `null` only when `tabs` is empty.
     */
    activeTabId?: TabId | null;
};

/**
 * Either a leaf snapshot or a split snapshot — the recursive node type used
 * inside a {@link DynamicTabPaneSnapshot}.
 */
export declare type DynamicTabNodeSnapshot = DynamicTabLeafSnapshot | DynamicTabSplitSnapshot;

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
export declare const DynamicTabPane: default_2.FC<DynamicTabPaneProps>;

/**
 * Discriminated union of events emitted by {@link DynamicTabPaneStateManager}.
 *
 * @remarks
 * Only dynamic pane-level transitions are published here. Subscribers interested
 * in pane structure should listen on `manager.tree` directly, and subscribers
 * interested in an individual pane's tabs should listen on
 * `manager.getTabs(leafId)`.
 */
export declare type DynamicTabPaneEvent = {
    eventType: 'TAB_OPENED';
    payload: {
        tab: TabItem;
        leafId: LeafId;
    };
} | {
    eventType: 'TAB_CLOSED';
    payload: {
        tabId: TabId;
        leafId: LeafId;
    };
} | {
    eventType: 'TAB_MOVED';
    payload: {
        tabId: TabId;
        sourceLeafId: LeafId;
        targetLeafId: LeafId;
        index: number;
    };
} | {
    eventType: 'LEAF_SPLIT_WITH_TAB';
    payload: {
        tabId: TabId;
        sourceLeafId: LeafId;
        targetLeafId: LeafId;
        newLeafId: LeafId;
        side: SplitSide;
    };
} | {
    eventType: 'ACTIVE_LEAF_CHANGED';
    payload: {
        leafId: LeafId | null;
    };
};

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
export declare const DynamicTabPaneLeaf: default_2.FC<DynamicTabPaneLeafProps>;

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
export declare type DynamicTabPaneLeafProps = BaseComponentProps & {
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

/**
 * Props for the {@link DynamicTabPane} component.
 *
 * @remarks
 * `DynamicTabPane` is the batteries-included dynamic tab pane view: a
 * {@link PaneTree} whose every leaf is rendered as a {@link DynamicTabPaneLeaf} unit wired
 * to a shared {@link DragStateManager}. Cross-pane drag-and-drop and
 * drop-to-split are handled internally — consumers only interact with the
 * {@link DynamicTabPaneStateManager} supplied via `manager`.
 *
 * Tab content uses the existing inline `content?: ReactNode` field on each
 * {@link TabItem} (the same mechanism used by `StaticTabPane`).
 */
export declare type DynamicTabPaneProps = BaseComponentProps & {
    /**
     * The dynamic tab pane state manager.
     *
     * @remarks
     * The component subscribes to it and re-renders on both dynamic pane-level
     * changes (active leaf) and tree-level changes (splits, removals). Per-pane
     * tab changes are observed by the nested {@link DynamicTabPaneLeaf}
     * instances.
     */
    manager: DynamicTabPaneStateManager;
    /**
     * Rendered when the dynamic pane is completely empty (no leaves at all).
     *
     * @default null
     */
    emptyContent?: ReactNode;
    /**
     * Rendered inside a leaf's content area when that leaf has no active tab.
     *
     * @default null
     */
    emptyPaneContent?: ReactNode;
    /**
     * Minimum size for any pane at a split, as a percentage of its parent
     * split. Splitter drags are clamped so no adjacent pane shrinks below this.
     *
     * @default 10
     */
    minSize?: number;
    /**
     * When `true`, splitters are disabled and cross-pane drag-and-drop is
     * suppressed. Tabs within a single pane remain interactive.
     *
     * @default false
     */
    disabled?: boolean;
    /**
     * Which drop zone overlays are rendered on each leaf.
     *
     * @default ['center', 'top', 'bottom', 'left', 'right']
     */
    dropZonePosList?: readonly DropZonePosition[];
    /**
     * CSS length for the edge zones. Passed to each leaf's `DropZone`.
     *
     * @default '30%'
     */
    edgeSize?: string;
    /** Extra class name applied to each split container. */
    splitClassName?: string;
    /** Extra class name applied to each leaf wrapper. */
    leafClassName?: string;
    /** Extra class name applied to each splitter. */
    splitterClassName?: string;
    /** Extra class name forwarded to each leaf's `TabList`. */
    tabListClassName?: string;
    /** Extra class name forwarded to each leaf's content region. */
    contentClassName?: string;
    /** Extra class name forwarded to each leaf's `DropZone`. */
    dropZoneClassName?: string;
};

/**
 * A serialisable snapshot of a {@link DynamicTabPaneStateManager}'s state.
 *
 * @remarks
 * The snapshot captures everything needed to reconstruct the manager:
 *
 * - `root` — the recursive pane tree, with each leaf's tabs included.
 * - `activeLeafId` — which leaf was active at snapshot time.
 * - `nextLeafId` — the leaf id allocator counter, so future splits never
 *   collide with the existing ids. When omitted, the manager derives it as
 *   `max(leafId in root) + 1`.
 *
 * Pass a snapshot to the manager via
 * {@link DynamicTabPaneStateManagerOptions.initialSnapshot} to seed a fresh
 * dynamic pane; call `manager.getSnapshot()` to retrieve the current state in
 * the same shape (round-trippable).
 *
 * @example
 * ```ts
 * const dtp = new DynamicTabPaneStateManager({
 *   initialSnapshot: {
 *     root: {
 *       isLeaf: false,
 *       orientation: 'horizontal',
 *       sizes: [20, 80],
 *       children: [
 *         { isLeaf: true, id: 1, tabs: [explorerTab] },
 *         { isLeaf: true, id: 2, tabs: [editorTab1, editorTab2], activeTabId: 1 },
 *       ],
 *     },
 *     activeLeafId: 2,
 *   },
 * });
 *
 * // Later, persist the dynamic pane:
 * const saved = dtp.getSnapshot();
 * ```
 */
export declare type DynamicTabPaneSnapshot = {
    /** Root of the snapshot tree, or `null` for an empty dynamic pane. */
    root: DynamicTabNodeSnapshot | null;
    /** The active leaf at snapshot time, or `null` for an empty dynamic pane. */
    activeLeafId?: LeafId | null;
    /**
     * The leaf-id allocator counter at snapshot time.
     *
     * @remarks
     * When omitted on input, the manager derives it from the maximum leaf id
     * in `root`. Always present on output from `getSnapshot()`.
     */
    nextLeafId?: LeafId;
};

/**
 * State managed by {@link DynamicTabPaneStateManager}.
 *
 * @remarks
 * The manager delegates pane structure to an internal
 * {@link PaneTreeStateManager} and per-leaf tab collections to lazily
 * created {@link TabStateManager} instances. `DynamicTabPaneState` captures
 * only the dynamic pane-level fields that don't belong to either child:
 *
 * - `activeLeafId` — the pane that currently receives new tabs when
 *   {@link DynamicTabPaneStateManager.openTab} is called without an explicit
 *   `leafId`.
 * - `nextLeafId` — an allocator counter used to mint fresh leaf ids for
 *   splits. It is monotonic and not reused.
 */
export declare type DynamicTabPaneState = {
    /** The pane that currently receives new tabs when no leaf is specified. */
    activeLeafId: LeafId | null;
    /** Monotonic id allocator for new leaves created by split operations. */
    nextLeafId: LeafId;
};

/**
 * The batteries-included orchestrator that marries
 * {@link PaneTreeStateManager} with per-leaf {@link TabStateManager}s and a
 * shared {@link DragStateManager}.
 *
 * @remarks
 * Where `PaneTreeStateManager` is structurally tab-agnostic,
 * `DynamicTabPaneStateManager` is specifically for IDE-style workspaces: every
 * leaf of the tree is a tab pane. The manager:
 *
 * - Lazily creates and owns a {@link TabStateManager} for every leaf in the
 *   tree. The manager is accessible via {@link getTabs} and is disposed
 *   automatically when its leaf is removed.
 * - Generates fresh {@link LeafId}s for new panes made by split operations.
 * - Tracks an {@link DynamicTabPaneState.activeLeafId} — the default target
 *   for {@link openTab} calls that omit `leafId`.
 * - Auto-collapses leaves whose last tab is closed.
 *
 * The manager exposes two sub-managers that consumers may observe directly:
 * {@link paneTreeManager} (tree structure) and {@link dragManager} (in-flight
 * drag state). Subscribers to the dynamic pane manager itself are notified on any
 * dynamic pane-level change and on any tree-level change — making a single
 * `subscribe()` call sufficient to drive a React re-render of the whole
 * dynamic pane view.
 *
 * @example
 * ```ts
 * const dtp = new DynamicTabPaneStateManager();
 * dtp.openTab({ id: 1, label: 'index.ts', content: <Editor /> });
 * dtp.openTab({ id: 2, label: 'styles.css', content: <Editor /> });
 *
 * // Split the active leaf and move tab 2 into the new right-hand pane.
 * dtp.splitLeafWithTab({
 *   sourceLeafId: dtp.activeLeafId!,
 *   targetLeafId: dtp.activeLeafId!,
 *   tabId: 2,
 *   side: 'right',
 * });
 * ```
 */
export declare class DynamicTabPaneStateManager extends BaseStateManager<DynamicTabPaneState, DynamicTabPaneEvent> {
    /** The pane-structure sub-manager. Read-only reference. */
    readonly paneTreeManager: PaneTreeStateManager;
    /** The shared drag-and-drop sub-manager. Read-only reference. */
    readonly dragManager: DragStateManager;
    /** Lazily-created per-leaf tab managers. */
    private readonly tabManagerMap;
    /** Unsubscribe handle for the internal subscription to `paneTreeManager`. */
    private readonly unsubscribeTree;
    /** Unsubscribe handle for the pane tree's `LEAF_REMOVED` event. */
    private readonly unsubscribeLeafRemoved;
    constructor(options?: DynamicTabPaneStateManagerOptions);
    /**
     * The id of the currently active leaf, or `null` when the dynamic pane is
     * empty.
     */
    get activeLeafId(): LeafId | null;
    /**
     * Returns the {@link TabStateManager} for a leaf.
     *
     * @remarks
     * The tab manager is created lazily the first time a leaf is referenced,
     * so this method always returns an instance as long as the leaf exists.
     * Returns `null` when the leaf is not in the tree.
     *
     * @param leafId - The id of the leaf whose tab manager is requested.
     * @returns The {@link TabStateManager} that controls the leaf. The manager
     *   will be instantiated in the case of a new leaf.
     */
    getTabs(leafId: LeafId): TabStateManager | null;
    /**
     * Returns every leaf id in the tree. Convenience wrapper around
     * `tree.getLeafIds()`.
     */
    /**
     * Opens a tab inside a leaf.
     *
     * @remarks
     * Resolution order for the destination leaf:
     *
     * 1. If `leafId` is provided and exists, the tab is added there.
     * 2. If `leafId` is provided but does not exist, silently exit.
     * 3. Otherwise (leaf omitted):
     *    - if there is an active leaf, the tab goes there;
     *    - if the dynamic pane is empty, a new leaf is created and activated.
     *
     * Emits `TAB_OPENED`.
     *
     * @param tab - The tab data to open.
     * @param leafId - Optional explicit destination leaf.
     */
    openTab(tab: TabItem, leafId?: LeafId): void;
    /**
     * Closes a tab by id.
     *
     * @remarks
     * Searches every pane for the tab id and removes it from the pane that
     * owns it. If the pane ends up with zero tabs after removal, the leaf is
     * also removed from the tree.
     *
     * Silently exits when the tab id is not found.
     *
     * Emits `TAB_CLOSED` (and `LEAF_REMOVED` downstream if the leaf collapses).
     *
     * @param tabId - The tab to close.
     */
    closeTab(tabId: TabId): void;
    /**
     * Moves a tab from one pane to another.
     *
     * @remarks
     * When `sourceLeafId === targetLeafId`, this is equivalent to a reorder
     * within the same pane. When they differ:
     *
     * 1. The tab is removed from the source pane.
     * 2. The tab is inserted into the target pane at `index` (or appended).
     * 3. If the source pane is now empty, the source leaf is removed and the
     *    tree collapses accordingly.
     *
     * The moved tab automatically becomes the active tab of the target pane.
     *
     * Silently exits when any of the ids are unknown.
     *
     * Emits `TAB_MOVED`.
     *
     * @param tabId - The id of the tab to move.
     * @param sourceLeafId - The id of the leaf pane that tab is moving from.
     * @param targetLeafId - The id of the leaf pane that tab is moving to.
     * @param index - Optional parameter determining where in the target pane's
     *   tab list to insert at. If none provided, will default to appending at
     *   the end.
     */
    moveTab(tabId: TabId, sourceLeafId: LeafId, targetLeafId: LeafId, index?: number): void;
    /**
     * Splits a target leaf and moves a tab into the new sibling leaf.
     *
     * @remarks
     * This is the action triggered by dropping a tab on one of the target
     * pane's edge drop zones. The sequence is:
     *
     * 1. Allocate a fresh {@link LeafId} and split `targetLeafId` on `side`.
     * 2. Move the tab from the source pane into the new leaf.
     * 3. If the source pane is now empty, remove it (collapse).
     * 4. The new leaf becomes active.
     *
     * If `sourceLeafId === targetLeafId` and the source pane has only one
     * tab, this is effectively a no-op split because removing the tab would
     * empty the source (which then collapses), leaving a tree with a single
     * leaf containing the tab. In that case the call is a no-op and returns
     * early without mutating anything.
     *
     * Silently exits when any id is unknown.
     *
     * Emits `LEAF_SPLIT_WITH_TAB` (and downstream `LEAF_SPLIT`, plus
     * `LEAF_REMOVED` if the source collapses).
     *
     * @param sourceLeafId - The `leafId` of the pane the user drags the tab from.
     * @param targetLeafId - The `leafId` of the pane the user drops the tab to.
     * @param tabId - The id of the tab being dropped.
     * @param side - Which edge of the target the new leaf should occupy.
     */
    splitLeafWithTab(sourceLeafId: LeafId, targetLeafId: LeafId, tabId: TabId, side: SplitSide): void;
    /**
     * Sets which leaf is considered "active" — the default destination for
     * {@link openTab} calls that omit a leaf id.
     *
     * @remarks
     * Silently exits when `leafId` is not in the tree. Pass `null` to clear.
     *
     * Emits `ACTIVE_LEAF_CHANGED` when the value actually changes.
     */
    setActiveLeaf(leafId: LeafId | null): void;
    /**
     * Returns a serialisable snapshot of the dynamic pane's current state.
     *
     * @remarks
     * The snapshot mirrors the same shape accepted by
     * {@link DynamicTabPaneStateManagerOptions.initialSnapshot}, so a saved
     * snapshot can be passed straight back into a new manager to restore the
     * dynamic pane verbatim. Per-leaf tab order, the active tab in each leaf, the
     * active leaf, and the leaf-id allocator are all included.
     *
     * Tab `content` (renderable React nodes) is included by reference. When
     * persisting beyond the current process, serialise only the data your app
     * needs (e.g. ids and labels) and rebuild `content` on load.
     *
     * @returns A fresh {@link DynamicTabPaneSnapshot} owned by the caller — mutating
     *   it does not affect the manager.
     */
    getSnapshot(): DynamicTabPaneSnapshot;
    /**
     * Tears down internal subscriptions.
     *
     * @remarks
     * Call this when the dynamic pane manager is being discarded and the tree /
     * drag managers passed in via options are retained by the caller. When
     * the manager owns both sub-managers exclusively, destruction is optional
     * because they will be garbage-collected together.
     */
    destroy(): void;
    private getOrCreateTabManager;
    /**
     * Find the `leafId` for the pane containing `tabId`.
     * @param tabId - The id of the tab to find among the leaf panes.
     * @returns An object with the {@link TabStateManager} related to the
     *   `leafId`, or `null` if no match is found.
     */
    private findTabLocation;
    /**
     * Detect if pane `leafId` is empty and, if so, remove it from the tree.
     *
     * @remarks
     * Silently exits if the `paneTreeManager` doesn't have the `leafId` pane,
     * or if no `tabManager` is detected.
     *
     * @param leafId - The `leafId` of the pane to potentially collapse.
     */
    private collapseLeafIfEmpty;
    /**
     * Generate new, unique, monotonic {@link LeafId}.
     *
     * @remarks
     * Generates monotonic {@link LeafId} based on internally tracked
     * `nextLeafId`, and increments `nextLeafId`.
     *
     * @returns The new, unique {@link LeafId}.
     */
    private generateLeafId;
    /**
     * Sets the active leaf id.
     *
     * @remarks
     * Emits `'ACTIVE_LEAF_CHANGED'` event after setting the `activeLeafId`. If
     * the currently active leaf id is the same as the provided `leafId`, the
     * function silently exits.
     *
     * @param leafId - The {@link LeafId} to set as active.
     */
    private setActiveLeafInternal;
    /**
     * Walks a snapshot subtree and pre-populates {@link tabManagerMap} with a
     * fresh {@link TabStateManager} for every leaf encountered.
     *
     * @remarks
     * Each tab manager is constructed directly from the leaf snapshot's
     * `tabList`, `order`, and resolved active id — no `addTab` calls happen, so
     * no events fire. Used during construction when an `initialSnapshot` is
     * provided.
     */
    private seedTabManagersFromSnapshot;
    /**
     * Converts a {@link PaneNode} into a {@link DynamicTabNodeSnapshot},
     * enriching each leaf with its tab data from {@link tabManagerMap}.
     *
     * @remarks
     * A leaf with no associated tab manager (which can happen for leaves that
     * have never been touched) is rendered as an empty-tabs leaf.
     */
    private paneNodeToSnapshot;
}

/**
 * Options accepted by the {@link DynamicTabPaneStateManager} constructor.
 */
export declare type DynamicTabPaneStateManagerOptions = {
    /**
     * An externally-owned pane tree manager.
     *
     * @remarks
     * Pass one in when you want to seed the tree before constructing the
     * dynamic pane, or when you want to observe the tree independently.
     * Otherwise a fresh empty tree is created.
     */
    paneTreeManager?: PaneTreeStateManager;
    /**
     * An externally-owned drag-and-drop manager.
     *
     * @remarks
     * Pass one in when multiple {@link DynamicTabPaneStateManager} instances
     * need to participate in the same drag session, or when you want to
     * subscribe to drag events from outside the dynamic pane. Otherwise a fresh
     * manager is created and shared across every pane of this dynamic pane.
     */
    dragManager?: DragStateManager;
    /**
     * Starting value for the internal leaf-id allocator.
     *
     * @remarks
     * The allocator increments after generating a leaf id, so the first leaf
     * created by any split operation will have id `initialNextLeafId`. When a
     * pre-seeded `paneTreeManager` is provided, this should be set above the
     * highest existing leaf id to prevent id collisions.
     *
     * @default 1
     */
    initialNextLeafId?: LeafId;
    /**
     * A {@link DynamicTabPaneSnapshot} used to seed the dynamic pane at construction.
     *
     * @remarks
     * When provided, the manager builds its internal pane tree and per-leaf
     * tab managers in one pass. The snapshot is also the format returned by
     * {@link DynamicTabPaneStateManager.getSnapshot}, so a saved dynamic pane can
     * be restored verbatim.
     *
     * Mutually exclusive with `paneTreeManager` (the snapshot's job is to
     * seed a fresh tree). Passing both throws.
     *
     * `nextLeafId` and `activeLeafId` from the snapshot take precedence over
     * `initialNextLeafId`. When the snapshot omits `nextLeafId`, it is derived
     * as `max(leafId in root) + 1`.
     */
    initialSnapshot?: DynamicTabPaneSnapshot;
};

/**
 * A snapshot of a split node: orientation, ordered children, and the child
 * size percentages.
 *
 * @remarks
 * Mirrors the structure of the underlying {@link PaneNodeSplit}, so the
 * invariants are the same: `sizes.length === children.length`, all sizes
 * non-negative and summing to 100, and at least two children per split.
 */
export declare type DynamicTabSplitSnapshot = {
    isLeaf: false;
    /** Layout axis of this split. */
    orientation: Orientation;
    /** Ordered list of child snapshots (leaves or nested splits). */
    children: DynamicTabNodeSnapshot[];
    /** Per-child size percentages (sum to 100). */
    sizes: number[];
};

/**
 * Type guard for {@link PaneNodeLeaf}.
 */
export declare const isLeafNode: (node: PaneNode) => node is PaneNodeLeaf;

/**
 * Returns `true` when the side places the new leaf *before* the target in
 * its parent's child list (`'left'` or `'top'`).
 *
 * @param side - The {@link SplitSide} to evaluate the "before"/"after"
 *   position against.
 * @returns `true` if placing the new leaf in a "before" position
 * (`'left'`/`'top'`), `false in an "after" position (`'right'`/`'bottom'`).
 */
export declare const isSideBeforeTarget: (side: SplitSide) => boolean;

/**
 * Type guard for {@link PaneNodeSplit}.
 */
export declare const isSplitNode: (node: PaneNode) => node is PaneNodeSplit;

/**
 * Identifier for a leaf in a {@link PaneTreeStateManager}.
 *
 * @remarks
 * Leaves are opaque to the tree — the manager does not know what they
 * render. The consumer maps the `LeafId` to a concrete view (a
 * `DynamicTabPaneLeaf` instance, an editor, a preview, etc.) in
 * {@link PaneTreeProps.renderLeaf}.
 */
export declare type LeafId = number;

declare type Orientation = 'horizontal' | 'vertical';

/**
 * Maps a {@link SplitSide} keyword to the axis along which a split would
 * arrange children.
 *
 * @param side - The `SplitSide` to evaluate the orientation against.
 * @returns `'horizontal'` for `'left'`/`'right'` panes, `'vertical'` for
 *   `'top'`/`'bottom'` panes.
 */
export declare const orientationForSide: (side: SplitSide) => Orientation;

declare type PaneId = number;

/**
 * Any node in a pane tree — either a leaf or a split.
 */
export declare type PaneNode = PaneNodeLeaf | PaneNodeSplit;

/**
 * A leaf node — a single rectangular region with an id.
 */
export declare type PaneNodeLeaf = {
    isLeaf: true;
    /** Unique identifier within a {@link PaneTreeStateManager}. */
    id: LeafId;
};

/**
 * A split node — lays out two or more children along an axis.
 *
 * @remarks
 * `sizes[i]` is the percentage of the container allocated to `children[i]`.
 * The array length always equals `children.length` and the entries always sum
 * to `100`.
 */
export declare type PaneNodeSplit = {
    isLeaf: false;
    /** Layout axis of this split. */
    orientation: Orientation;
    /** Ordered list of children (leaves or nested splits). */
    children: PaneNode[];
    /**
     * Per-child size percentages. `sizes[i]` corresponds to `children[i]`;
     * entries are non-negative and the array sums to `100`.
     */
    sizes: number[];
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
 * (tabs-per-leaf, drop-to-split), see {@link DynamicTabPane}.
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
export declare const PaneTree: default_2.FC<PaneTreeProps>;

/**
 * Discriminated union of events emitted by {@link PaneTreeStateManager}.
 */
export declare type PaneTreeEvent = {
    eventType: 'LEAF_ADDED';
    payload: {
        id: LeafId;
    };
} | {
    eventType: 'LEAF_REMOVED';
    payload: {
        id: LeafId;
    };
} | {
    eventType: 'LEAF_SPLIT';
    payload: {
        targetId: LeafId;
        newLeafId: LeafId;
        side: SplitSide;
    };
} | {
    eventType: 'LEAF_MOVED';
    payload: {
        id: LeafId;
        targetId: LeafId;
        side: SplitSide;
    };
} | {
    eventType: 'SPLIT_RESIZED';
    payload: {
        path: readonly number[];
        sizes: readonly number[];
    };
};

/**
 * Argument passed to {@link PaneTreeProps.renderLeaf}.
 */
export declare type PaneTreeLeaf = {
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
export declare type PaneTreeProps = BaseComponentProps & {
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

/**
 * State managed by {@link PaneTreeStateManager}.
 */
export declare type PaneTreeState = {
    /** Root of the tree, or `null` when the tree is empty. */
    root: PaneNode | null;
};

/**
 * Manages the structural state of a recursive pane tree.
 *
 * @remarks
 * `PaneTreeStateManager` is headless — it owns a tree of opaque leaves
 * (identified by numeric `LeafId`s) and the nested splits between them.
 * It doesn't render; a consumer (typically {@link PaneTree}) subscribes to it
 * and maps each leaf id to a React node.
 *
 * Invariants maintained at all times:
 *
 * - Every split has at least two children.
 * - `split.sizes.length === split.children.length`.
 * - `split.sizes` contains non-negative numbers that sum to `100`.
 * - No two leaves share a `LeafId` within the same tree.
 *
 * The manager is structurally content agnostic. Tab panes, editor panes,
 * preview panes — anything with a stable id — can serve as a leaf. For the
 * batteries-included combination with the tab system (tabs-per-leaf,
 * drop-to-split), see {@link DynamicTabPane}.
 *
 * `PaneTreeEvent`:
 * - `LEAF_ADDED` — a new leaf was inserted into an empty tree.
 * - `LEAF_REMOVED` — a leaf was removed (and any single-child splits
 *   collapsed).
 * - `LEAF_SPLIT` — an existing leaf was split in a direction, creating a
 *   new sibling leaf.
 * - `LEAF_MOVED` — an existing leaf was relocated adjacent to another
 *   leaf.
 * - `SPLIT_RESIZED` — the `sizes` array of a split was updated.
 *
 * @example
 * ```ts
 * const treeManager = new PaneTreeStateManager();
 * treeManager.addLeaf(1);                    // root = { kind: 'leaf', id: 1 }
 * treeManager.splitLeaf(1, 2, 'right');      // root is now split horizontally
 * treeManager.splitLeaf(2, 3, 'bottom');     // right pane splits vertically
 *
 * treeManager.on('LEAF_SPLIT', ({ payload }) => {
 *   console.log(`split ${payload.targetId} → ${payload.newLeafId}`);
 * });
 * ```
 */
export declare class PaneTreeStateManager extends BaseStateManager<PaneTreeState, PaneTreeEvent> {
    /**
     * Creates a new pane tree manager.
     *
     * @param initialRoot - Optional initial tree. Pass `null` (or omit) for
     *   an empty tree. The manager does not validate the tree structure
     *   beyond storing it; malformed trees passed here will cause misbehaving
     *   operations later. Prefer building the tree via the mutation methods.
     */
    constructor(initialRoot?: PaneNode | null);
    /**
     * Adds a leaf to an empty tree.
     *
     * @remarks
     * Silently exits when the tree already has a root — use
     * {@link PaneTreeStateManager.splitLeaf} to add leaves after the first.
     *
     * Emits `LEAF_ADDED`.
     *
     * @param id - The leaf's `LeafId`. Must be unique within the tree.
     */
    addLeaf(id: LeafId): void;
    /**
     * Splits an existing leaf, placing a new leaf alongside it.
     *
     * @remarks
     * - If the target's parent split already has the matching orientation
     *   (e.g. splitting `'right'` inside a horizontal split), the new leaf
     *   is inserted into the existing parent at the appropriate index.
     *   Sizes are adjusted so that the target and the new leaf each get
     *   half of the target's previous allocation.
     * - Otherwise, the target is replaced with a new two-child split whose
     *   orientation matches the requested side, with the new leaf and the
     *   target evenly sized (`[50, 50]`).
     *
     * Silently exits when:
     * - `targetId` is not in the tree.
     * - `newLeafId` already exists in the tree (prevents duplicate ids).
     *
     * Emits `LEAF_SPLIT`.
     *
     * @param targetId - The existing leaf to split.
     * @param newLeafId - The id for the new sibling leaf.
     * @param side - Which edge of the target the new leaf should occupy.
     */
    splitLeaf(targetId: LeafId, newLeafId: LeafId, side: SplitSide): void;
    /**
     * Removes a leaf from the tree.
     *
     * @remarks
     * Any split left with a single remaining child after the removal is
     * collapsed upward: the grandparent (if any) replaces the split with
     * its remaining child, preserving the grandparent's size allocation
     * for that slot. If the whole tree reduces to nothing, `root` becomes
     * `null`.
     *
     * Silently exits when the id is not in the tree.
     *
     * Emits `LEAF_REMOVED`.
     *
     * @param id - The leaf to remove.
     */
    removeLeaf(id: LeafId): void;
    /**
     * Moves a leaf adjacent to another leaf.
     *
     * @remarks
     * Implemented as a remove-then-split: the source leaf is detached (with
     * the usual single-child collapse), then re-inserted next to the target
     * on the requested side using the same rules as
     * {@link PaneTreeStateManager.splitLeaf}.
     *
     * Silently exits when:
     * - `id` is not in the tree.
     * - `targetId` is not in the tree.
     * - `id === targetId`.
     *
     * Emits `LEAF_MOVED`.
     *
     * @param id - The leaf to move.
     * @param targetId - The leaf to place `id` next to.
     * @param side - Which edge of the target the moved leaf should occupy.
     */
    moveLeaf(id: LeafId, targetId: LeafId, side: SplitSide): void;
    /**
     * Replaces the `sizes` array on a split identified by `path`.
     *
     * @remarks
     * `path` is the sequence of child indices from the root down to the
     * target split. For the root split, pass `[]`. The new `sizes` array
     * must have the same length as the split's `children`. Entries are
     * accepted as-is; consumers are responsible for clamping to min/max
     * allotments (the tree manager only enforces non-negativity).
     *
     * Silently exits when:
     * - `path` does not resolve to a split.
     * - `sizes.length !== children.length`.
     * - Any entry in `sizes` is negative.
     *
     * Emits `SPLIT_RESIZED`.
     *
     * @param path - Child-index path from root to the target split.
     * @param sizes - The new size array (percentages).
     */
    resizeSplit(path: readonly number[], sizes: readonly number[]): void;
    /**
     * Returns `true` if `id` matches any leaf in the tree.
     */
    hasLeaf(id: LeafId): boolean;
    /**
     * Returns the child-index path from the root to the parent of `id`,
     * or `null` if the leaf is absent or is itself the root.
     */
    findLeafParentPath(id: LeafId): readonly number[] | null;
    /**
     * Returns every `LeafId` currently in the tree (unordered).
     */
    getLeafIds(): LeafId[];
    /**
     * Removes the child at `location` from its parent, then collapses
     * single-child splits upward.
     *
     * @remarks
     * This is shared by `removeLeaf` and `moveLeaf`. It does not emit an
     * event or notify subscribers — the caller is responsible for that.
     */
    private removeChildAndCollapse;
    /**
     * Starting at the split located at `path`, walks upward (toward the
     * root) collapsing any split that is left with a single child.
     */
    private collapseSingleChildAncestors;
}

/**
 * Modes for handling track clicks.
 */
declare type ScrollClickMode = 'jump' | 'increment';

declare type ScrollEvent = {
    eventType: 'SCROLL_UPDATED';
    payload: {
        offset: number;
    };
} | {
    eventType: 'OVERFLOW_CHANGED';
    payload: {
        hasOverflow: boolean;
    };
} | {
    eventType: 'DRAG_STATE_CHANGED';
    payload: {
        isDragging: boolean;
    };
};

/**
 * A generic scrolling container with a custom, auto-hiding scrollbar.
 *
 * @remarks
 * Wraps arbitrary children in a scrollable viewport and renders a styled
 * track + thumb on top. Native browser scrolling drives the DOM; the
 * internal `ScrollStateManager` mirrors offset and size state to render the
 * custom thumb. Supports both `'horizontal'` and `'vertical'` orientations,
 * and optionally converts vertical wheel deltas into horizontal scrolling
 * for horizontal panes.
 *
 * @example
 * A horizontal scroll pane wrapping a tab list:
 * ```tsx
 * <ScrollPane orientation="horizontal" autoHide>
 *   {tabs.map((tab) => <Tab key={tab.id} {...tab} />)}
 * </ScrollPane>
 * ```
 *
 * @example
 * A vertical scroll pane with always-visible scrollbar:
 * ```tsx
 * <ScrollPane orientation="vertical" autoHide={false}>
 *   <LongDocument />
 * </ScrollPane>
 * ```
 *
 * @see {@link ScrollPaneProps} for full prop documentation.
 */
export declare const ScrollPane: default_2.FC<ScrollPaneProps>;

/**
 * React handlers to drive the scrollbar state manager from the DOM.
 */
export declare type ScrollPaneHandlers = {
    /** Attach to the viewport's native `onScroll`. */
    onScroll: () => void;
    /** Attach to the outer pane wrapper for auto-hide. */
    onMouseEnter: () => void;
    /** Attach to the outer pane wrapper for auto-hide. */
    onMouseLeave: () => void;
    /** Attach to the custom scrollbar track's `onClick`. */
    onTrackClick: (e: React.MouseEvent) => void;
    /** Attach to the custom scrollbar track's `onKeyDown`. */
    onTrackKeyDown: (e: React.KeyboardEvent) => void;
    /** Attach to the custom scrollbar thumb's `onMouseDown`. */
    onThumbMouseDown: (e: React.MouseEvent) => void;
};

/**
 * Options controlling a scrollable pane.
 *
 * @remarks
 * These options are used by both the {@link ScrollPane} component and the
 * underlying `useScrollPane` hook.
 */
export declare type ScrollPaneOptions = {
    /**
     * Scroll axis of the pane.
     *
     * @default 'horizontal'
     */
    orientation?: Orientation;
    /**
     * Behavior when the user clicks the scrollbar track outside of the thumb.
     *
     * @remarks
     * - `'jump'` — the thumb jumps so that its center is at the click position.
     * - `'increment'` — the content moves ~80% of the viewport size.
     *
     * @default 'jump'
     */
    trackClickMode?: ScrollClickMode;
    /**
     * Minimum pixel length of the scrollbar thumb to ensure the thumb is always
     * usable, even with large content overflows.
     *
     * @default 20
     */
    thumbSizeMin?: number;
    /**
     * When `true`, the scrollbar is hidden until the user hovers the pane or is
     * actively dragging the thumb. When `false`, the scrollbar is always
     * visible. Scrollbar is not visible regardless when there's no overflow.
     *
     * @default true
     */
    autoHide?: boolean;
    /**
     * When `true` and `orientation` is `'horizontal'`, vertical wheel deltas
     * are converted into horizontal scrolling and the native vertical scroll
     * is suppressed.
     *
     * @remarks
     * Has no effect for `'vertical'` orientation — the browser already handles
     * vertical wheel scrolling natively.
     *
     * @default true
     */
    wheelToScroll?: boolean;
};

/**
 * Props for the {@link ScrollPane} component.
 *
 * @remarks
 * `ScrollPane` is a generic wrapper that provides a custom, auto-hiding
 * scrollbar for any scrollable content. It extends {@link ScrollPaneOptions}
 * behavior options and the common {@link BaseComponentProps}.
 */
export declare type ScrollPaneProps = BaseComponentProps & ScrollPaneOptions & {
    /**
     * The content rendered inside the scrollable viewport.
     *
     * @remarks
     * For horizontal panes the content is laid out in an `inline-flex`
     * wrapper with `min-width: max-content`, so children determine the
     * content width. For vertical panes the wrapper uses
     * `min-height: max-content`.
     */
    children?: default_2.ReactNode;
};

/**
 * Scrollbar state with hover visibility.
 */
export declare type ScrollPaneViewState = ScrollState & {
    /**
     * Whether the scrollbar should be visible right now, taking into account
     * `autoHide`, hover, and drag state.
     */
    isScrollbarVisible: boolean;
};

/**
 * Controls the state of a scrollbar. Includes size and position.
 */
declare type ScrollState = {
    /** Current scroll position in pixels. */
    scrollOffset: number;
    /** Size of the visible container. */
    viewportSize: number;
    /** Total size of the scrollable content. */
    contentSize: number;
    /** Orientation of the scrollbar. */
    orientation: Orientation;
    /** Calculated size of the scrollbar thumb in pixels. */
    thumbSize: number;
    /** Minimum size of the scrollbar thumb in pixels for usability */
    thumbSizeMin?: number;
    /** Calculated position of the thumb relative to the track start. */
    thumbOffset: number;
    /** Whether the content is larger than the viewport. */
    hasOverflow: boolean;
    /** Whether the user is currently dragging the thumb. */
    isDragging: boolean;
};

/**
 * A headless state manager for custom scrollbar logic.
 *
 * @remarks
 * Handles all mathematical calculations required to render and drive a custom
 * scrollbar: thumb sizing, boundary clamping, drag translation, and
 * track-click interaction. It is entirely framework-agnostic and relies on
 * the host environment (e.g. a `ResizeObserver`) to push size updates via
 * {@link ScrollStateManager.updateSize}.
 *
 * `ScrollState`:
 * - `scrollOffset` — current scroll position in pixels.
 * - `viewportSize` — the size of the visible scrollable area.
 * - `contentSize` — the total size of the scrollable content.
 * - `thumbSize` — calculated thumb length in pixels.
 * - `thumbSizeMin` - clamp for `thumbSize`.
 * - `thumbOffset` — calculated thumb position relative to the track start.
 * - `hasOverflow` — whether content overflows the viewport.
 * - `isDragging` — whether the user is currently dragging the thumb.
 *
 * `ScrollEvent`:
 * - `SCROLL_UPDATED` — fired on every scroll offset change.
 * - `OVERFLOW_CHANGED` — fired when overflow status transitions.
 * - `DRAG_STATE_CHANGED` — fired when drag state changes.
 *
 * @example
 * ```ts
 * const scrollbar = new ScrollStateManager({ orientation: 'vertical' });
 * scrollbar.updateSize(400, 1200);
 * scrollbar.on('SCROLL_UPDATED', ({ payload }) => {
 *   container.scrollTop = payload.offset;
 * });
 * scrollbar.setScrollOffset(300);
 * ```
 */
declare class ScrollStateManager extends BaseStateManager<ScrollState, ScrollEvent> {
    /**
     * Creates a new `ScrollStateManager`.
     *
     * @param initialState - Optional partial state to override defaults.
     *   Only `orientation` and `thumbSizeMin` are typically useful at
     *   construction time; all size/position fields default to `0`.
     */
    constructor(initialState?: Partial<ScrollState>);
    /**
     * Updates the viewport and content sizes and recalculates all derived state.
     *
     * @remarks
     * After updating dimensions this method:
     * 1. Recalculates `hasOverflow` (`contentSize > viewportSize`).
     * 2. Recalculates `thumbSize` as `(viewportSize / contentSize) * viewportSize`,
     *    clamped to a minimum of `thumbSizeMin` (default
     *    `THUMB_SIZE_MIN_DEFAULT`px).
     * 3. Re-clamps the current `scrollOffset` to the new valid range.
     * 4. Emits `OVERFLOW_CHANGED` if the overflow status changed.
     * 5. Notifies all state subscribers.
     *
     * @param viewportSize - The size of the visible area in pixels
     *   (width for `'horizontal'`, height for `'vertical'`).
     * @param contentSize - The total size of the scrollable content in pixels.
     */
    updateSize(viewportSize: number, contentSize: number): void;
    /**
     * Sets the scroll offset, clamping it to the valid range `[0, maxOffset]`.
     *
     * @remarks
     * `maxOffset` is `contentSize - viewportSize`. Any value outside this range
     * is silently clamped. After updating the offset, `thumbOffset` is
     * recalculated so that the thumb position stays in sync:
     *
     * ```
     * thumbOffset = (scrollOffset / maxOffset) * (viewportSize - thumbSize)
     * ```
     *
     * Emits a `SCROLL_UPDATED` event and notifies subscribers on every call,
     * even if the clamped value is unchanged.
     *
     * @param offset - The desired scroll position in pixels.
     */
    setScrollOffset(offset: number): void;
    /**
     * Handles a click on the scrollbar track.
     *
     * @remarks
     * Two interaction modes are supported:
     *
     * - **`'jump'`** — Centers the thumb on the click coordinate. The target
     *   scroll offset is computed as:
     *   ```
     *   (clickCoord / viewportSize) * contentSize − thumbSize / 2
     *   ```
     * - **`'increment'`** — Pages the content toward the click by
     *   `viewportSize * 0.8` in the appropriate direction (determined by
     *   whether the click is before or after the current thumb position).
     *
     * This method silently exits when there is no overflow.
     *
     * @param clickCoord - The coordinate of the click in pixels, measured from
     *   the start of the track.
     * @param mode - The interaction behavior (`'jump'` or `'increment'`).
     */
    handleTrackClick(clickCoord: number, mode: ScrollClickMode): void;
    /**
     * Translates physical pointer movement into a scroll offset delta.
     *
     * @remarks
     * Computes a `scrollRatio` — the number of content pixels that correspond
     * to one track pixel — and applies it to `deltaPixels`:
     *
     * ```
     * scrollRatio  = (contentSize - viewportSize) / (viewportSize - thumbSize)
     * scrollDelta  = deltaPixels * scrollRatio
     * ```
     *
     * The resulting offset is forwarded to {@link ScrollStateManager.setScrollOffset},
     * which handles clamping, thumb repositioning, and subscriber notification.
     *
     * This method silently exits when there is no overflow.
     *
     * @param deltaPixels - The pointer movement in pixels (positive = scroll
     *   forward/down, negative = scroll backward/up).
     */
    handleDrag(deltaPixels: number): void;
    /**
     * Updates the dragging flag and notifies listeners.
     *
     * @remarks
     * Emits a `DRAG_STATE_CHANGED` event so that consumers (e.g. the host
     * component) can apply visual feedback such as preventing text selection
     * or changing the cursor style.
     *
     * @param isDragging - `true` when the user starts dragging the thumb;
     *   `false` when the drag ends.
     */
    setDragging(isDragging: boolean): void;
}

/**
 * Resizable layout controlling two panes separated by a draggable divider.
 *
 * @remarks
 * `SplitPane` is a controlled, headless layout primitive. The parent owns
 * the split size (as a percentage of the container along the main axis)
 * and receives drag/keyboard updates via `onResize`. The component can be used
 * for any two-pane interface and doesn't influence what the children are.
 *
 * @example
 * A 30/70 horizontal split with a sidebar and an editor:
 * ```tsx
 * const [firstSize, setFirstSize] = useState(30);
 *
 * return (
 *   <SplitPane
 *     orientation="horizontal"
 *     firstSize={firstSize}
 *     onResize={setFirstSize}
 *     firstSubPane={<Sidebar />}
 *     secondSubPane={<Editor />}
 *   />
 * );
 * ```
 *
 * @example
 * A fixed (non-resizable) vertical split:
 * ```tsx
 * <SplitPane
 *   orientation="vertical"
 *   firstSize={70}
 *   disabled
 *   firstSubPane={<Preview />}
 *   secondSubPane={<Console />}
 * />
 * ```
 *
 * @see {@link SplitPaneProps} for full prop documentation.
 */
export declare const SplitPane: default_2.FC<SplitPaneProps>;

/**
 * Props for the {@link SplitPane} component.
 *
 * @remarks
 * `SplitPane` is a binary resizable layout primitive: two children separated
 * by a draggable divider. It is fully controlled — the parent owns the
 * current {@link SplitPaneProps.firstSize} and receives updates through
 * {@link SplitPaneProps.onResize}. The component has no opinions about what
 * the children are; use it for editor/sidebar layouts, diff views,
 * documentation panes, or any other two-pane arrangement.
 *
 * For multi-pane tree layouts (recursive splits managed as state), see
 * {@link PaneTree} and {@link PaneTreeStateManager}.
 */
export declare type SplitPaneProps = BaseComponentProps & {
    /** Content rendered in the first (left / top) sub-pane. */
    firstSubPane: ReactNode;
    /** Content rendered in the second (right / bottom) sub-pane. */
    secondSubPane: ReactNode;
    /**
     * Layout axis.
     *
     * @remarks
     * - `'horizontal'` — sub-panes laid out side-by-side with a vertical
     *   divider (`firstSize` controls the width of `firstSubPane`).
     * - `'vertical'` — sub-panes stacked with a horizontal divider
     *   (`firstSize` controls the height of `firstSubPane`).
     *
     * @default 'horizontal'
     */
    orientation?: Orientation;
    /**
     * Current size of the first sub-pane as a percentage (`0`–`100`) of the
     * container along its main axis.
     *
     * @remarks
     * The component is fully controlled: it renders whatever value it is
     * given. Clamping against {@link SplitPaneProps.minSize} and
     * {@link SplitPaneProps.maxSize} is applied to the values emitted via
     * {@link SplitPaneProps.onResize}, so well-behaved callers never see
     * out-of-range values.
     */
    firstSize: number;
    /**
     * Called with the new size (in percent) whenever the user drags the
     * splitter or presses an arrow key on the focused splitter.
     *
     * @remarks
     * The emitted value is already clamped to
     * `[minSize, maxSize]`. Omit this prop to render a fixed (non-resizable)
     * layout at `firstSize`.
     */
    onResize?: (firstSize: number) => void;
    /**
     * Minimum size of the first sub-pane as a percentage. Also caps the
     * maximum size of the second sub-pane.
     *
     * @default 10
     */
    minSize?: number;
    /**
     * Maximum size of the first sub-pane as a percentage. Also caps the
     * minimum size of the second sub-pane.
     *
     * @default 90
     */
    maxSize?: number;
    /**
     * When `true`, disables the splitter: the layout still renders at
     * `firstSize`, but dragging and arrow-key resizing are ignored.
     *
     * @default false
     */
    disabled?: boolean;
    /** Extra class name merged onto the first sub-pane's wrapper element. */
    firstClassName?: string;
    /** Extra class name merged onto the second sub-pane's wrapper element. */
    secondClassName?: string;
    /** Extra class name merged onto the splitter element. */
    splitterClassName?: string;
};

/**
 * Directional keyword for splitting or dropping a leaf against another leaf.
 *
 * @remarks
 * - `'left'` / `'right'` — split the target horizontally; the new leaf is
 *   placed before (left) / after (right) the target.
 * - `'top'` / `'bottom'` — split the target vertically; the new leaf is
 *   placed before (top) / after (bottom) the target.
 */
export declare type SplitSide = 'left' | 'right' | 'top' | 'bottom';

/**
 * The batteries-included tab-and-content pane.
 *
 * @remarks
 * Renders a `TabList` at the top and the currently active tab's `content`
 * below it in a flex-column layout. Tab data is owned by an external (or
 * auto-created) `TabStateManager`; `StaticTabPane` does not store tabs or
 * active state itself — it subscribes to the manager and re-renders on
 * change.
 *
 * Header behaviour (selection, keyboard, close, scroll, drag-and-drop) is
 * delegated entirely to `TabList`. Close-then-fallback is handled by the
 * underlying `TabStateManager`: when the active tab is closed, it promotes
 * an adjacent tab and the content region swaps automatically.
 *
 * The content region is wrapped in a `position: relative` content area, and
 * `children` are rendered alongside the active tab content inside that area.
 * Use this slot to add absolutely-positioned overlays — typically a
 * `DropZone` — that should cover the content but not the tab bar.
 *
 * @example
 * Single pane with inline content:
 * ```tsx
 * const tabManager = useMemo(() => new TabStateManager(), []);
 * useEffect(() => {
 *   tabManager.addTab({ id: 1, label: 'README', content: <Readme /> });
 *   tabManager.addTab({ id: 2, label: 'Settings', content: <Settings /> });
 * }, [manager]);
 *
 * return <StaticTabPane tabManager={tabManager} onTabClick={onOpen} />;
 * ```
 *
 * @example
 * Two coordinated panes sharing a single drag manager so tabs can be dragged
 * between them:
 * ```tsx
 * const dragManager = useMemo(() => new DragStateManager(), []);
 *
 * return (
 *   <div style={{ display: 'flex' }}>
 *     <StaticTabPane
 *       paneId={0}
 *       tabManager={leftTabs}
 *       dragAndDropManager={dragManager}
 *       ...
 *     />
 *     <StaticTabPane
 *       paneId={1}
 *       tabManager={rightTabs}
 *       dragAndDropManager={dragManager}
 *       ...
 *     />
 *   </div>
 * );
 * ```
 *
 * @see {@link StaticTabPaneProps} for full prop documentation.
 * @see {@link TabList} for the tab-bar-only variant.
 */
export declare const StaticTabPane: default_2.FC<StaticTabPaneProps>;

/**
 * Props for the {@link StaticTabPane} component.
 *
 * @remarks
 * `StaticTabPane` is the batteries-included tab-and-content unit — a `TabList`
 * stacked above a content region that renders the active tab's `content`.
 */
export declare type StaticTabPaneProps = BaseComponentProps & {
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

/**
 * A simple tab component with easy default features.
 *
 * @remarks
 * Renders a tab with a label and optional close button. All state data is
 * controlled via props — this component holds no internal state. Activation
 * is exposed through `onClick`, which fires on mouse click and on
 * `Enter`/`Space` when the tab is focused.
 *
 * @example
 * Basic usage inside a tab bar:
 * ```tsx
 * <Tab
 *   id={0}
 *   label="My Tab"
 *   isActive={activeId === 0}
 *   isDragged={false}
 *   dropTargetSide={null}
 *   isCloseable={true}
 *   onClick={() => setActiveId(0)}
 *   onClose={handleClose}
 * />
 * ```
 *
 * @see {@link TabProps} for full prop documentation.
 */
export declare const Tab: default_2.FC<TabProps>;

/**
 * Handlers to spread onto an individual draggable tab element.
 *
 * @remarks
 * The element must render with `draggable` set so that the browser fires
 * native drag events. We include `draggable: true` in the returned object so
 * consumers can do `<div {...getTabHandlers(tab)} />`.
 */
export declare type TabDragHandlers = {
    /** Required by the HTML5 drag-and-drop API. */
    draggable: true;
    /** Wire to `onDragStart`. */
    onDragStart: (e: React.DragEvent) => void;
    /** Wire to `onDragOver`. */
    onDragOver: (e: React.DragEvent) => void;
    /** Wire to `onDragEnd`. */
    onDragEnd: (e: React.DragEvent) => void;
    /** Wire to `onDrop`. */
    onDrop: (e: React.DragEvent) => void;
};

/**
 * Delivered when a dragged tab is dropped on top of another tab.
 *
 * @remarks
 * The consumer is expected to translate this into a reorder/move operation on
 * its own tab collection(s). When `sourcePaneId === targetPaneId` the drop is
 * a same-pane reorder; otherwise it is a cross-pane move.
 */
export declare type TabDropPayload = {
    /** The tab that was being dragged. */
    tab: TabItem;
    /** The pane the dragged tab originated from. */
    sourcePaneId: PaneId;
    /** The pane that received the drop. */
    targetPaneId: PaneId;
    /** The tab the dragged tab was dropped on. */
    targetTab: TabItem;
    /** Which half of the target tab the pointer was on at drop time. */
    side: TabDropTargetSide;
};

/**
 * Identifies the tab that the user is currently hovering over while dragging
 * another tab.
 *
 * @remarks
 * `side` is used to decide whether the dragged tab will be inserted before
 * (`'left'`) or after (`'right'`) the hovered tab on drop.
 */
export declare type TabDropTargetHoverData = {
    /** The id of the tab currently being hovered as a drop target. */
    tabId: TabId;
    /** Which half of the hovered tab the pointer is on. */
    side: TabDropTargetSide;
};

declare type TabDropTargetSide = 'left' | 'right';

export declare type TabEvent = {
    eventType: 'TAB_ADDED';
    payload: {
        tab: TabItem;
        index: number;
    };
} | {
    eventType: 'TAB_REMOVED';
    payload: {
        id: TabId;
        nextActiveId: TabId | null;
    };
} | {
    eventType: 'ACTIVE_TAB_CHANGED';
    payload: {
        id: TabId;
    };
} | {
    eventType: 'TABS_REORDERED';
    payload: {
        order: TabId[];
    };
};

declare type TabId = number;

declare type TabItem = {
    /**
     * Unique identifier for this tab.
     *
     * @remarks
     * Must be unique relative to other tabs and does not change for the lifetime
     * of the tab. Used as the `data-tab-id` attribute and passed back to
     * `onClose`.
     */
    id: TabId;
    /**
     * The text displayed on the tab.
     *
     * @remarks
     * Long labels are truncated with an ellipsis via CSS `text-overflow`. The
     * label is exposed as a `title` tooltip.
     *
     * @example
     * ```tsx
     * <Tab id={1} label="index.ts" ... />
     * ```
     */
    label: string;
    /**
     * Whether this tab is the currently selected tab.
     *
     * @default false
     */
    isActive?: boolean;
    /**
     * Whether this tab is currently being dragged by the user.
     *
     * @remarks
     * When `true`, the tab is rendered dimmed and slightly rotated to give
     * a visual affordance that it is "in flight".
     *
     * @default false
     */
    isDragged?: boolean;
    /**
     * Whether or not this tab is a drop target when another tab is being
     * dragged, and which side of this tab is currently being hovered over.
     *
     * @remarks
     * `null` indicates the tab is not the target of a dragged tab.
     * A coloured drop-indicator line is rendered on the indicated side.
     *
     * @default null
     */
    dropTargetSide?: TabDropTargetSide | null;
    /**
     * Sets whether the tab can be closed or not.
     *
     * @remarks
     * When not closeable, the close button is not rendered at all, producing a
     * "pinned" tab that cannot be closed by the user.
     *
     * @default true
     */
    isCloseable?: boolean;
    /**
     * Callback fired when the tab is activated — by mouse click, or by
     * pressing `Enter`/`Space` while the tab is focused.
     *
     * @remarks
     * Tab is stateless: invoking `onClick` does not flip `isActive` on its
     * own. The parent is expected to update its active tab id and pass the
     * new `isActive` value back in.
     *
     * When the tab is rendered through `TabList`, this fires *in addition*
     * to `TabListProps.onTabClick` — selection runs first, then this
     * callback, so the consumer observes the post-activation state. The two
     * differ in cadence: `TabListProps.onTabClick` only fires when the active
     * tab actually changes, whereas `onClick` fires on every click including
     * re-clicks of the already-active tab.
     *
     * Clicks on the close button do not invoke `onClick` — the close button
     * stops propagation internally.
     *
     * @example
     * ```tsx
     * <Tab id={3} onClick={() => setActiveId(3)} ... />
     * ```
     */
    onClick?: () => void;
    /**
     * Callback when the user clicks the close button.
     *
     * @remarks
     * When omitted, the close button is not rendered at all, producing a
     * "pinned" tab that cannot be closed by the user.
     *
     * @param id - The `id` of the tab being closed.
     *
     * @example
     * ```tsx
     * <Tab id={3} onClose={(id) => dispatch({ type: 'CLOSE_TAB', id })} ... />
     * ```
     */
    onClose?: (id: number) => void;
    /**
     * Renderable content for the tab's body.
     *
     * @remarks
     * {@link StaticTabPane} displays the `content` of the currently active tab
     * below the {@link TabList}. Omit this field when a tab only participates
     * in the header (e.g. when you render the body yourself outside the
     * `StaticTabPane`).
     *
     * @example
     * ```tsx
     * const tab: TabItem = {
     *   id: 0,
     *   label: 'Sample Component',
     *   content: <SampleComponent {...componentProps} />,
     * };
     * ```
     */
    content?: ReactNode;
};

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
export declare const TabList: default_2.FC<TabListProps>;

/**
 * Handlers to spread onto the container that wraps the tab list.
 *
 * @remarks
 * The list-level handlers fire when the user drags into the empty space
 * around the individual tabs. Tab-level handlers stop propagation, so these
 * only run when the pointer is genuinely outside any tab element.
 */
export declare type TabListDragHandlers = {
    /** Wire to `onDragOver`. */
    onDragOver: (e: React.DragEvent) => void;
    /** Wire to `onDrop`. */
    onDrop: (e: React.DragEvent) => void;
};

/**
 * Delivered when a dragged tab is dropped on the empty space inside a tab list
 * (generally to the right of the tabs when there isn't overflow).
 */
export declare type TabListDropPayload = {
    /** The tab that was being dragged. */
    tab: TabItem;
    /** The pane the dragged tab originated from. */
    sourcePaneId: PaneId;
    /** The pane that received the drop. */
    targetPaneId: PaneId;
};

/**
 * Handlers to spread onto the container that wraps the tab list.
 *
 * @remarks
 * Owns keyboard navigation (ArrowLeft / ArrowRight / Home / End). The
 * container must be focusable (`tabIndex={0}`) for key events to reach it;
 * {@link TabListHandlers.role} is supplied for ARIA conformance.
 */
export declare type TabListHandlers = {
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

/**
 * Props for the {@link TabList} component.
 *
 * @remarks
 * `TabList` is the batteries-included tab bar. It composes:
 *
 * - `useTabList` for selection state and keyboard navigation,
 * - `useTabDragAndDrop` for tab drag-and-drop (always enabled), and
 * - `ScrollPane` for horizontal overflow scrolling (toggleable via
 *   {@link TabListProps.isScrollable}).
 *
 * Each managed tab is rendered with a `<Tab />`. The component is fully
 * controlled by the supplied (or internally created) state managers — there
 * is no internal tab data store of its own.
 *
 * For finer-grained control (e.g. custom tab rendering, custom keyboard
 * behaviour, drag disabled), drop down one layer and call `useTabList`
 * directly while rendering your own tabs.
 */
export declare type TabListProps = BaseComponentProps & {
    /**
     * Tab state manager that owns the tab collection.
     *
     * @remarks
     * Pass one in when the tab data is owned outside the component (e.g. when
     * several views need to share the same tabs, or when state needs to be
     * seeded before mount). When omitted, an empty internal manager is created
     * and lives for the component's lifetime.
     */
    tabManager?: TabStateManager;
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

/**
 * Props for the {@link Tab} component.
 *
 * @remarks
 * Tab is stateless. All visual states (`isActive`, `isDragged`,
 * `dropTargetSide`) are controlled externally. The parent component is
 * responsible for managing which tab is active, drag-and-drop state, etc.
 *
 * Activation is exposed through mouse click, or `Enter`/`Space` while the tab
 * is focused — both invoke `onClick`. `Space` calls `preventDefault()` to
 * suppress page scroll. Tab does not set `isActive` itself; the parent must
 * reflect the new state back in.
 *
 * Default ARIA properties:
 * `role='tab'`
 * `aria-selected={isActive}`
 * `tabIndex={isActive ? 0 : -1}`
 */
export declare type TabProps = BaseComponentProps & TabItem;

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
export declare type TabSelectionHandlers = {
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

export declare type TabState = {
    activeId: TabId | null;
    order: TabId[];
    itemMap: Map<TabId, TabItem>;
    paneId?: PaneId;
};

/**
 * Manages the state and business logic for an ordered collection of tabs.
 *
 * @remarks
 * This manager is headless — it owns no DOM or framework references. It
 * enforces the following invariants at all times:
 *
 * - `activeId` is always `null` only when there are no tabs.
 * - When the active tab is removed, focus is automatically transferred to the
 *   nearest remaining tab (the tab at the same index, or the last tab if the
 *   removed one was the last).
 * - `reorder` silently rejects arrays whose length does not match the current
 *   tab count to prevent accidental data loss.
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
export declare class TabStateManager extends BaseStateManager<TabState, TabEvent> {
    /**
     * Creates a new `TabStateManager`.
     *
     * @param initialState - Optional partial state.
     */
    constructor(initialState?: Partial<TabState>);
    /**
     * Returns the full `TabItem` object for the currently active tab.
     *
     * @returns The active `TabItem`, or `null` if no tab is active (i.e. the
     *   collection is empty).
     */
    get activeTab(): TabItem | null;
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
    addTab(tab: TabItem, index?: number, autoSelect?: boolean): void;
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
    removeTab(id: TabId): void;
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
    setActive(id: TabId): void;
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
    reorder(newOrder: TabId[]): void;
}

/**
 * Connects a {@link DragStateManager} to React, producing event handlers for
 * a pane's drop zone overlay.
 *
 * @remarks
 * The hook is sends DOM events into the manager and exposes drag state for
 * rendering, but it doesn't decide what a drop means. The consumer wires up
 * `onDrop` to perform the actual move-or-split logic.
 *
 * Lifecycle of a zone drag:
 *
 * 1. `onDragOver` (zone) — measures the current zone, calls `preventDefault()`
 *    so the element accepts a drop, and pushes the zone into the manager via
 *    {@link DragStateManager.setDropZoneHover}.
 * 2. `onDragLeave` (zone) — clears the manager's `dropZoneHover` *only if* the
 *    current hover is still this zone. This guards against the common case
 *    where `dragleave` fires on the old zone after `dragover` on the new zone
 *    has already overwritten the manager state.
 * 3. `onDrop` (zone) — fires `onDrop` with the dragged tab and the zone's
 *    position, then calls {@link DragStateManager.end}.
 *
 * Foreign drags (e.g. files dragged in from the OS) are ignored — the hook
 * only calls `preventDefault()` while one of its own drags is in flight, so
 * the browser handles unrelated drags through its default behaviour.
 *
 * @param options - See {@link UseDropZoneOptions}.
 *
 * @example
 * ```tsx
 * const { state, getDropZoneHandlers } = useDropZone({
 *   paneId: 0,
 *   manager: dragManager,
 *   onDrop: ({ tab, sourcePaneId, pos }) => {
 *     if (pos === 'center') moveTab(sourcePaneId, 0, tab);
 *     else splitPane(0, sourcePaneId, pos, tab);
 *   },
 * });
 *
 * return (
 *   <div>
 *     {state.draggedTab !== null && (
 *       <div {...getDropZoneHandlers('center')} />
 *     )}
 *   </div>
 * );
 * ```
 */
export declare const useDropZone: (options: UseDropZoneOptions) => UseDropZoneReturn;

/**
 * Options accepted by {@link useDropZone}.
 */
export declare type UseDropZoneOptions = {
    /** Identifier of the pane this overlay belongs to. */
    paneId: PaneId;
    /**
     * Shared drag state manager.
     *
     * @remarks
     * Pass the same instance used by the source pane so the overlay can see the
     * in-flight drag. When omitted, an internal manager is created and the
     * overlay will never fire because no drag will originate inside it.
     */
    manager?: DragStateManager;
    /**
     * Called when a dragged tab is dropped on one of the hook's zones.
     */
    onDrop?: (data: DropZoneDropPayload) => void;
};

/**
 * Return shape of {@link useDropZone}.
 */
export declare type UseDropZoneReturn = {
    /** Derived drag state for rendering. */
    state: UseDropZoneState;
    /**
     * Builds the set of HTML5 drag event handlers for an individual zone.
     * Spread the returned object onto the zone element.
     */
    getDropZoneHandlers: (pos: DropZonePosition) => DropZoneHandlers;
    /** The underlying drag state manager. Exposed for advanced consumers. */
    manager: DragStateManager;
};

/**
 * The in-flight drag state, scoped to one consumer pane's drop zone overlay.
 */
export declare type UseDropZoneState = {
    /** The tab currently being dragged anywhere in the system, or `null`. */
    draggedTab: TabItem | null;
    /** The pane the dragged tab originated from, or `null` when idle. */
    sourcePaneId: PaneId | null;
    /**
     * `true` when the in-flight drag originated from this hook's pane.
     *
     * @remarks
     * Useful for disabling self-drops (a consumer that doesn't want to accept a
     * tab back into the same pane can ignore the `onDrop` callback when this is
     * `true`).
     */
    isDraggingFromThisPane: boolean;
    /**
     * The current drop-zone hover target across the whole drag system, or
     * `null`.
     *
     * @remarks
     * The `paneId` is only meaningful for this hook's pane — consumers should
     * filter `dropZoneHover?.paneId === paneId` before applying hover styling.
     */
    dropZoneHover: DropZoneHoverData | null;
};

/**
 * Holds the scroll state via {@link ScrollStateManager}, producing the refs,
 * event handlers, and derived state needed to render a {@link ScrollPane}.
 *
 * @remarks
 * A `ResizeObserver` watches both the viewport and the content wrapper and
 * pushes size changes into the manager. Native scroll events on the viewport
 * sync the manager's `scrollOffset`; drag/track interactions update the
 * manager, which then writes the resulting offset back to the DOM.
 *
 * For horizontal panes with `wheelToScroll` enabled, a native non-passive
 * wheel listener converts vertical wheel deltas into horizontal scrolls.
 *
 * @param options - Behavior options. See {@link ScrollPaneOptions}.
 *
 * @example
 * ```tsx
 * const { state, handlers, viewportRef, trackRef, contentRef } =
 *   useScrollPane({ orientation: 'vertical' });
 * ```
 */
export declare const useScrollPane: (options?: ScrollPaneOptions) => UseScrollPaneReturn;

/**
 * Return shape of {@link useScrollPane}.
 */
export declare type UseScrollPaneReturn = {
    /** Current scrollbar state (viewport/content sizes, thumb pos, flags). */
    state: ScrollPaneViewState;
    /** Event handlers for the viewport, track, and thumb elements. */
    handlers: ScrollPaneHandlers;
    /** Ref for the scrollable viewport element. */
    viewportRef: React.RefObject<HTMLDivElement | null>;
    /** Ref for the custom scrollbar track element. */
    trackRef: React.RefObject<HTMLDivElement | null>;
    /** Ref for the content wrapper element (used to measure `contentSize`). */
    contentRef: React.RefObject<HTMLDivElement | null>;
    /** The underlying state manager. */
    manager: ScrollStateManager;
};

/**
 * Connects a {@link DragStateManager} to React, producing event handlers for
 * tab and tab-list DOM elements.
 *
 * @remarks
 * The hook is sends DOM events into the manager and exposes drag state for
 * rendering, but it doesn't decide what a drop means. The consumer wires up
 * `onTabDrop` and `onTabListDrop` to perform the reorder/move logic on its tabs.
 *
 * Lifecycle of a drag:
 *
 * 1. `onDragStart` — calls {@link DragStateManager.start} and writes the tab
 *    id into `dataTransfer` so the browser treats the gesture as a valid
 *    drag.
 * 2. `onDragOver` (tab) — measures pointer position relative to the tab,
 *    computes the `'left'`/`'right'` side, and pushes it into the manager.
 *    Also calls `preventDefault()` so the element accepts a drop.
 * 3. `onDragOver` (list) — clears the tab hover when the pointer moves into
 *    empty space around the tabs.
 * 4. `onDrop` (tab) — fires `onTabDrop` with the dragged tab, target tab,
 *    and side, then calls {@link DragStateManager.end}.
 * 5. `onDrop` (list) — fires `onTabListDrop`, then calls
 *    {@link DragStateManager.end}.
 * 6. `onDragEnd` — always called by the browser after a drag completes
 *    (drop or cancel). Calls {@link DragStateManager.end} as a safety net;
 *    the second call is a no-op if a drop already ended the drag.
 *
 * Self-drop guards: dragging a tab onto itself does not fire the tab hover
 * (no drop indicator on the source tab) and does not invoke the consumer's
 * drop callback.
 *
 * Other drags (e.g. files dragged in from the OS) are ignored — the hook only
 * calls `preventDefault()` while one of its own drags is in flight, so the
 * browser handles unrelated drags through its default behaviour.
 *
 * @param options - See {@link UseTabDragAndDropOptions}.
 *
 * @example
 * ```tsx
 * const { state, getTabHandlers, listHandlers } = useTabDragAndDrop({
 *   paneId: 0,
 *   onTabDrop: ({ tab, targetTab, side }) => reorder(tab, targetTab, side),
 *   onTabListDrop: ({ tab }) => appendToEnd(tab),
 * });
 *
 * return (
 *   <div {...listHandlers}>
 *     {tabs.map((tab) => (
 *       <Tab
 *         key={tab.id}
 *         {...tab}
 *         isDragged={state.draggedTab?.id === tab.id}
 *         dropTargetSide={
 *           state.tabHover?.tabId === tab.id ? state.tabHover.side : null
 *         }
 *         {...getTabHandlers(tab)}
 *       />
 *     ))}
 *   </div>
 * );
 * ```
 */
export declare const useTabDragAndDrop: (options: UseTabDragAndDropOptions) => UseTabDragAndDropReturn;

/**
 * Options accepted by {@link useTabDragAndDrop}.
 */
export declare type UseTabDragAndDropOptions = {
    /** Identifier of the pane this hook is wired to. */
    paneId: PaneId;
    /**
     * Shared drag state manager.
     *
     * @remarks
     * Cross-pane drag-and-drop requires every participating pane to use the
     * same {@link DragStateManager} instance — typically created once in a
     * provider near the top of the tree and threaded through. If omitted, the
     * hook creates its own internal manager scoped to a single pane.
     */
    manager?: DragStateManager;
    /**
     * Called when a dragged tab is dropped on top of another tab in this pane.
     * The consumer typically translates this into a reorder/move operation.
     */
    onTabDrop?: (data: TabDropPayload) => void;
    /**
     * Called when a dragged tab is dropped on the empty space inside this
     * pane's tab list. Conventionally treated as "append to the end".
     */
    onTabListDrop?: (data: TabListDropPayload) => void;
};

/**
 * Return shape of {@link useTabDragAndDrop}.
 */
export declare type UseTabDragAndDropReturn = {
    /** Derived drag state for rendering. */
    state: UseTabDragAndDropState;
    /**
     * Builds the set of HTML5 drag event handlers for an individual tab. Spread
     * the returned object onto the tab element.
     */
    getTabHandlers: (tab: TabItem) => TabDragHandlers;
    /** Drag event handlers for the tab list container. */
    tabListHandlers: TabListDragHandlers;
    /** The underlying state manager. Exposed for advanced consumers. */
    manager: DragStateManager;
};

/**
 * The in-flight drag state, scoped to one consumer pane.
 */
export declare type UseTabDragAndDropState = {
    /**
     * The tab currently being dragged anywhere in the system, or `null` when not
     * dragging a tab.
     */
    draggedTab: TabItem | null;
    /** The pane the dragged tab originated from, or `null` when idle. */
    sourcePaneId: PaneId | null;
    /**
     * `true` when the in-flight drag originated from this hook's pane.
     *
     * @remarks
     * Useful for styling (e.g. dim the source tab in its origin pane only) and
     * for deciding whether a drop on this pane is a same-pane reorder.
     */
    isDraggingFromThisPane: boolean;
    /**
     * The current tab drop target across the whole drag system, or `null`. The
     * `tabId` is only meaningful for tabs in this hook's pane — consumers should
     * filter `tabHover?.tabId === tab.id` before applying drop-indicator styling.
     */
    tabDropTargetHover: TabDropTargetHoverData | null;
};

/**
 * Connects a {@link TabStateManager} to React, producing the derived tab
 * list and the event handlers needed to drive selection and keyboard
 * navigation.
 *
 * @remarks
 * The hook subscribes to the manager on mount and re-renders whenever the
 * manager notifies its subscribers. `state.tabs` is recomputed on every
 * state change by joining the manager's `order` and `itemMap`, giving a
 * ready-to-map array of `TabItem`s.
 *
 * Selection handlers (`getTabHandlers`) delegate to the manager:
 *
 * - `onClick` → `manager.setActive(tab.id)`
 * - `onClose` → `manager.removeTab(id)` (the manager then auto-adjusts
 *   the active id when the active tab is removed)
 *
 * Keyboard navigation uses *automatic activation*: arrow keys immediately
 * change the active tab rather than just moving focus. This matches the
 * behaviour expected in editor-style tab bars (VS Code, browsers) where
 * switching tabs reveals the associated panel right away.
 *
 * @param options - See {@link UseTabListOptions}.
 *
 * @example
 * ```tsx
 * const { state, getTabHandlers, listHandlers } = useTabList();
 *
 * return (
 *   <div {...listHandlers} tabIndex={0}>
 *     {state.tabs.map((tab) => {
 *       const selection = getTabHandlers(tab);
 *       return (
 *         <div key={tab.id} onClick={selection.onClick}>
 *           <Tab
 *             {...tab}
 *             isActive={selection.isActive}
 *             onClose={selection.onClose}
 *           />
 *         </div>
 *       );
 *     })}
 *   </div>
 * );
 * ```
 */
export declare const useTabList: (options?: UseTabListOptions) => UseTabListReturn;

/**
 * Options accepted by {@link useTabList}.
 */
export declare type UseTabListOptions = {
    /**
     * External state manager.
     *
     * @remarks
     * Pass one in when the tab collection is owned outside the hook (e.g. when
     * several components need to share the same manager, or when the consumer
     * needs to seed state before mounting). If omitted, the hook creates its
     * own empty manager.
     */
    manager?: TabStateManager;
    /**
     * Called after a tab is activated via click or keyboard. Fires only on
     * actual state change — re-clicking the active tab does not invoke it.
     */
    onTabClick?: (tab: TabItem) => void;
    /**
     * Called after a tab is removed via the close button. Receives the tab as
     * it existed before removal.
     */
    onTabClose?: (tab: TabItem) => void;
};

/**
 * Return shape of {@link useTabList}.
 */
export declare type UseTabListReturn = {
    /** Derived view of the tab collection for rendering. */
    state: UseTabListState;
    /**
     * Builds the per-tab selection props (active flag, click, close). Spread or
     * destructure onto a wrapper element around each `<Tab />`.
     */
    getTabHandlers: (tab: TabItem) => TabSelectionHandlers;
    /** Handlers for the container that wraps the tab list (keyboard nav). */
    tabListHandlers: TabListHandlers;
    /** The underlying state manager. Exposed for advanced consumers. */
    manager: TabStateManager;
};

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
export declare type UseTabListState = {
    /** Tabs in visual order, ready for `.map()` rendering. */
    tabList: TabItem[];
    /** The currently active tab, or `null` when the list is empty. */
    activeTab: TabItem | null;
    /** The id of the currently active tab, or `null` when the list is empty. */
    activeId: TabId | null;
};

export { }
