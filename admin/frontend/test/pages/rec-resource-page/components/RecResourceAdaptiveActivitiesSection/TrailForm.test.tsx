import { TrailForm } from '@/pages/rec-resource-page/components/RecResourceAdaptiveActivitiesSection/TrailForm';
import { useTrailForm } from '@/pages/rec-resource-page/components/RecResourceAdaptiveActivitiesSection/hooks/useTrailForm';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceAdaptiveActivitiesSection/hooks/useTrailForm',
);

vi.mock('@/components/form', () => ({
  SelectField: ({ label, name }: any) => (
    <div data-testid={`select-${name}`}>{label}</div>
  ),
}));

vi.mock('react-hook-form', () => ({
  Controller: ({ render: renderFn }: any) =>
    renderFn({
      field: { value: '', onChange: vi.fn(), onBlur: vi.fn(), ref: vi.fn() },
    }),
}));

describe('TrailForm', () => {
  const mockHandleSubmit = vi.fn((fn) => async (e: any) => {
    e?.preventDefault?.();
    fn({});
  });
  const mockOnSubmit = vi.fn();
  const mockOnDone = vi.fn();

  const defaultProps = {
    recResourceId: 'REC0001',
    activityCode: 34,
    mode: 'create' as const,
    onDone: mockOnDone,
  };

  const idleMutation = { isPending: false } as any;
  const pendingMutation = { isPending: true } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useTrailForm).mockReturnValue({
      control: {} as any,
      handleSubmit: mockHandleSubmit,
      errors: {},
      isDirty: true,
      mutation: idleMutation,
      onSubmit: mockOnSubmit,
    });
  });

  it('renders trail name field', () => {
    render(<TrailForm {...defaultProps} />);
    expect(screen.getByLabelText(/Trail name/i)).toBeInTheDocument();
  });

  it('renders difficulty select field', () => {
    render(<TrailForm {...defaultProps} />);
    expect(screen.getByTestId('select-trail_type')).toBeInTheDocument();
  });

  it('renders description textarea', () => {
    render(<TrailForm {...defaultProps} />);
    expect(
      screen.getByPlaceholderText(/Describe the trail/i),
    ).toBeInTheDocument();
  });

  it('shows "Add trail" button in create mode when idle', () => {
    render(<TrailForm {...defaultProps} mode="create" />);
    expect(
      screen.getByRole('button', { name: 'Add trail' }),
    ).toBeInTheDocument();
  });

  it('shows "Save changes" button in edit mode when idle', () => {
    render(<TrailForm {...defaultProps} mode="edit" />);
    expect(
      screen.getByRole('button', { name: 'Save changes' }),
    ).toBeInTheDocument();
  });

  it('shows "Adding trail..." when create mutation is pending', () => {
    vi.mocked(useTrailForm).mockReturnValue({
      control: {} as any,
      handleSubmit: mockHandleSubmit,
      errors: {},
      isDirty: true,
      mutation: pendingMutation,
      onSubmit: mockOnSubmit,
    });

    render(<TrailForm {...defaultProps} mode="create" />);
    expect(
      screen.getByRole('button', { name: 'Adding trail...' }),
    ).toBeInTheDocument();
  });

  it('shows "Saving..." when edit mutation is pending', () => {
    vi.mocked(useTrailForm).mockReturnValue({
      control: {} as any,
      handleSubmit: mockHandleSubmit,
      errors: {},
      isDirty: true,
      mutation: pendingMutation,
      onSubmit: mockOnSubmit,
    });

    render(<TrailForm {...defaultProps} mode="edit" />);
    expect(
      screen.getByRole('button', { name: 'Saving...' }),
    ).toBeInTheDocument();
  });

  it('disables submit button when form is not dirty', () => {
    vi.mocked(useTrailForm).mockReturnValue({
      control: {} as any,
      handleSubmit: mockHandleSubmit,
      errors: {},
      isDirty: false,
      mutation: idleMutation,
      onSubmit: mockOnSubmit,
    });

    render(<TrailForm {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Add trail' })).toBeDisabled();
  });

  it('disables submit button when mutation is pending', () => {
    vi.mocked(useTrailForm).mockReturnValue({
      control: {} as any,
      handleSubmit: mockHandleSubmit,
      errors: {},
      isDirty: true,
      mutation: pendingMutation,
      onSubmit: mockOnSubmit,
    });

    render(<TrailForm {...defaultProps} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('enables submit button when form is dirty and not pending', () => {
    render(<TrailForm {...defaultProps} />);
    expect(
      screen.getByRole('button', { name: 'Add trail' }),
    ).not.toBeDisabled();
  });

  it('calls onSubmit when form is submitted', async () => {
    render(<TrailForm {...defaultProps} />);

    const button = screen.getByRole('button', { name: 'Add trail' });
    await userEvent.click(button);

    expect(mockHandleSubmit).toHaveBeenCalled();
  });

  it('shows name validation error when present', () => {
    vi.mocked(useTrailForm).mockReturnValue({
      control: {} as any,
      handleSubmit: mockHandleSubmit,
      errors: { name: { message: 'Trail name is required', type: 'min' } },
      isDirty: false,
      mutation: idleMutation,
      onSubmit: mockOnSubmit,
    });

    render(<TrailForm {...defaultProps} />);
    expect(screen.getByText('Trail name is required')).toBeInTheDocument();
  });
});
