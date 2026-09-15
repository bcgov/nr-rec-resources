import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CopyButton } from '@shared/components/copy-button';

describe('CopyButton', () => {
  beforeEach(() => {
    // Ensure navigator.clipboard exists in jsdom
    if (!navigator.clipboard) {
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: () => Promise.resolve() },
        writable: true,
        configurable: true,
      });
    }
  });

  it('should render string text and copy icon', () => {
    render(<CopyButton text="test" />);

    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByTestId('copy-button')).toBeInTheDocument();
  });

  it('should render ReactNode elements correctly', () => {
    render(
      <CopyButton
        text={
          <>
            Line 1<br />
            Line 2
          </>
        }
      />,
    );

    expect(screen.getByText(/Line 1/)).toBeInTheDocument();
    expect(screen.getByText(/Line 2/)).toBeInTheDocument();
  });

  it('should copy string text to clipboard when clicked', async () => {
    const spy = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValue(undefined);

    render(<CopyButton text="test string" />);

    const button = screen.getByTestId('copy-button');
    fireEvent.click(button);

    expect(spy).toHaveBeenCalledWith('test string');
    spy.mockRestore();
  });

  it('should convert ReactNode with <br /> into newlines when copying to clipboard', async () => {
    const spy = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValue(undefined);

    render(
      <CopyButton
        text={
          <>
            123 Main St, Vancouver
            <br />
            BC
          </>
        }
      />,
    );

    const button = screen.getByTestId('copy-button');
    fireEvent.click(button);

    expect(spy).toHaveBeenCalledWith('123 Main St, Vancouver\nBC');
    spy.mockRestore();
  });

  it('should have accessible button attributes', () => {
    render(<CopyButton text="test" />);

    const button = screen.getByTestId('copy-button');
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('aria-label', 'Copy to clipboard');
  });
});
