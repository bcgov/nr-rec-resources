import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ToggleGroup } from '@/pages/rec-resource-page/components/RecResourceOverviewSection/components/ToggleGroup';

describe('ToggleGroup Component', () => {
  it('renders correctly with a label and value set to true', () => {
    const mockOnChange = vi.fn();
    render(
      <ToggleGroup
        value={true}
        onChange={mockOnChange}
        label="Public Visibility"
      />,
    );

    // Check if the label is rendered
    expect(screen.getByText('Public Visibility')).toBeInTheDocument();

    // Check radiogroup aria-label matches the custom label
    const radiogroup = screen.getByRole('radiogroup');
    expect(radiogroup).toHaveAttribute('aria-label', 'Public Visibility');

    // Check checked states
    const yesButton = screen.getByRole('radio', { name: /yes/i });
    const noButton = screen.getByRole('radio', { name: /no/i });

    expect(yesButton).toHaveAttribute('aria-checked', 'true');
    expect(noButton).toHaveAttribute('aria-checked', 'false');
  });

  it('renders correctly without a label, using the fallback aria-label, and value set to false', () => {
    const mockOnChange = vi.fn();
    render(<ToggleGroup value={false} onChange={mockOnChange} />);

    // Check label is not rendered
    expect(screen.queryByText('Public Visibility')).not.toBeInTheDocument();

    // Check radiogroup uses fallback aria-label
    const radiogroup = screen.getByRole('radiogroup');
    expect(radiogroup).toHaveAttribute('aria-label', 'Display on public site');

    // Check checked states
    const yesButton = screen.getByRole('radio', { name: /yes/i });
    const noButton = screen.getByRole('radio', { name: /no/i });

    expect(yesButton).toHaveAttribute('aria-checked', 'false');
    expect(noButton).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onChange with true when the "Yes" button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    render(<ToggleGroup value={false} onChange={mockOnChange} />);

    const yesButton = screen.getByRole('radio', { name: /yes/i });
    await user.click(yesButton);

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(true);
  });

  it('calls onChange with false when the "No" button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    render(<ToggleGroup value={true} onChange={mockOnChange} />);

    const noButton = screen.getByRole('radio', { name: /no/i });
    await user.click(noButton);

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(false);
  });
});
