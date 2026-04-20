import { type Orientation } from './Base.type';

/**
 * Modes for handling track clicks.
 */
export type ScrollClickMode = 'jump' | 'increment';

/**
 * Controls the state of a scrollbar. Includes size and position.
 */
export type ScrollState = {
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

export type ScrollEvent =
  | { eventType: 'SCROLL_UPDATED'; payload: { offset: number } }
  | { eventType: 'OVERFLOW_CHANGED'; payload: { hasOverflow: boolean } }
  | { eventType: 'DRAG_STATE_CHANGED'; payload: { isDragging: boolean } };
