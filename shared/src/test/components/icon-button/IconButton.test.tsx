import { render, screen } from '@testing-library/react';
import { IconButton } from '@shared/components/icon-button';
import { describe, it, expect, vi } from 'vitest';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';

describe('IconButton', () => {
  it('renders with text and icons', () => {
    render(
      <IconButton
        leftIcon={<FontAwesomeIcon icon={faPlus} data-testid="left-icon" />}
        rightIcon={<FontAwesomeIcon icon={faMinus} data-testid="right-icon" />}
      >
        Click me
      </IconButton>,
    );

    expect(screen.getByText('Click me')).toBeInTheDocument();
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('applies custom classes and props', () => {
    const onClick = vi.fn();
    render(
      <IconButton
        className="custom-class"
        variant="primary"
        size="lg"
        onClick={onClick}
        data-testid="test-button"
      >
        Test
      </IconButton>,
    );

    const button = screen.getByTestId('test-button');
    expect(button).toHaveClass('custom-btn custom-class');
    expect(button).toHaveClass('btn-primary btn-lg');

    button.click();
    expect(onClick).toHaveBeenCalled();
  });

  it('handles icon positioning', () => {
    const { container } = render(
      <IconButton leftIcon={<span>L</span>} rightIcon={<span>R</span>}>
        Center
      </IconButton>,
    );

    const stack = container.querySelector('.custom-btn__stack');
    const [leftIcon, content, rightIcon] = Array.from(stack?.children || []);

    expect(leftIcon).toHaveClass('custom-btn__icon custom-btn__icon--left');
    expect(content).toHaveClass('custom-btn__content flex-grow-1');
    expect(rightIcon).toHaveClass(
      'custom-btn__icon custom-btn__icon--right ms-auto',
    );
  });

  it('renders without children', () => {
    render(<IconButton leftIcon={<span>Icon</span>} aria-label="Action" />);
    expect(screen.getByLabelText('Action')).toBeInTheDocument();
    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
  });

  it('maintains accessibility attributes', () => {
    render(
      <IconButton
        aria-label="Important action"
        disabled
        data-testid="test-button"
      >
        Submit
      </IconButton>,
    );

    const button = screen.getByTestId('test-button');
    expect(button).toHaveAttribute('aria-label', 'Important action');
    expect(button).toBeDisabled();
  });
});
