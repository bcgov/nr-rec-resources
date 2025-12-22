import { RecResourceFeeForm } from '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/RecResourceFeeForm';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { FEE_APPLIES_OPTIONS } from '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/schemas/addFee';
import { useFeeForm } from '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/hooks/useFeeForm';
import { useFeeOptions } from '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/hooks/useFeeOptions';

const mockControl = { _mock: 'control' };
const mockHandleSubmit = vi.fn((fn) => fn);
const mockOnSubmit = vi.fn();

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/hooks/useFeeForm',
);
vi.mock(
  '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/hooks/useFeeOptions',
);

vi.mock('@/components/form', () => ({
  CurrencyInputField: ({ name, label }: any) => (
    <div data-testid={`currency-field-${name}`}>{label}</div>
  ),
  DateInputField: ({ name, label }: any) => (
    <div data-testid={`date-field-${name}`}>{label}</div>
  ),
  SelectField: ({ name, label, options }: any) => (
    <div data-testid={`select-field-${name}`}>
      {label} - {options?.length || 0} options
    </div>
  ),
}));

vi.mock('react-hook-form', () => ({
  Controller: ({ name, render }: any) => {
    const field = { value: false, onChange: vi.fn() };
    return <div data-testid={`controller-${name}`}>{render({ field })}</div>;
  },
}));

describe('RecResourceFeeFormFields (create)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useFeeForm).mockReturnValue({
      control: mockControl,
      handleSubmit: mockHandleSubmit,
      errors: {},
      isDirty: false,
      mutation: { isPending: false },
      onSubmit: mockOnSubmit,
      feeApplies: FEE_APPLIES_OPTIONS.ALWAYS,
    } as any);
    vi.mocked(useFeeOptions).mockReturnValue({
      options: [
        { id: 'D', label: 'Day use' },
        { id: 'C', label: 'Camping' },
      ],
      isLoading: false,
    });
  });

  it('renders Fee Applies dropdown', () => {
    render(
      <RecResourceFeeForm recResourceId="test-rec-resource-id" mode="create" />,
    );

    expect(screen.getByTestId('select-field-fee_applies')).toBeInTheDocument();
    expect(screen.getByText(/Fee Applies/)).toBeInTheDocument();
  });

  it('renders Day Presets dropdown', () => {
    render(
      <RecResourceFeeForm recResourceId="test-rec-resource-id" mode="create" />,
    );

    expect(screen.getByTestId('select-field-day_preset')).toBeInTheDocument();
    expect(screen.getByText(/Day Presets/)).toBeInTheDocument();
  });

  it('renders all day checkboxes', () => {
    render(
      <RecResourceFeeForm recResourceId="test-rec-resource-id" mode="create" />,
    );

    expect(screen.getByText('Monday')).toBeInTheDocument();
    expect(screen.getByText('Tuesday')).toBeInTheDocument();
    expect(screen.getByText('Wednesday')).toBeInTheDocument();
    expect(screen.getByText('Thursday')).toBeInTheDocument();
    expect(screen.getByText('Friday')).toBeInTheDocument();
    expect(screen.getByText('Saturday')).toBeInTheDocument();
    expect(screen.getByText('Sunday')).toBeInTheDocument();
  });

  it('renders Fee Type dropdown with options from useFeeOptions', () => {
    render(
      <RecResourceFeeForm recResourceId="test-rec-resource-id" mode="create" />,
    );

    const feeTypeField = screen.getByTestId('select-field-recreation_fee_code');
    expect(feeTypeField).toBeInTheDocument();
    expect(feeTypeField).toHaveTextContent('2 options');
  });

  it('renders Amount field', () => {
    render(
      <RecResourceFeeForm recResourceId="test-rec-resource-id" mode="create" />,
    );

    expect(screen.getByTestId('currency-field-fee_amount')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
  });

  it('renders Add Fee button', () => {
    render(
      <RecResourceFeeForm recResourceId="test-rec-resource-id" mode="create" />,
    );

    expect(screen.getByRole('button', { name: 'Add Fee' })).toBeInTheDocument();
  });

  it('does not render date fields when fee applies always', () => {
    vi.mocked(useFeeForm).mockReturnValueOnce({
      control: mockControl,
      handleSubmit: mockHandleSubmit,
      errors: {},
      isDirty: false,
      mutation: { isPending: false },
      onSubmit: mockOnSubmit,
      feeApplies: FEE_APPLIES_OPTIONS.ALWAYS,
    } as any);

    render(
      <RecResourceFeeForm recResourceId="test-rec-resource-id" mode="create" />,
    );

    expect(
      screen.queryByTestId('date-field-fee_start_date'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('date-field-fee_end_date'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Recurring Fee (Yearly)'),
    ).not.toBeInTheDocument();
  });

  it('renders date fields when fee applies for specific dates', () => {
    vi.mocked(useFeeForm).mockReturnValueOnce({
      control: mockControl,
      handleSubmit: mockHandleSubmit,
      errors: {},
      isDirty: false,
      mutation: { isPending: false },
      onSubmit: mockOnSubmit,
      feeApplies: FEE_APPLIES_OPTIONS.SPECIFIC_DATES,
    } as any);

    render(
      <RecResourceFeeForm recResourceId="test-rec-resource-id" mode="create" />,
    );

    expect(screen.getByTestId('date-field-fee_start_date')).toBeInTheDocument();
    expect(screen.getByTestId('date-field-fee_end_date')).toBeInTheDocument();
    expect(screen.getByText('Recurring Fee (Yearly)')).toBeInTheDocument();
  });

  it('disables submit button when form is not dirty', () => {
    vi.mocked(useFeeForm).mockReturnValueOnce({
      control: mockControl,
      handleSubmit: mockHandleSubmit,
      errors: {},
      isDirty: false,
      mutation: { isPending: false },
      onSubmit: mockOnSubmit,
      feeApplies: FEE_APPLIES_OPTIONS.ALWAYS,
    } as any);

    render(
      <RecResourceFeeForm recResourceId="test-rec-resource-id" mode="create" />,
    );

    expect(screen.getByRole('button', { name: 'Add Fee' })).toBeDisabled();
  });

  it('disables submit button when mutation is pending', () => {
    vi.mocked(useFeeForm).mockReturnValueOnce({
      control: mockControl,
      handleSubmit: mockHandleSubmit,
      errors: {},
      isDirty: true,
      mutation: { isPending: true },
      onSubmit: mockOnSubmit,
      feeApplies: FEE_APPLIES_OPTIONS.ALWAYS,
    } as any);

    render(
      <RecResourceFeeForm recResourceId="test-rec-resource-id" mode="create" />,
    );

    expect(
      screen.getByRole('button', { name: 'Adding Fee...' }),
    ).toBeDisabled();
  });

  it('enables submit button when form is dirty and not pending', () => {
    vi.mocked(useFeeForm).mockReturnValueOnce({
      control: mockControl,
      handleSubmit: mockHandleSubmit,
      errors: {},
      isDirty: true,
      mutation: { isPending: false },
      onSubmit: mockOnSubmit,
      feeApplies: FEE_APPLIES_OPTIONS.ALWAYS,
    } as any);

    render(
      <RecResourceFeeForm recResourceId="test-rec-resource-id" mode="create" />,
    );

    expect(screen.getByRole('button', { name: 'Add Fee' })).not.toBeDisabled();
  });

  it('shows button text as Adding Fee... when mutation is pending', () => {
    vi.mocked(useFeeForm).mockReturnValueOnce({
      control: mockControl,
      handleSubmit: mockHandleSubmit,
      errors: {},
      isDirty: true,
      mutation: { isPending: true },
      onSubmit: mockOnSubmit,
      feeApplies: FEE_APPLIES_OPTIONS.ALWAYS,
    } as any);

    render(
      <RecResourceFeeForm recResourceId="test-rec-resource-id" mode="create" />,
    );

    expect(screen.getByText('Adding Fee...')).toBeInTheDocument();
  });
});
