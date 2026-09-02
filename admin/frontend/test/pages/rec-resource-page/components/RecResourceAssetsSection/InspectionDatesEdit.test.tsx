import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { InspectionDatesEdit } from '@/pages/rec-resource-page/components/RecResourceAssetsSection/InspectionDatesEdit';
import type { InspectionDatesEditProps } from '@/pages/rec-resource-page/components/RecResourceAssetsSection/InspectionDatesEdit';

const defaultProps: InspectionDatesEditProps = {
  currentInspectionDate: null,
  currentDangerTreeDate: null,
  inspectionDate: '',
  dangerTreeDate: '',
  isSaving: false,
  onInspectionDateChange: vi.fn(),
  onDangerTreeDateChange: vi.fn(),
  onSave: vi.fn(),
  onCancel: vi.fn(),
};

describe('InspectionDatesEdit', () => {
  it('renders the "Record inspection dates" heading', () => {
    render(<InspectionDatesEdit {...defaultProps} />);
    expect(screen.getByText('Record inspection dates')).toBeInTheDocument();
  });

  it('renders Save and Cancel buttons', () => {
    render(<InspectionDatesEdit {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('shows "Saving…" on the Save button when isSaving is true', () => {
    render(<InspectionDatesEdit {...defaultProps} isSaving={true} />);
    expect(screen.getByRole('button', { name: 'Saving…' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Save' }),
    ).not.toBeInTheDocument();
  });

  it('disables both buttons when isSaving is true', () => {
    render(<InspectionDatesEdit {...defaultProps} isSaving={true} />);
    expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  });

  it('calls onCancel when Cancel is clicked', async () => {
    const onCancel = vi.fn();
    render(<InspectionDatesEdit {...defaultProps} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('calls onSave when Save is clicked', async () => {
    const onSave = vi.fn();
    render(<InspectionDatesEdit {...defaultProps} onSave={onSave} />);
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledOnce();
  });

  it('renders the inspection date input with correct aria-label', () => {
    render(<InspectionDatesEdit {...defaultProps} />);
    expect(
      screen.getByLabelText('Date of last resource inspection'),
    ).toBeInTheDocument();
  });

  it('renders the danger tree date input with correct aria-label', () => {
    render(<InspectionDatesEdit {...defaultProps} />);
    expect(
      screen.getByLabelText('Date of last danger tree inspection'),
    ).toBeInTheDocument();
  });

  it('shows the current inspection date when provided', () => {
    render(
      <InspectionDatesEdit
        {...defaultProps}
        currentInspectionDate={new Date('2024-06-15')}
      />,
    );
    expect(
      screen.getByText(/Jun(e|\.?)[\s,]+15[\s,]+2024/i),
    ).toBeInTheDocument();
  });

  it('shows "No inspection recorded" when currentInspectionDate is null', () => {
    render(
      <InspectionDatesEdit {...defaultProps} currentInspectionDate={null} />,
    );
    const noInspection = screen.getAllByText(
      (_, element) =>
        element?.textContent?.includes('No inspection recorded') ?? false,
    );
    expect(noInspection.length).toBeGreaterThanOrEqual(1);
  });

  it('shows "No inspection recorded" when currentDangerTreeDate is null', () => {
    render(
      <InspectionDatesEdit {...defaultProps} currentDangerTreeDate={null} />,
    );
    const noInspection = screen.getAllByText(
      (_, element) =>
        element?.textContent?.includes('No inspection recorded') ?? false,
    );
    expect(noInspection.length).toBeGreaterThanOrEqual(1);
  });

  it('reflects controlled inspectionDate value in the input', () => {
    render(
      <InspectionDatesEdit {...defaultProps} inspectionDate="2024-06-15" />,
    );
    const input = screen.getByLabelText('Date of last resource inspection');
    expect(input).toHaveValue('2024-06-15');
  });

  it('reflects controlled dangerTreeDate value in the input', () => {
    render(
      <InspectionDatesEdit {...defaultProps} dangerTreeDate="2024-08-20" />,
    );
    const input = screen.getByLabelText('Date of last danger tree inspection');
    expect(input).toHaveValue('2024-08-20');
  });

  it('calls onInspectionDateChange when inspection date input changes', async () => {
    const onInspectionDateChange = vi.fn();
    render(
      <InspectionDatesEdit
        {...defaultProps}
        onInspectionDateChange={onInspectionDateChange}
      />,
    );
    const input = screen.getByLabelText('Date of last resource inspection');
    await userEvent.type(input, '2025-01-01');
    expect(onInspectionDateChange).toHaveBeenCalled();
  });

  it('calls onDangerTreeDateChange when danger tree date input changes', async () => {
    const onDangerTreeDateChange = vi.fn();
    render(
      <InspectionDatesEdit
        {...defaultProps}
        onDangerTreeDateChange={onDangerTreeDateChange}
      />,
    );
    const input = screen.getByLabelText('Date of last danger tree inspection');
    await userEvent.type(input, '2025-03-01');
    expect(onDangerTreeDateChange).toHaveBeenCalled();
  });

  it('renders resource inspection icon', () => {
    render(<InspectionDatesEdit {...defaultProps} />);
    expect(screen.getByAltText('Resource inspection icon')).toBeInTheDocument();
  });

  it('renders danger tree assessment icon', () => {
    render(<InspectionDatesEdit {...defaultProps} />);
    expect(
      screen.getByAltText('Danger tree assessment icon'),
    ).toBeInTheDocument();
  });
});
