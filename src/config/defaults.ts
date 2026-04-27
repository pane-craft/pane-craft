import { type PaneSplitterProps } from '../types/PaneSplitter.type';
import { type ScrollPaneOptions } from '../types/ScrollPane.type';
import { type ScrollClickMode } from '../types/ScrollStateManager.type';
import { type SplitPaneProps } from '../types/SplitPane.type';

export const DEFAULT_SCROLL_PANE_THUMB_SIZE = 20;

export const DEFAULT_SCROLL_PANE_OPTIONS = {
  orientation: 'horizontal',
  trackClickMode: 'jump' as ScrollClickMode,
  thumbSizeMin: DEFAULT_SCROLL_PANE_THUMB_SIZE,
  autoHide: true,
  wheelToScroll: true,
} as const satisfies Required<ScrollPaneOptions>;

export const DEFAULT_PANE_SPLITTER_OPTIONS = {
  ariaValueMax: 100,
  ariaValueMin: 0,
  disabled: false,
} as const satisfies Required<
  Pick<PaneSplitterProps, 'ariaValueMax' | 'ariaValueMin' | 'disabled'>
>;

export const DEFAULT_SPLIT_PANE_OPTIONS = {
  disabled: false,
  maxSize: 90,
  minSize: 10,
  orientation: 'horizontal',
} as const satisfies Required<
  Pick<SplitPaneProps, 'disabled' | 'maxSize' | 'minSize' | 'orientation'>
>;
