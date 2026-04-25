import { type ScrollPaneOptions } from '../types/ScrollPane.type';
import { type ScrollClickMode } from '../types/ScrollStateManager.type';

export const DEFAULT_SCROLL_PANE_THUMB_SIZE = 20;

export const DEFAULT_SCROLL_PANE_OPTIONS = {
  orientation: 'horizontal',
  trackClickMode: 'jump' as ScrollClickMode,
  thumbSizeMin: DEFAULT_SCROLL_PANE_THUMB_SIZE,
  autoHide: true,
  wheelToScroll: true,
} satisfies Required<ScrollPaneOptions>;
