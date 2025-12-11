import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { CopyButton } from '@shared/components/copy-button';

describe('CopyButton', () => {
  it('should render text and copy icon', () => {
    render(<CopyButton text="test" />);

    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByTestId('copy-button')).toBeInTheDocument();
  });

  it('should render as a button that can be clicked', async () => {
    const user = userEvent.setup();
    render(<CopyButton text="test" />);

    const button = screen.getByTestId('copy-button');
    expect(button).toBeInTheDocument();

    await user.click(button);
    expect(button).not.toBeDisabled();
  });

  it('should have accessible button attributes', () => {
    render(<CopyButton text="test" />);

    const button = screen.getByTestId('copy-button');
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('aria-label', 'Copy to clipboard');
  });
});
