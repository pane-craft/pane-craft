import { describe, it, expect, vi } from 'vitest';

import { BaseStateManager } from './BaseStateManager';

type TestState = { count: number };
type TestEvent =
  | { eventType: 'INCREMENTED'; payload: { amount: number } }
  | { eventType: 'RESET'; payload: null };

/**
 * A concrete implementation of the abstract class for testing purposes.
 * Protected methods are exposed as public to make them testable.
 */
class MockStateManager extends BaseStateManager<TestState, TestEvent> {
  public triggerEmit(event: TestEvent): void {
    this.emit(event);
  }

  public triggerNotify(): void {
    this.notifySubscribers();
  }
}

describe('BaseStateManager', () => {
  const initialState: TestState = { count: 0 };

  describe('getState', () => {
    it('returns the initial state', () => {
      const manager = new MockStateManager(initialState);
      expect(manager.getState()).toEqual({ count: 0 });
    });

    it('returns a shallow copy, not the internal reference', () => {
      const manager = new MockStateManager(initialState);
      const state = manager.getState();

      (state as TestState).count = 999;
      expect(manager.getState().count).toBe(0);
    });
  });

  describe('State Subscriptions', () => {
    it('should notify subscribers when notifySubscribers is called', () => {
      const manager = new MockStateManager(initialState);
      const callback = vi.fn();

      manager.subscribe(callback);
      manager.triggerNotify();

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should notify multiple subscribers on a single notifySubscribers call', () => {
      const manager = new MockStateManager(initialState);
      const cb1 = vi.fn();
      const cb2 = vi.fn();
      const cb3 = vi.fn();

      manager.subscribe(cb1);
      manager.subscribe(cb2);
      manager.subscribe(cb3);
      manager.triggerNotify();

      expect(cb1).toHaveBeenCalledTimes(1);
      expect(cb2).toHaveBeenCalledTimes(1);
      expect(cb3).toHaveBeenCalledTimes(1);
    });

    it('should stop notifying after unsubscribing', () => {
      const manager = new MockStateManager(initialState);
      const callback = vi.fn();

      const unsubscribe = manager.subscribe(callback);
      unsubscribe();
      manager.triggerNotify();

      expect(callback).not.toHaveBeenCalled();
    });

    it('should only unsubscribe the specific callback that was returned', () => {
      const manager = new MockStateManager(initialState);
      const cb1 = vi.fn();
      const cb2 = vi.fn();

      const unsubscribe1 = manager.subscribe(cb1);
      manager.subscribe(cb2);

      unsubscribe1();
      manager.triggerNotify();

      expect(cb1).not.toHaveBeenCalled();
      expect(cb2).toHaveBeenCalledTimes(1);
    });

    it('calling unsubscribe multiple times is safe', () => {
      const manager = new MockStateManager(initialState);
      const callback = vi.fn();

      const unsubscribe = manager.subscribe(callback);
      unsubscribe();
      unsubscribe();
      manager.triggerNotify();

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Event System', () => {
    it('should call event handlers with the correct payload', () => {
      const manager = new MockStateManager(initialState);
      const callback = vi.fn();

      manager.on('INCREMENTED', callback);

      const payload = { amount: 5 };
      manager.triggerEmit({ eventType: 'INCREMENTED', payload });

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'INCREMENTED',
          payload,
        }),
      );
    });

    it('should only trigger handlers for the specific event type emitted', () => {
      const manager = new MockStateManager(initialState);
      const incrementHandler = vi.fn();
      const resetHandler = vi.fn();

      manager.on('INCREMENTED', incrementHandler);
      manager.on('RESET', resetHandler);

      manager.triggerEmit({ eventType: 'RESET', payload: null });

      expect(resetHandler).toHaveBeenCalled();
      expect(incrementHandler).not.toHaveBeenCalled();
    });

    it('should allow multiple handlers for the same event type', () => {
      const manager = new MockStateManager(initialState);
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      manager.on('INCREMENTED', handler1);
      manager.on('INCREMENTED', handler2);

      manager.triggerEmit({ eventType: 'INCREMENTED', payload: { amount: 1 } });

      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });

    it('should call multiple handlers in registration order', () => {
      const manager = new MockStateManager(initialState);
      const callOrder: number[] = [];

      manager.on('INCREMENTED', () => callOrder.push(1));
      manager.on('INCREMENTED', () => callOrder.push(2));
      manager.on('INCREMENTED', () => callOrder.push(3));

      manager.triggerEmit({ eventType: 'INCREMENTED', payload: { amount: 1 } });

      expect(callOrder).toEqual([1, 2, 3]);
    });

    it('should stop calling the handler after unsubscribing from an event', () => {
      const manager = new MockStateManager(initialState);
      const callback = vi.fn();

      const unsubscribe = manager.on('INCREMENTED', callback);
      unsubscribe();

      manager.triggerEmit({ eventType: 'INCREMENTED', payload: { amount: 1 } });

      expect(callback).not.toHaveBeenCalled();
    });

    it('should only unsubscribe the specific handler that was returned', () => {
      const manager = new MockStateManager(initialState);
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      const unsubscribe1 = manager.on('INCREMENTED', handler1);
      manager.on('INCREMENTED', handler2);

      unsubscribe1();
      manager.triggerEmit({ eventType: 'INCREMENTED', payload: { amount: 1 } });

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it('should exit gracefully when emitting an event with no registered handlers', () => {
      const manager = new MockStateManager(initialState);

      expect(() => {
        manager.triggerEmit({ eventType: 'RESET', payload: null });
      }).not.toThrow();
    });

    it('calling an event unsubscribe multiple times is safe', () => {
      const manager = new MockStateManager(initialState);
      const callback = vi.fn();

      const unsubscribe = manager.on('INCREMENTED', callback);
      unsubscribe();
      unsubscribe();

      manager.triggerEmit({ eventType: 'INCREMENTED', payload: { amount: 1 } });
      expect(callback).not.toHaveBeenCalled();
    });
  });
});
