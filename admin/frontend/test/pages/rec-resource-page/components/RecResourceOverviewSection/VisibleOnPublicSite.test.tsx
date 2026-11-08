import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { VisibleOnPublicSite } from '@/pages/rec-resource-page/components/RecResourceOverviewSection/components/VisibleOnPublicSite';

// Mock only helper text and external assets/icons to avoid unneeded external dependencies
vi.mock('@/components', () => ({
  HelpIcon: ({ text }: { text: string }) => (
    <span data-testid="help-icon">{text}</span>
  ),
}));

vi.mock('@/utils/helperText', () => ({
  DISPLAY_ON_PUBLIC_SITE_TEXT: 'Helpful text about public visibility',
}));

describe('VisibleOnPublicSite Component', () => {
  it('renders correctly in view mode (isEditMode = false) with value = true', () => {
    render(<VisibleOnPublicSite value={true} />);

    // Check main title and help icon text
    expect(screen.getByText('Display on public site')).toBeInTheDocument();
    expect(screen.getByTestId('help-icon')).toHaveTextContent(
      'Helpful text about public visibility',
    );

    // Check pill badge state for visible
    const pill = screen.getByText('Visible on public site');
    expect(pill).toBeInTheDocument();
    expect(pill).toHaveClass('pill__visible');

    // Check edit mode radiogroup is NOT rendered
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
  });

  it('renders correctly in view mode with value = false', () => {
    render(<VisibleOnPublicSite value={false} />);

    // Check pill badge state for hidden
    const pill = screen.getByText('Not visible on public site');
    expect(pill).toBeInTheDocument();
    expect(pill).toHaveClass('pill__hidden');
  });

  it('renders edit mode when isEditMode = true and handles toggle actions', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();

    render(
      <VisibleOnPublicSite
        isEditMode={true}
        value={true}
        onChange={mockOnChange}
      />,
    );

    // Verify ToggleGroup radiogroup is rendered
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();

    // Click 'No' button
    const noButton = screen.getByRole('radio', { name: /no/i });
    await user.click(noButton);

    // Verify state updates and onChange prop is called with false
    expect(screen.getByText('Not visible on public site')).toBeInTheDocument();
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(false);
  });

  it('handles uncontrolled component updates when onChange is not provided', async () => {
    const user = userEvent.setup();

    // Render without passing onChange to cover optional chaining `onChange?.(!toggleState)`
    render(<VisibleOnPublicSite isEditMode={true} value={false} />);

    // Initial state is false
    expect(screen.getByText('Not visible on public site')).toBeInTheDocument();

    // Click 'Yes' button
    const yesButton = screen.getByRole('radio', { name: /yes/i });
    await user.click(yesButton);

    // Verify state toggled locally without throwing error
    expect(screen.getByText('Visible on public site')).toBeInTheDocument();
  });
});
