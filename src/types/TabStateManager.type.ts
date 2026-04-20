import { type PaneId } from './Pane.type';
import { type TabId, type TabItem } from './Tab.type';

export { type TabItem, type TabId } from './Tab.type';

export type TabState = {
  activeId: TabId | null;
  order: TabId[];
  itemMap: Map<TabId, TabItem>;
  paneId?: PaneId;
};

export type TabEvent =
  | { eventType: 'TAB_ADDED'; payload: { tab: TabItem; index: number } }
  | {
      eventType: 'TAB_REMOVED';
      payload: { id: TabId; nextActiveId: TabId | null };
    }
  | { eventType: 'ACTIVE_TAB_CHANGED'; payload: { id: TabId } }
  | { eventType: 'TABS_REORDERED'; payload: { order: TabId[] } };
