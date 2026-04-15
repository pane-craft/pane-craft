/* eslint-disable no-console */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { Tab, type TabProps } from './Tab';

describe('Tab Component', () => {
  const defaultProps: TabProps = {
    id: 123,
    label: 'My Label',
  };
  const closeBtnRoleData = { name: /close/i };

  // Rendering ----------------------------------------------------------------
  it('renders the label correctly', () => {
    const { container } = render(<Tab {...defaultProps} />);

    expect(screen.getByText(defaultProps.label)).toBeInTheDocument();
    expect(container.firstChild).not.toHaveClass('tabActive');
  });

  it('sets the title attribute to the label', () => {
    const { container } = render(<Tab {...defaultProps} />);

    expect(container.firstChild).toHaveAttribute('title', defaultProps.label);
  });

  it('sets the data-tab-id attribute to the id', () => {
    const { container } = render(<Tab {...defaultProps} />);

    expect(container.firstChild).toHaveAttribute(
      'data-tab-id',
      String(defaultProps.id),
    );
  });

  it('forwards a custom className onto the root element', () => {
    const { container } = render(
      <Tab {...defaultProps} className="myCustomClass" />,
    );

    expect(container.firstChild).toHaveClass('myCustomClass');
  });

  it('sets default ARIA properties', () => {
    const { container } = render(<Tab {...defaultProps} />);

    const root = container.firstChild as HTMLElement;
    expect(root).toHaveAttribute('role', 'tab');
    expect(root).toHaveAttribute('aria-selected', 'false');
    expect(root).toHaveAttribute('tabIndex', '-1');
  });

  // Active state -------------------------------------------------------------
  it('applies the active class when isActive is true', () => {
    const { container } = render(<Tab {...defaultProps} isActive />);

    expect(container.firstChild).toHaveClass('tabActive');
  });

  it('does not apply the active class when isActive is false', () => {
    const { container } = render(<Tab {...defaultProps} isActive={false} />);

    expect(container.firstChild).not.toHaveClass('tabActive');
  });

  it('sets default ARIA properties specific to the active tab', () => {
    const { container } = render(<Tab {...defaultProps} isActive />);

    const root = container.firstChild as HTMLElement;
    expect(root).toHaveAttribute('role', 'tab');
    expect(root).toHaveAttribute('aria-selected', 'true');
    expect(root).toHaveAttribute('tabIndex', '0');
  });

  // Drag state ---------------------------------------------------------------
  it('applies the dragged class when isDragged is true', () => {
    const { container } = render(<Tab {...defaultProps} isDragged />);

    expect(container.firstChild).toHaveClass('tabDragged');
  });

  it('does not apply the dragged class when isDragged is false', () => {
    const { container } = render(<Tab {...defaultProps} isDragged={false} />);

    expect(container.firstChild).not.toHaveClass('tabDragged');
  });

  // Drop target state --------------------------------------------------------
  it('applies correct drop target classes for left side', () => {
    const { container } = render(
      <Tab {...defaultProps} dropTargetSide="left" />,
    );

    expect(container.firstChild).toHaveClass('tabDropTarget', 'dropLeft');
    expect(container.firstChild).not.toHaveClass('dropRight');
  });

  it('applies correct drop target classes for right side', () => {
    const { container } = render(
      <Tab {...defaultProps} dropTargetSide="right" />,
    );

    expect(container.firstChild).toHaveClass('tabDropTarget', 'dropRight');
    expect(container.firstChild).not.toHaveClass('dropLeft');
  });

  it('does not apply drop target classes when dropTargetSide is null', () => {
    const { container } = render(
      <Tab {...defaultProps} dropTargetSide={null} />,
    );

    expect(container.firstChild).not.toHaveClass(
      'tabDropTarget',
      'dropLeft',
      'dropRight',
    );
  });

  // Close button -------------------------------------------------------------
  it('renders a close button with an aria-label containing the tab label', () => {
    render(<Tab {...defaultProps} isCloseable onClose={vi.fn()} />);

    const closeButton = screen.getByRole('button', closeBtnRoleData);
    expect(closeButton).toBeInTheDocument();
    expect(closeButton).toHaveAttribute(
      'aria-label',
      `Close ${defaultProps.label}`,
    );
  });

  it('calls onClose with the tab id when the close button is clicked', () => {
    const onClose = vi.fn();

    render(<Tab {...defaultProps} isCloseable onClose={onClose} />);

    expect(onClose).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', closeBtnRoleData));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledWith(defaultProps.id);
  });

  it('gracefully closes the tab when the close button is clicked without an onClose handler', () => {
    render(<Tab {...defaultProps} isCloseable />);

    expect(() =>
      fireEvent.click(screen.getByRole('button', closeBtnRoleData)),
    ).not.toThrow();
  });

  it('does not render a close button when isCloseable is false', () => {
    render(<Tab {...defaultProps} isCloseable={false} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders a close button when isCloseable is not provided (defaults to true)', () => {
    render(<Tab {...defaultProps} />);

    expect(screen.getByRole('button', closeBtnRoleData)).toBeInTheDocument();
  });

  it('stops event propagation when the close button is clicked', () => {
    const onParentClick = vi.fn();
    const onClose = vi.fn();

    render(
      <div
        role="button"
        tabIndex={-1}
        onClick={onParentClick}
        onKeyDown={() => {
          console.log('Will not get called.');
        }}
      >
        <Tab {...defaultProps} isCloseable onClose={onClose} />
      </div>,
    );

    fireEvent.click(screen.getByRole('button', closeBtnRoleData));

    expect(onClose).toHaveBeenCalled();
    expect(onParentClick).not.toHaveBeenCalled();
  });

  // Accessibility (a11y prop) ------------------------------------------------
  it('forwards a11y props to the root element', () => {
    const { container } = render(
      <Tab {...defaultProps} a11y={{ 'aria-label': 'test-label' }} />,
    );

    const root = container.firstChild as HTMLElement;
    expect(root).toHaveAttribute('role', 'tab');
    expect(root).toHaveAttribute('aria-selected', 'false');
    expect(root).toHaveAttribute('tabIndex', '-1');
    expect(root).toHaveAttribute('aria-label', 'test-label');
  });

  it('overrides default a11y props (role, aria-selected, tabIndex) on the root element', () => {
    const { container } = render(
      <Tab {...defaultProps} isActive a11y={{ tabIndex: 1 }} />,
    );

    const root = container.firstChild as HTMLElement;
    expect(root).toHaveAttribute('role', 'tab');
    expect(root).toHaveAttribute('aria-selected', 'true');
    expect(root).toHaveAttribute('tabIndex', '1');
  });
});
