import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SidebarTooltip from '@/components/sidebar/SidebarToolTip';

// Mock React-Bootstrap to cleanly assert on our specific component logic
vi.mock('react-bootstrap', () => {
  return {
    OverlayTrigger: ({ children, overlay, placement }: any) => (
      <div data-testid="mock-overlay-trigger" data-placement={placement}>
        {/* Render the overlay inside the tree so we can verify its content and attributes */}
        <div data-testid="mock-overlay-container">{overlay}</div>
        {children}
      </div>
    ),
    Tooltip: ({ children, id }: any) => (
      <div role="tooltip" id={id}>
        {children}
      </div>
    ),
  };
});

describe('SidebarTooltip Component', () => {
  const defaultProps = {
    text: 'Search Tooltip',
    isCollapsed: true,
  };

  const TestChild = () => (
    <button data-testid="child-element">Search Icon</button>
  );

  // Branch 1: !isCollapsed (Should only render children, skipping the overlay completely)
  it('renders only the child component and no tooltip wrapper when isCollapsed is false', () => {
    render(
      <SidebarTooltip {...defaultProps} isCollapsed={false}>
        <TestChild />
      </SidebarTooltip>,
    );

    // Child must be present
    expect(screen.getByTestId('child-element')).toBeInTheDocument();

    // The overlay wrapper and tooltip text should not exist anywhere in the DOM tree
    expect(
      screen.queryByTestId('mock-overlay-trigger'),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Search Tooltip')).not.toBeInTheDocument();
  });

  // Branch 2: isCollapsed is true (Should trigger overlay wrapper with default placement)
  it('renders the overlay trigger wrapper with the correct text and default placement when isCollapsed is true', () => {
    render(
      <SidebarTooltip {...defaultProps} isCollapsed={true}>
        <TestChild />
      </SidebarTooltip>,
    );

    // Child must be present
    expect(screen.getByTestId('child-element')).toBeInTheDocument();

    // Verify OverlayTrigger container structure and default placement attributes are hit
    const triggerContainer = screen.getByTestId('mock-overlay-trigger');
    expect(triggerContainer).toBeInTheDocument();
    expect(triggerContainer).toHaveAttribute('data-placement', 'right');

    // Tooltip must be loaded in the render tree immediately with correct content
    const tooltipElement = screen.getByRole('tooltip');
    expect(tooltipElement).toHaveAttribute('id', 'tooltip-right');
    expect(screen.getByText('Search Tooltip')).toBeInTheDocument();
  });

  // Branch 3: Custom placement configuration
  it('respects and applies the custom placement prop when it is supplied', () => {
    render(
      <SidebarTooltip {...defaultProps} isCollapsed={true} placement="bottom">
        <TestChild />
      </SidebarTooltip>,
    );

    // Verify Custom Placement string falls back or updates correctly
    const triggerContainer = screen.getByTestId('mock-overlay-trigger');
    expect(triggerContainer).toHaveAttribute('data-placement', 'bottom');

    const tooltipElement = screen.getByRole('tooltip');
    expect(tooltipElement).toHaveAttribute('id', 'tooltip-bottom');
  });
});
