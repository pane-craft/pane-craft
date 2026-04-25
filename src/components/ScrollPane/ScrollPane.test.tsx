import { render, screen, fireEvent, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ScrollPane, type ScrollPaneProps } from './ScrollPane';

/**
 * Installs a `ResizeObserver` stub and fixed geometry so overflow detection
 * is deterministic in a `happy-dom` environment.
 *
 * @param params - Viewport/content sizes in pixels along the primary axis.
 */
const stubGeometry = ({
  viewportSize,
  contentSize,
  orientation,
}: {
  viewportSize: number;
  contentSize: number;
  orientation: 'horizontal' | 'vertical';
}) => {
  class StubResizeObserver {
    observe() {
      /* stub method */
    }
    unobserve() {
      /* stub method */
    }
    disconnect() {
      /* stub method */
    }
  }
  (
    globalThis as unknown as { ResizeObserver: typeof ResizeObserver }
  ).ResizeObserver = StubResizeObserver as unknown as typeof ResizeObserver;

  const isHorizontal = orientation === 'horizontal';

  const matches = (element: unknown, testId: string): boolean =>
    element instanceof HTMLElement &&
    element.getAttribute('data-testid') === testId;

  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get(this: HTMLElement) {
      return matches(this, 'scroll-pane-viewport') && isHorizontal
        ? viewportSize
        : 0;
    },
  });
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    configurable: true,
    get(this: HTMLElement) {
      return matches(this, 'scroll-pane-viewport') && !isHorizontal
        ? viewportSize
        : 0;
    },
  });
  Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
    configurable: true,
    get(this: HTMLElement) {
      return matches(this, 'scroll-pane-content') && isHorizontal
        ? contentSize
        : 0;
    },
  });
  Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
    configurable: true,
    get(this: HTMLElement) {
      return matches(this, 'scroll-pane-content') && !isHorizontal
        ? contentSize
        : 0;
    },
  });
};

describe('ScrollPane Component', () => {
  const defaultProps: ScrollPaneProps = {
    children: <div style={{ width: 400 }}>content</div>,
  };

  beforeEach(() => {
    stubGeometry({
      viewportSize: 100,
      contentSize: 400,
      orientation: 'horizontal',
    });
  });

  // Rendering ----------------------------------------------------------------
  it('renders the children inside the content wrapper', () => {
    render(<ScrollPane {...defaultProps} />);

    expect(screen.getByText('content')).toBeInTheDocument();
    expect(screen.getByTestId('scroll-pane-content')).toContainElement(
      screen.getByText('content'),
    );
  });

  it('forwards a custom className onto the root element', () => {
    render(<ScrollPane {...defaultProps} className="myCustomClass" />);

    expect(screen.getByTestId('scroll-pane')).toHaveClass('myCustomClass');
  });

  it('exposes the orientation via a data attribute', () => {
    render(<ScrollPane {...defaultProps} orientation="vertical" />);

    expect(screen.getByTestId('scroll-pane')).toHaveAttribute(
      'data-orientation',
      'vertical',
    );
  });

  it('defaults to horizontal orientation', () => {
    render(<ScrollPane {...defaultProps} />);

    expect(screen.getByTestId('scroll-pane')).toHaveAttribute(
      'data-orientation',
      'horizontal',
    );
  });

  it('applies the horizontal viewport class for horizontal orientation', () => {
    render(<ScrollPane {...defaultProps} orientation="horizontal" />);

    expect(screen.getByTestId('scroll-pane-viewport')).toHaveClass(
      'viewportHorizontal',
    );
  });

  it('applies the vertical viewport class for vertical orientation', () => {
    stubGeometry({
      viewportSize: 100,
      contentSize: 400,
      orientation: 'vertical',
    });
    render(<ScrollPane {...defaultProps} orientation="vertical" />);

    expect(screen.getByTestId('scroll-pane-viewport')).toHaveClass(
      'viewportVertical',
    );
  });

  // Overflow & scrollbar visibility ------------------------------------------
  it('renders the track when content overflows the viewport', () => {
    render(<ScrollPane {...defaultProps} />);

    expect(screen.getByTestId('scroll-pane-track')).toBeInTheDocument();
    expect(screen.getByTestId('scroll-pane-thumb')).toBeInTheDocument();
  });

  it('does not render the track when content fits inside the viewport', () => {
    stubGeometry({
      viewportSize: 500,
      contentSize: 100,
      orientation: 'horizontal',
    });
    render(<ScrollPane {...defaultProps} />);

    expect(screen.queryByTestId('scroll-pane-track')).not.toBeInTheDocument();
    expect(screen.queryByTestId('scroll-pane-thumb')).not.toBeInTheDocument();
  });

  it('hides the scrollbar by default and reveals it on pointer enter', () => {
    render(<ScrollPane {...defaultProps} />);

    const track = screen.getByTestId('scroll-pane-track');
    expect(track).not.toHaveClass('trackVisible');

    fireEvent.mouseEnter(screen.getByTestId('scroll-pane'));
    expect(track).toHaveClass('trackVisible');

    fireEvent.mouseLeave(screen.getByTestId('scroll-pane'));
    expect(track).not.toHaveClass('trackVisible');
  });

  it('keeps the scrollbar visible when autoHide is false', () => {
    render(<ScrollPane {...defaultProps} autoHide={false} />);

    expect(screen.getByTestId('scroll-pane-track')).toHaveClass('trackVisible');
  });

  // Thumb drag interaction ---------------------------------------------------
  it('drags the thumb with the mouse to update the scroll offset', () => {
    render(<ScrollPane {...defaultProps} />);

    const thumb = screen.getByTestId('scroll-pane-thumb');
    const viewport = screen.getByTestId('scroll-pane-viewport');

    fireEvent.mouseDown(thumb, { clientX: 0, clientY: 0 });
    fireEvent(
      document,
      new MouseEvent('mousemove', { clientX: 20, clientY: 0 }),
    );
    fireEvent(document, new MouseEvent('mouseup'));

    expect(viewport.scrollLeft).toBeGreaterThan(0);
  });

  it('stops event propagation on thumb mouse down', () => {
    const onParentMouseDown = vi.fn();

    render(
      <div role="presentation" onMouseDown={onParentMouseDown}>
        <ScrollPane {...defaultProps} />
      </div>,
    );

    fireEvent.mouseDown(screen.getByTestId('scroll-pane-thumb'), {
      clientX: 0,
      clientY: 0,
    });
    fireEvent(document, new MouseEvent('mouseup'));

    expect(onParentMouseDown).not.toHaveBeenCalled();
  });

  // Track click interaction --------------------------------------------------
  it('scrolls when the user clicks the track (jump mode)', () => {
    render(<ScrollPane {...defaultProps} trackClickMode="jump" />);

    const track = screen.getByTestId('scroll-pane-track');
    const viewport = screen.getByTestId('scroll-pane-viewport');

    Object.defineProperty(track, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        left: 0,
        top: 0,
        width: 100,
        height: 10,
        right: 100,
        bottom: 10,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }),
    });

    fireEvent.click(track, { clientX: 80, clientY: 5, target: track });

    expect(viewport.scrollLeft).toBeGreaterThan(0);
  });

  it('ignores track clicks that originated on the thumb', () => {
    render(<ScrollPane {...defaultProps} />);

    const track = screen.getByTestId('scroll-pane-track');
    const thumb = screen.getByTestId('scroll-pane-thumb');
    const viewport = screen.getByTestId('scroll-pane-viewport');

    fireEvent.click(thumb, { clientX: 50, clientY: 5 });

    expect(viewport.scrollLeft).toBe(0);
    expect(track).toBeInTheDocument();
  });

  // a11y ---------------------------------------------------------------------
  it('forwards a11y attributes to the root element', () => {
    render(
      <ScrollPane
        {...defaultProps}
        a11y={{ role: 'region', 'aria-label': 'Tabs' }}
      />,
    );

    const root = screen.getByTestId('scroll-pane');
    expect(root).toHaveAttribute('role', 'region');
    expect(root).toHaveAttribute('aria-label', 'Tabs');
  });

  // Scroll sync --------------------------------------------------------------
  it('syncs thumb position when the viewport is scrolled natively', () => {
    render(<ScrollPane {...defaultProps} />);

    const viewport = screen.getByTestId('scroll-pane-viewport');
    const thumb = screen.getByTestId('scroll-pane-thumb');
    const initialTransform = thumb.style.transform;

    act(() => {
      viewport.scrollLeft = 100;
      fireEvent.scroll(viewport);
    });

    expect(thumb.style.transform).not.toBe(initialTransform);
  });
});
