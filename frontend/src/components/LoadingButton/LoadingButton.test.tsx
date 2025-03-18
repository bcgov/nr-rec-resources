import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { LoadingButton } from '@/components/LoadingButton';

describe('LoadingButton', () => {
  it('renders children correctly', () => {
    render(<LoadingButton onClick={() => {}}>Test Button</LoadingButton>);
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<LoadingButton onClick={handleClick}>Click Me</LoadingButton>);

    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('only shows spinner when loading', () => {
    render(
      <LoadingButton onClick={() => {}} loading={true}>
        Loading Button
      </LoadingButton>,
    );

    expect(screen.getByTestId('loading-button')).not.toHaveTextContent(
      'Loading Button',
    );
    expect(
      screen.getByTestId('loading-button').querySelector('.spinner-border'),
    ).toBeInTheDocument();
  });

  it('applies custom className and variant', () => {
    render(
      <LoadingButton
        onClick={() => {}}
        className="custom-class"
        variant="primary"
      >
        Custom Button
      </LoadingButton>,
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
    expect(button).toHaveClass('btn-primary');
  });

  it('disables button when disabled prop is true', () => {
    render(
      <LoadingButton onClick={() => {}} disabled={true}>
        Disabled Button
      </LoadingButton>,
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});
