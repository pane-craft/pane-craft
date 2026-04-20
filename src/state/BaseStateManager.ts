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
export abstract class BaseStateManager<
  TState,
  TEvent extends { eventType: string; payload?: unknown },
> {
  /** The current internal state. Mutated directly by subclasses. */
  protected state: TState;

  /**
   * The set of callbacks registered via {@link BaseStateManager.subscribe}.
   * Each callback is invoked on every call to
   * {@link BaseStateManager.notifySubscribers}.
   */
  protected subscriberSet = new Set<() => void>();

  /**
   * A map from event type discriminant to the list of handlers registered
   * for that event via {@link BaseStateManager.on}.
   */
  protected eventListenerMap = new Map<
    TEvent['eventType'],
    ((event: TEvent) => void)[]
  >();

  /**
   * Creates a new state manager instance with the provided initial state.
   *
   * @param initialState - The starting value for {@link BaseStateManager.state}.
   */
  constructor(initialState: TState) {
    this.state = initialState;
  }

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
  public on<K extends TEvent['eventType']>(
    eventType: K,
    callback: (event: Extract<TEvent, { eventType: K }>) => void,
  ): () => void {
    const handlerList = this.eventListenerMap.get(eventType) ?? [];

    handlerList.push(callback as (event: TEvent) => void);
    this.eventListenerMap.set(eventType, handlerList);

    return () => {
      const currentHandlerList = this.eventListenerMap.get(eventType);
      if (currentHandlerList) {
        this.eventListenerMap.set(
          eventType,
          currentHandlerList.filter((h) => h !== callback),
        );
      }
    };
  }

  /**
   * Broadcasts an event to all handlers currently registered for its type.
   *
   * @remarks
   * Handlers are called synchronously in registration order.
   *
   * @param event - The event object to broadcast. Its `eventType` is used to
   *   look up the handler list.
   */
  protected emit(event: TEvent): void {
    const handlerList = this.eventListenerMap.get(event.eventType) ?? [];
    handlerList.forEach((handler) => {
      handler(event);
    });
  }

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
  public subscribe(callback: () => void): () => void {
    this.subscriberSet.add(callback);
    return () => {
      this.subscriberSet.delete(callback);
    };
  }

  /**
   * Invokes all registered state-change subscribers.
   *
   * @remarks
   * Subclasses should call this at the end of any method that mutates
   * {@link BaseStateManager.state} so that consumers always receive
   * up-to-date snapshots.
   */
  protected notifySubscribers(): void {
    this.subscriberSet.forEach((callback) => {
      callback();
    });
  }

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
  public getState(): Readonly<TState> {
    return { ...this.state };
  }
}
