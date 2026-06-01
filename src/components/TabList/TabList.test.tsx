import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  mockDataTransfer,
  stubBoundingRect,
} from '../../dev-utils/test-drag-drop.util';
import {
  createCustomTab,
  createTabItemList,
  getCustomTabTestId,
} from '../../dev-utils/test-react.util';
import {
  createTabManager,
  setStubResizeObserver,
} from '../../dev-utils/test.util';
import { DragStateManager } from '../../state/DragStateManager';
import { TabStateManager } from '../../state/TabStateManager';
import { type TabItem } from '../../types/Tab.type';
import { TabList } from './TabList';

setStubResizeObserver();

describe('TabList Component', () => {
  const tabList = createTabItemList(3);
  let tabManager: TabStateManager;
  const paneId = 1;
  const secondPaneId = 2;

  beforeEach(() => {
    tabManager = createTabManager(tabList, tabList[0].id);
  });

  describe('Rendering', () => {
    it('renders every tab from the tabManager in order', () => {
      render(<TabList tabManager={tabManager} />);

      const labels = screen
        .getAllByRole('tab')
        .map((el) => el.textContent.replace(/×$/, '').trim());
      expect(labels).toEqual(tabList.map((t) => t.label));
    });

    it('marks the active tab via aria-selected', () => {
      render(<TabList tabManager={tabManager} />);

      const tabs = screen.getAllByRole('tab');
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
      expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
      expect(tabs[2]).toHaveAttribute('aria-selected', 'false');
    });

    it('forwards a custom className onto the root element', () => {
      render(<TabList tabManager={tabManager} className="testClass" />);

      expect(screen.getByTestId('tab-list')).toHaveClass('testClass');
    });

    it('forwards a11y attributes onto the root element', () => {
      render(
        <TabList
          tabManager={tabManager}
          a11y={{ 'aria-label': 'Test Label' }}
        />,
      );

      expect(screen.getByTestId('tab-list')).toHaveAttribute(
        'aria-label',
        'Test Label',
      );
    });

    it('exposes the paneId via a data attribute', () => {
      render(<TabList tabManager={tabManager} paneId={paneId} />);

      expect(screen.getByTestId('tab-list')).toHaveAttribute(
        'data-pane-id',
        String(paneId),
      );
    });

    it('defaults paneId to 0 when no value is provided', () => {
      render(<TabList tabManager={tabManager} />);

      expect(screen.getByTestId('tab-list')).toHaveAttribute(
        'data-pane-id',
        '0',
      );
    });

    it('renders the inner container with role="tablist" and tabIndex 0', () => {
      render(<TabList tabManager={tabManager} />);

      const container = screen.getByTestId('tab-list-container');
      expect(container).toHaveAttribute('role', 'tablist');
      expect(container).toHaveAttribute('tabindex', '0');
    });
  });

  describe('Setup', () => {
    it('creates internal managers when none are provided', () => {
      const { container } = render(<TabList />);

      expect(
        container.querySelector('[data-testid="tab-list"]'),
      ).not.toBeNull();
      expect(screen.queryAllByRole('tab')).toHaveLength(0);
    });

    it('uses an externally provided TabStateManager', () => {
      render(<TabList tabManager={tabManager} />);
      expect(screen.getAllByRole('tab')).toHaveLength(
        tabManager.getState().itemMap.size,
      );
    });

    it('re-renders when the external tabManager mutates after mount', () => {
      render(<TabList tabManager={tabManager} />);

      act(() => {
        tabManager.addTab({ id: 99, label: 'Delta' });
      });

      expect(screen.getAllByRole('tab')).toHaveLength(4);
      expect(screen.getByText('Delta')).toBeInTheDocument();
    });

    it('works with an internal dragAndDropManager when none is provided', () => {
      render(<TabList tabManager={tabManager} />);

      expect(screen.getByTestId('tab-wrapper-1')).toHaveAttribute(
        'draggable',
        'true',
      );
    });
  });

  // Selection (mouse) --------------------------------------------------------
  describe('Selection via click', () => {
    it('activates a tab when it is clicked', () => {
      render(<TabList tabManager={tabManager} />);

      expect(tabManager.getState().activeId).toBe(tabList[0].id);

      fireEvent.click(screen.getByTestId(`tab-${tabList[1].id}`));

      expect(tabManager.getState().activeId).toBe(tabList[1].id);
    });

    it('fires onTabClick when the active tab changes via click', () => {
      const onTabClick = vi.fn();

      render(<TabList tabManager={tabManager} onTabClick={onTabClick} />);

      expect(onTabClick).not.toHaveBeenCalled();

      fireEvent.click(screen.getByTestId(`tab-${tabList[1].id}`));

      expect(onTabClick).toHaveBeenCalledTimes(1);
      expect(onTabClick).toHaveBeenCalledWith(tabList[1]);
    });

    it('does not fire onTabClick when the already-active tab is clicked', () => {
      const onTabClick = vi.fn();

      render(<TabList tabManager={tabManager} onTabClick={onTabClick} />);

      fireEvent.click(screen.getByTestId(`tab-${tabList[0].id}`));

      expect(onTabClick).not.toHaveBeenCalled();
    });

    it('reflects the new active tab in aria-selected after a click', () => {
      render(<TabList tabManager={tabManager} />);

      fireEvent.click(screen.getByTestId(`tab-${tabList[2].id}`));

      const tabs = screen.getAllByRole('tab');
      expect(tabs[0]).toHaveAttribute('aria-selected', 'false');
      expect(tabs[2]).toHaveAttribute('aria-selected', 'true');
    });

    it("invokes the consumer's per-tab onClick after activating the tab", () => {
      const tabOnClick = vi.fn(() => {
        // Selection has already happened by the time this executes.
        expect(tempTabManager.getState().activeId).toBe(tabList[1].id);
      });
      const tabWithClick: TabItem = { ...tabList[1], onClick: tabOnClick };
      const tempTabManager = new TabStateManager();
      tempTabManager.addTab(tabList[0]);
      tempTabManager.addTab(tabWithClick);
      tempTabManager.setActive(tabList[0].id);

      render(<TabList tabManager={tempTabManager} />);

      fireEvent.click(screen.getByTestId(`tab-${tabList[1].id}`));

      expect(tabOnClick).toHaveBeenCalledTimes(1);
    });

    it("invokes the consumer's per-tab onClick even when the tab is already active", () => {
      const tabOnClick = vi.fn();
      const tabWithClick: TabItem = { ...tabList[0], onClick: tabOnClick };
      const tempTabManager = new TabStateManager();
      tempTabManager.addTab(tabWithClick);
      tempTabManager.setActive(tabList[0].id);

      render(<TabList tabManager={tempTabManager} />);

      fireEvent.click(screen.getByTestId(`tab-${tabList[0].id}`));

      expect(tabOnClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Close Button', () => {
    it('removes the tab from the tabManager when its close button is clicked', () => {
      render(<TabList tabManager={tabManager} />);

      fireEvent.click(screen.getByTestId(`close-${tabList[1].id}`));

      expect(tabManager.getState().order).toEqual([
        tabList[0].id,
        tabList[2].id,
      ]);
    });

    it('fires onTabClose with the removed tab', () => {
      const onTabClose = vi.fn();
      render(<TabList tabManager={tabManager} onTabClose={onTabClose} />);

      fireEvent.click(screen.getByTestId(`close-${tabList[1].id}`));

      expect(onTabClose).toHaveBeenCalledTimes(1);
      expect(onTabClose).toHaveBeenCalledWith(tabList[1]);
    });

    it('clicking the close button does not also activate the tab', () => {
      const onTabClick = vi.fn();

      render(<TabList tabManager={tabManager} onTabClick={onTabClick} />);

      fireEvent.click(screen.getByTestId(`close-${tabList[1].id}`));

      expect(tabManager.getState().activeId).toBe(tabList[0].id);
      expect(onTabClick).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('activates the next tab on ArrowRight', () => {
      render(<TabList tabManager={tabManager} />);

      expect(tabManager.getState().activeId).toBe(tabList[0].id);

      fireEvent.keyDown(screen.getByTestId('tab-list-container'), {
        key: 'ArrowRight',
      });

      expect(tabManager.getState().activeId).toBe(tabList[1].id);
    });

    it('activates the previous tab on ArrowLeft', () => {
      tabManager.setActive(tabList[1].id);

      expect(tabManager.getState().activeId).toBe(tabList[1].id);

      render(<TabList tabManager={tabManager} />);

      fireEvent.keyDown(screen.getByTestId('tab-list-container'), {
        key: 'ArrowLeft',
      });

      expect(tabManager.getState().activeId).toBe(tabList[0].id);
    });

    it('jumps to the first tab on Home', () => {
      tabManager.setActive(tabList[2].id);

      render(<TabList tabManager={tabManager} />);

      fireEvent.keyDown(screen.getByTestId('tab-list-container'), {
        key: 'Home',
      });

      expect(tabManager.getState().activeId).toBe(tabList[0].id);
    });

    it('jumps to the last tab on End', () => {
      render(<TabList tabManager={tabManager} />);

      expect(tabManager.getState().activeId).toBe(tabList[0].id);

      fireEvent.keyDown(screen.getByTestId('tab-list-container'), {
        key: 'End',
      });

      expect(tabManager.getState().activeId).toBe(tabList[2].id);
    });

    it('fires onTabClick when a keyboard activation changes the tab', () => {
      const onTabClick = vi.fn();

      render(<TabList tabManager={tabManager} onTabClick={onTabClick} />);

      fireEvent.keyDown(screen.getByTestId('tab-list-container'), {
        key: 'ArrowRight',
      });

      expect(onTabClick).toHaveBeenCalledWith(tabList[1]);
    });

    it('ignores unrelated keys', () => {
      const onTabClick = vi.fn();

      render(<TabList tabManager={tabManager} onTabClick={onTabClick} />);

      expect(tabManager.getState().activeId).toBe(tabList[0].id);
      expect(onTabClick).not.toHaveBeenCalled();

      fireEvent.keyDown(screen.getByTestId('tab-list-container'), {
        key: 'a',
      });

      expect(tabManager.getState().activeId).toBe(tabList[0].id);
      expect(onTabClick).not.toHaveBeenCalled();
    });
  });

  describe('Drag and Drop', () => {
    it('marks each tab wrapper as draggable', () => {
      render(<TabList tabManager={tabManager} />);

      tabList.forEach((t) =>
        expect(screen.getByTestId(`tab-wrapper-${t.id}`)).toHaveAttribute(
          'draggable',
          'true',
        ),
      );
    });

    it('enters drag state on dragStart and applies the dragged style', () => {
      const dragManager = new DragStateManager();

      render(
        <TabList tabManager={tabManager} dragAndDropManager={dragManager} />,
      );

      fireEvent.dragStart(screen.getByTestId(`tab-wrapper-${tabList[1].id}`), {
        dataTransfer: mockDataTransfer(),
      });

      expect(dragManager.getState().draggedTab).toEqual(tabList[1]);

      const draggedTab = screen.getByTestId(`tab-${tabList[1].id}`);
      expect(draggedTab.className).toMatch(/tabDragged/);
    });

    it('fires onTabDrop when a tab is dropped on top of another tab', () => {
      const dragManager = new DragStateManager();
      const onTabDrop = vi.fn();

      render(
        <TabList
          tabManager={tabManager}
          paneId={paneId}
          dragAndDropManager={dragManager}
          onTabDrop={onTabDrop}
        />,
      );

      fireEvent.dragStart(screen.getByTestId(`tab-wrapper-${tabList[0].id}`), {
        dataTransfer: mockDataTransfer(),
      });

      const target = screen.getByTestId(`tab-wrapper-${tabList[2].id}`);
      stubBoundingRect(target);

      fireEvent.drop(target, {
        clientX: 80,
        dataTransfer: mockDataTransfer(),
      });

      expect(onTabDrop).toHaveBeenCalledTimes(1);
      expect(onTabDrop).toHaveBeenCalledWith({
        tab: tabList[0],
        sourcePaneId: paneId,
        targetPaneId: paneId,
        targetTab: tabList[2],
        side: 'right',
      });
    });

    it('fires onTabListDrop when a tab is dropped on empty list space', () => {
      const dragManager = new DragStateManager();
      const onTabListDrop = vi.fn();

      render(
        <TabList
          tabManager={tabManager}
          paneId={paneId}
          dragAndDropManager={dragManager}
          onTabListDrop={onTabListDrop}
        />,
      );

      fireEvent.dragStart(screen.getByTestId(`tab-wrapper-${tabList[0].id}`), {
        dataTransfer: mockDataTransfer(),
      });

      const container = screen.getByTestId('tab-list-container');
      fireEvent.drop(container, {
        target: container,
        dataTransfer: mockDataTransfer(),
      });

      expect(onTabListDrop).toHaveBeenCalledTimes(1);
      expect(onTabListDrop).toHaveBeenCalledWith({
        tab: tabList[0],
        sourcePaneId: paneId,
        targetPaneId: paneId,
      });
    });

    it('applies the drop-target class to the hovered tab during a drag', () => {
      const dragManager = new DragStateManager();

      render(
        <TabList tabManager={tabManager} dragAndDropManager={dragManager} />,
      );

      fireEvent.dragStart(screen.getByTestId(`tab-wrapper-${tabList[0].id}`), {
        dataTransfer: mockDataTransfer(),
      });

      const targetWrapper = screen.getByTestId(`tab-wrapper-${tabList[2].id}`);
      stubBoundingRect(targetWrapper);

      fireEvent.dragOver(targetWrapper, {
        clientX: 80,
        dataTransfer: mockDataTransfer(),
      });

      const hoveredTab = screen.getByTestId(`tab-${tabList[2].id}`);
      expect(hoveredTab.className).toMatch(/tabDropTarget/);
      expect(hoveredTab.className).toMatch(/dropRight/);
    });

    it('shares drag state across two TabLists with the same dragAndDropManager', () => {
      const dragManager = new DragStateManager();
      const secondTabManager = new TabStateManager();
      secondTabManager.addTab({ id: 10, label: 'Echo' });

      render(
        <>
          <TabList
            tabManager={tabManager}
            paneId={paneId}
            dragAndDropManager={dragManager}
          />
          <TabList
            tabManager={secondTabManager}
            paneId={secondPaneId}
            dragAndDropManager={dragManager}
          />
        </>,
      );

      const sourceWrapper = screen.getAllByTestId(
        `tab-wrapper-${tabList[0].id}`,
      )[0];
      fireEvent.dragStart(sourceWrapper, {
        dataTransfer: mockDataTransfer(),
      });

      expect(dragManager.getState().sourcePaneId).toBe(paneId);
      expect(dragManager.getState().draggedTab).toEqual(tabList[0]);
    });
  });

  describe('isScrollable', () => {
    it('wraps the list in a ScrollPane when isScrollable is true (default)', () => {
      render(<TabList tabManager={tabManager} />);

      const root = screen.getByTestId('tab-list');
      expect(within(root).getByTestId('scroll-pane')).toBeInTheDocument();
    });

    it('omits the ScrollPane when isScrollable is false', () => {
      render(<TabList tabManager={tabManager} isScrollable={false} />);

      const root = screen.getByTestId('tab-list');
      expect(within(root).queryByTestId('scroll-pane')).toBeNull();
      expect(
        within(root).getByTestId('tab-list-container'),
      ).toBeInTheDocument();
    });
  });

  describe('CustomTabComponent', () => {
    it('renders the provided custom tab component in place of the default Tab', () => {
      render(
        <TabList
          tabManager={tabManager}
          CustomTabComponent={createCustomTab()}
        />,
      );

      expect(
        screen.getByTestId(getCustomTabTestId(tabList[0].id)),
      ).toHaveTextContent(tabList[0].label);
      expect(screen.getAllByRole('tab')).toHaveLength(3);
    });

    it('passes the tabManager through to the custom tab component', () => {
      const tabManagerList: (TabStateManager | undefined)[] = [];
      const CustomTab = createCustomTab((props) => {
        tabManagerList.push(props.manager);
      });

      render(
        <TabList tabManager={tabManager} CustomTabComponent={CustomTab} />,
      );

      expect(tabManagerList.every((m) => m === tabManager)).toBe(true);
      expect(tabManagerList).toHaveLength(3);
    });

    it('does not pass tabManager to the default Tab component', () => {
      // The default Tab does not accept a `manager` prop. Confirm that TabList
      // doesn't leak the manager into the default tab.
      render(<TabList tabManager={tabManager} />);

      const tabList = screen.getAllByRole('tab');
      tabList.forEach((tab) => {
        expect(tab).not.toHaveAttribute('manager');
      });
    });
  });
});
