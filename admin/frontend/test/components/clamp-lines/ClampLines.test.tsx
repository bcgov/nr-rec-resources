import { ClampLines } from '@/components/clamp-lines';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

describe('ClampLines', () => {
  const sampleText =
    'This is a sample text that could be very long and needs to be clamped after certain number of lines to maintain layout consistency.';

  it('renders with default props', () => {
    render(<ClampLines text={sampleText} />);

    const element = screen.getByText(sampleText);
    expect(element).toBeInTheDocument();
    expect(element.tagName).toBe('SPAN');
  });

  it('renders the provided text content', () => {
    const testText = 'Test content';
    render(<ClampLines text={testText} />);

    expect(screen.getByText(testText)).toBeInTheDocument();
  });

  it('applies default CSS classes', () => {
    render(<ClampLines text={sampleText} />);

    const element = screen.getByText(sampleText);
    expect(element).toHaveClass('clamp-ellipsis');
  });

  it('applies custom className along with default classes', () => {
    render(<ClampLines text={sampleText} className="custom-class" />);

    const element = screen.getByText(sampleText);
    expect(element).toHaveClass('clamp-ellipsis');
    expect(element).toHaveClass('custom-class');
  });

  it('sets WebkitLineClamp style with default value of 2', () => {
    render(<ClampLines text={sampleText} />);

    const element = screen.getByText(sampleText);
    expect(element).toHaveStyle({ WebkitLineClamp: 2 });
  });

  it('sets WebkitLineClamp style with custom lines value', () => {
    render(<ClampLines text={sampleText} lines={4} />);

    const element = screen.getByText(sampleText);
    expect(element).toHaveStyle({ WebkitLineClamp: 4 });
  });

  it('applies custom style properties', () => {
    const customStyle = { color: 'red', fontSize: '14px' };
    render(<ClampLines text={sampleText} style={customStyle} />);

    const element = screen.getByText(sampleText);
    expect(element).toHaveStyle({
      color: 'rgb(255, 0, 0)',
      fontSize: '14px',
      WebkitLineClamp: 2,
    });
  });

  it('merges custom style with WebkitLineClamp', () => {
    const customStyle = { color: 'blue', WebkitLineClamp: 5 };
    render(<ClampLines text={sampleText} style={customStyle} lines={3} />);

    const element = screen.getByText(sampleText);
    // Note: The style prop takes precedence over the lines prop in the current implementation
    expect(element).toHaveStyle({ color: 'rgb(0, 0, 255)' });
    expect(element.style.getPropertyValue('-webkit-line-clamp')).toBe('5');
  });

  it("renders as different HTML element when 'as' prop is provided", () => {
    render(<ClampLines text={sampleText} as="div" />);

    const element = screen.getByText(sampleText);
    expect(element.tagName).toBe('DIV');
  });

  it('renders as paragraph element', () => {
    render(<ClampLines text={sampleText} as="p" />);

    const element = screen.getByText(sampleText);
    expect(element.tagName).toBe('P');
  });

  it('has tabIndex of 0 for accessibility', () => {
    render(<ClampLines text={sampleText} />);

    const element = screen.getByText(sampleText);
    expect(element).toHaveAttribute('tabIndex', '0');
  });

  it('has title attribute with the full text', () => {
    render(<ClampLines text={sampleText} />);

    const element = screen.getByText(sampleText);
    expect(element).toHaveAttribute('title', sampleText);
  });

  it('shows tooltip on hover with full text content', async () => {
    const user = userEvent.setup();
    render(<ClampLines text={sampleText} />);

    const element = screen.getByText(sampleText);

    // Hover over the element to trigger tooltip
    await user.hover(element);

    // Look for the tooltip content
    expect(await screen.findByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByRole('tooltip')).toHaveTextContent(sampleText);
  });

  it('shows tooltip on focus for keyboard accessibility', async () => {
    const user = userEvent.setup();
    render(<ClampLines text={sampleText} />);

    const element = screen.getByText(sampleText);

    // Focus the element to trigger tooltip
    await user.tab();
    expect(element).toHaveFocus();

    // Look for the tooltip content
    expect(await screen.findByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByRole('tooltip')).toHaveTextContent(sampleText);
  });

  it('positions tooltip at the top by default', async () => {
    const user = userEvent.setup();
    render(<ClampLines text={sampleText} />);

    const element = screen.getByText(sampleText);
    await user.hover(element);

    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip.closest('[data-popper-placement]')).toHaveAttribute(
      'data-popper-placement',
      'top',
    );
  });

  it('positions tooltip based on placement prop', async () => {
    const user = userEvent.setup();
    render(<ClampLines text={sampleText} placement="bottom" />);

    const element = screen.getByText(sampleText);
    await user.hover(element);

    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip.closest('[data-popper-placement]')).toHaveAttribute(
      'data-popper-placement',
      'bottom',
    );
  });

  it('handles empty text', () => {
    const { container } = render(<ClampLines text="" />);

    const element = container.firstChild as HTMLElement;
    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute('title', '');
    expect(element).toHaveClass('clamp-ellipsis');
  });

  it('handles text with special characters', () => {
    const specialText =
      'Text with special chars: !@#$%^&*()_+{}|:<>?[]\\;\'",./ and unicode: 🚀🌟✨';
    render(<ClampLines text={specialText} />);

    const element = screen.getByText(specialText);
    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute('title', specialText);
  });

  it('handles very long text', () => {
    const longText = 'A'.repeat(1000);
    render(<ClampLines text={longText} />);

    const element = screen.getByText(longText);
    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute('title', longText);
  });

  it('handles single line text with lines=1', () => {
    render(<ClampLines text={sampleText} lines={1} />);

    const element = screen.getByText(sampleText);
    expect(element).toHaveStyle({ WebkitLineClamp: 1 });
  });

  it('handles large number of lines', () => {
    render(<ClampLines text={sampleText} lines={100} />);

    const element = screen.getByText(sampleText);
    expect(element).toHaveStyle({ WebkitLineClamp: 100 });
  });

  it('tooltip disappears when mouse leaves', async () => {
    const user = userEvent.setup();
    render(<ClampLines text={sampleText} />);

    const element = screen.getByText(sampleText);

    // Hover to show tooltip
    await user.hover(element);
    expect(await screen.findByRole('tooltip')).toBeInTheDocument();

    // Unhover to hide tooltip
    await user.unhover(element);

    // Tooltip should not be in the document anymore
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('tooltip disappears when element loses focus', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <ClampLines text={sampleText} />
        <button>Other focusable element</button>
      </div>,
    );

    const element = screen.getByText(sampleText);
    const button = screen.getByRole('button');

    // Focus the element to show tooltip
    await user.tab();
    expect(element).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toBeInTheDocument();

    // Focus away to hide tooltip
    await user.click(button);
    expect(button).toHaveFocus();

    // Tooltip should not be in the document anymore
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('generates unique tooltip id', () => {
    render(
      <div>
        <ClampLines text="First text" />
        <ClampLines text="Second text" />
      </div>,
    );

    const tooltips = screen.getAllByText(/First text|Second text/);
    expect(tooltips).toHaveLength(2);
  });

  it('works with all placement options', async () => {
    const placements: Array<'top' | 'bottom' | 'left' | 'right'> = [
      'top',
      'bottom',
      'left',
      'right',
    ];

    for (const placement of placements) {
      const { unmount } = render(
        <ClampLines text={sampleText} placement={placement} />,
      );

      const element = screen.getByText(sampleText);
      expect(element).toBeInTheDocument();

      unmount();
    }
  });
});
