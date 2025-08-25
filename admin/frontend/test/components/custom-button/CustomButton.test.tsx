import { CustomButton } from '@/components/custom-button';
import { faHome, faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe('CustomButton', () => {
  it('renders button with text content', () => {
    render(<CustomButton>Click me</CustomButton>);

    expect(
      screen.getByRole('button', { name: 'Click me' }),
    ).toBeInTheDocument();
  });

  it('applies custom className along with default classes', () => {
    render(<CustomButton className="my-custom-class">Test</CustomButton>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-btn');
    expect(button).toHaveClass('my-custom-class');
  });

  it('passes through all bootstrap button props', () => {
    const handleClick = vi.fn();
    render(
      <CustomButton
        variant="primary"
        size="lg"
        disabled={true}
        onClick={handleClick}
      >
        Test Button
      </CustomButton>,
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn-primary');
    expect(button).toHaveClass('btn-lg');
    expect(button).toBeDisabled();
  });

  it('renders left icon when provided', () => {
    render(
      <CustomButton
        leftIcon={<FontAwesomeIcon icon={faHome} data-testid="left-icon" />}
      >
        Home
      </CustomButton>,
    );

    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('renders right icon when provided', () => {
    render(
      <CustomButton
        rightIcon={<FontAwesomeIcon icon={faSearch} data-testid="right-icon" />}
      >
        Search
      </CustomButton>,
    );

    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('renders both left and right icons when provided', () => {
    render(
      <CustomButton
        leftIcon={<FontAwesomeIcon icon={faHome} data-testid="left-icon" />}
        rightIcon={<FontAwesomeIcon icon={faSearch} data-testid="right-icon" />}
      >
        Both Icons
      </CustomButton>,
    );

    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    expect(screen.getByText('Both Icons')).toBeInTheDocument();
  });

  it('handles click events correctly', () => {
    const handleClick = vi.fn();
    render(<CustomButton onClick={handleClick}>Clickable</CustomButton>);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders without icons when none provided', () => {
    render(<CustomButton>No Icons</CustomButton>);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(screen.getByText('No Icons')).toBeInTheDocument();

    // Check that no icon containers are rendered
    expect(button.querySelector('.custom-btn__icon--left')).toBeNull();
    expect(button.querySelector('.custom-btn__icon--right')).toBeNull();
  });

  it('applies correct CSS classes for icon positioning', () => {
    render(
      <CustomButton
        leftIcon={<span data-testid="left">L</span>}
        rightIcon={<span data-testid="right">R</span>}
      >
        Content
      </CustomButton>,
    );

    const leftIconContainer = screen.getByTestId('left').parentElement;
    const rightIconContainer = screen.getByTestId('right').parentElement;

    expect(leftIconContainer).toHaveClass('custom-btn__icon--left');
    expect(rightIconContainer).toHaveClass('custom-btn__icon--right');
  });

  it('renders complex content correctly', () => {
    render(
      <CustomButton>
        <span>Complex</span> <strong>Content</strong>
      </CustomButton>,
    );

    expect(screen.getByText('Complex')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('supports different button variants', () => {
    const { rerender } = render(
      <CustomButton variant="danger">Danger</CustomButton>,
    );
    expect(screen.getByRole('button')).toHaveClass('btn-danger');

    rerender(<CustomButton variant="success">Success</CustomButton>);
    expect(screen.getByRole('button')).toHaveClass('btn-success');

    rerender(<CustomButton variant="outline-primary">Outline</CustomButton>);
    expect(screen.getByRole('button')).toHaveClass('btn-outline-primary');
  });
});
