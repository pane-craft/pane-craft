/**
 * Vitest-coupled test helpers for simulating HTML5 drag-and-drop. happy-dom
 * doesn't implement `DataTransfer` or element layout (`getBoundingClientRect`
 * returns all-zero rects), so drag handlers that read `dataTransfer` or
 * pointer geometry need custom stubs and mocks.
 *
 * @remarks
 * This module imports `vi` from `vitest`, so it must only ever be imported
 * from `*.test.*` files — never from Storybook stories or library source,
 * which would pull vitest into those bundles.
 */
import { vi } from 'vitest';

import { type TabId } from '../types/Tab.type';

/**
 * Build a minimal `DataTransfer` mock.
 *
 * @remarks
 * Supports the `setData`/`getData` round-trip plus the `effectAllowed` and
 * `dropEffect` fields the drag handlers touch. Pass it to `fireEvent`
 * (`fireEvent.dragStart(el, { dataTransfer: mockDataTransfer() })`), or rely
 * on {@link mockDragEvent}, which embeds one automatically.
 *
 * @returns A `DataTransfer` partial object via double assertion.
 */
export const mockDataTransfer = (): DataTransfer => {
  const data = new Map<string, string>();

  return {
    effectAllowed: 'none',
    dropEffect: 'none',
    setData: (format: string, value: string) => {
      data.set(format, value);
    },
    getData: (format: string) => data.get(format) ?? '',
  } as unknown as DataTransfer;
};

/**
 * Builds a stub `DOMRect` with overridable defaults.
 *
 * @remarks
 * Only the fields a test cares about need to be supplied; the rest default to
 * a 100×100 box at the origin. Drag geometry typically depends only on `left`
 * and `width` (tab left/right halves) or `width` and `height` (drop-zone
 * quadrants).
 *
 * @param overrides - Partial rect fields to override the defaults with.
 * @returns A `DOMRect` stub.
 */
export const stubDomRect = (overrides: Partial<DOMRect> = {}): DOMRect =>
  ({
    left: 0,
    top: 0,
    width: 100,
    height: 100,
    right: 100,
    bottom: 100,
    x: 0,
    y: 0,
    toJSON: () => ({}),
    ...overrides,
  }) as DOMRect;

/**
 * Overrides an element's `getBoundingClientRect` with a stubbed rect.
 *
 * @remarks
 * Use in `fireEvent`-driven component tests where a drag handler reads the
 * rect from a real DOM element (e.g. to compute the drop side). For hook tests
 * that call handlers directly, prefer {@link mockDragEvent}'s
 * `currentTargetRect` option instead.
 *
 * @param element - The element whose rect should be stubbed.
 * @param overrides - Partial rect fields; see {@link stubDomRect}.
 */
export const stubBoundingRect = (
  element: HTMLElement,
  overrides: Partial<DOMRect> = {},
): void => {
  element.getBoundingClientRect = () => stubDomRect(overrides);
};

/**
 * Builds a synthetic `React.DragEvent` for hook tests that invoke drag
 * handlers directly (rather than through `fireEvent`).
 *
 * @remarks
 * `preventDefault` and `stopPropagation` are `vi.fn()` spies so tests can
 * assert they were called. A {@link mockDataTransfer} mock is always
 * attached. When `currentTargetRect` is supplied, the event's `currentTarget`
 * gets a stubbed {@link stubDomRect}; otherwise it keeps happy-dom's
 * all-zero rect.
 *
 * @param options - Optional target element, current-target rect, and pointer
 *   coordinates.
 * @returns A partial `React.DragEvent` object via double assertion.
 */
export const mockDragEvent = ({
  target,
  currentTargetRect,
  clientX = 0,
  clientY = 0,
}: {
  target?: HTMLElement;
  currentTargetRect?: Partial<DOMRect>;
  clientX?: number;
  clientY?: number;
} = {}): React.DragEvent => {
  const targetElement = target ?? document.createElement('div');
  const currentTargetElement = document.createElement('div');

  if (currentTargetRect) {
    currentTargetElement.getBoundingClientRect = () =>
      stubDomRect(currentTargetRect);
  }

  return {
    target: targetElement,
    currentTarget: currentTargetElement,
    clientX,
    clientY,
    dataTransfer: mockDataTransfer(),
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
  } as unknown as React.DragEvent;
};

/**
 * Builds a detached DOM element with the `data-tab-id` attribute the tab drag
 * handlers query for.
 *
 * @param id - The tab id to add to the element's `data-tab-id` attribute.
 * @returns A `<div data-tab-id="{id}">` element.
 */
export const mockTabElement = (id: TabId): HTMLElement => {
  const element = document.createElement('div');
  element.setAttribute('data-tab-id', String(id));
  return element;
};
