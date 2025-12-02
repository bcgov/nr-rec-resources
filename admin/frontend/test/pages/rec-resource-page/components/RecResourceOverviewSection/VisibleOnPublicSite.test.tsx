import { VisibleOnPublicSite } from '@/pages/rec-resource-page/components/RecResourceOverviewSection/components/VisibleOnPublicSite';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('VisibleOnPublicSite', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with visible state', () => {
    render(<VisibleOnPublicSite value={true} />);

    expect(screen.getByText('Displayed on public site')).toBeInTheDocument();
    expect(
      screen.getByText('Yes - visible on public site'),
    ).toBeInTheDocument();
  });

  it('renders with hidden state', () => {
    render(<VisibleOnPublicSite value={false} />);

    expect(screen.getByText('Displayed on public site')).toBeInTheDocument();
    expect(
      screen.getByText(/No - not visible on public site/),
    ).toBeInTheDocument();
  });

  it('does not show toggle in read-only mode', () => {
    render(<VisibleOnPublicSite value={false} isEditMode={false} />);

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('shows toggle in edit mode', () => {
    render(
      <VisibleOnPublicSite
        value={false}
        isEditMode={true}
        onChange={mockOnChange}
      />,
    );

    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('shows checked state when value is true', () => {
    render(
      <VisibleOnPublicSite
        value={true}
        isEditMode={true}
        onChange={mockOnChange}
      />,
    );

    const switchElement = screen.getByRole('checkbox') as HTMLInputElement;
    expect(switchElement.checked).toBe(true);
  });

  it('shows unchecked state when value is false', () => {
    render(
      <VisibleOnPublicSite
        value={false}
        isEditMode={true}
        onChange={mockOnChange}
      />,
    );

    const switchElement = screen.getByRole('checkbox') as HTMLInputElement;
    expect(switchElement.checked).toBe(false);
  });

  it('calls onChange with true when toggled on', async () => {
    const user = userEvent.setup();
    render(
      <VisibleOnPublicSite
        value={false}
        isEditMode={true}
        onChange={mockOnChange}
      />,
    );

    const switchElement = screen.getByRole('checkbox');
    await user.click(switchElement);

    expect(mockOnChange).toHaveBeenCalledWith(true);
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('calls onChange with false when toggled off', async () => {
    const user = userEvent.setup();
    render(
      <VisibleOnPublicSite
        value={true}
        isEditMode={true}
        onChange={mockOnChange}
      />,
    );

    const switchElement = screen.getByRole('checkbox');
    await user.click(switchElement);

    expect(mockOnChange).toHaveBeenCalledWith(false);
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('does not call onChange when onChange is not provided', async () => {
    const user = userEvent.setup();
    render(<VisibleOnPublicSite value={false} isEditMode={true} />);

    const switchElement = screen.getByRole('checkbox');
    await user.click(switchElement);

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('displays eye icon when visible', () => {
    const { container } = render(<VisibleOnPublicSite value={true} />);

    const icon = container.querySelector('.fa-eye');
    expect(icon).toBeInTheDocument();
  });

  it('displays eye-slash icon when hidden', () => {
    const { container } = render(<VisibleOnPublicSite value={false} />);

    const icon = container.querySelector('.fa-eye-slash');
    expect(icon).toBeInTheDocument();
  });
});
