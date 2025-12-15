import { AddFees } from '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/AddFees';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { FEE_APPLIES_OPTIONS } from '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/schemas/addFee';
import { useAddFeeForm } from '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/hooks/useAddFeeForm';
import { useFeeOptions } from '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/hooks/useFeeOptions';

const mockControl = { _mock: 'control' };
const mockHandleSubmit = vi.fn((fn) => fn);
const mockOnSubmit = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  useParams: vi.fn(() => ({
    id: 'test-rec-resource-id',
  })),
}));

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/hooks/useAddFeeForm',
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

describe('AddFees', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAddFeeForm).mockReturnValue({
      control: mockControl,
      handleSubmit: mockHandleSubmit,
      errors: {},
      isDirty: false,
      createMutation: { isPending: false },
      onSubmit: mockOnSubmit,
      feeApplies: FEE_APPLIES_OPTIONS.ALWAYS,
      setValue: vi.fn(),
    } as any);
    vi.mocked(useFeeOptions).mockReturnValue({
      options: [
        { id: 'D', label: 'Day use' },
        { id: 'C', label: 'Camping' },
      ],
      isLoading: false,
    });
  });

  it('renders Add new Fee heading', () => {
    render(<AddFees />);

    expect(screen.getByText('Add new Fee')).toBeInTheDocument();
  });

  it('renders Fee Applies dropdown', () => {
    render(<AddFees />);

    expect(screen.getByTestId('select-field-fee_applies')).toBeInTheDocument();
    expect(screen.getByText(/Fee Applies/)).toBeInTheDocument();
  });

  it('renders Day Presets dropdown', () => {
    render(<AddFees />);

    expect(screen.getByTestId('select-field-day_preset')).toBeInTheDocument();
    expect(screen.getByText(/Day Presets/)).toBeInTheDocument();
  });

  it('renders all day checkboxes', () => {
    render(<AddFees />);

    expect(screen.getByText('Monday')).toBeInTheDocument();
    expect(screen.getByText('Tuesday')).toBeInTheDocument();
    expect(screen.getByText('Wednesday')).toBeInTheDocument();
    expect(screen.getByText('Thursday')).toBeInTheDocument();
    expect(screen.getByText('Friday')).toBeInTheDocument();
    expect(screen.getByText('Saturday')).toBeInTheDocument();
    expect(screen.getByText('Sunday')).toBeInTheDocument();
  });

  it('renders Fee Type dropdown with options from useFeeOptions', () => {
    render(<AddFees />);

    const feeTypeField = screen.getByTestId('select-field-recreation_fee_code');
    expect(feeTypeField).toBeInTheDocument();
    expect(feeTypeField).toHaveTextContent('2 options');
  });

  it('renders Amount field', () => {
    render(<AddFees />);

    expect(screen.getByTestId('currency-field-fee_amount')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
  });

  it('renders Add Fee button', () => {
    render(<AddFees />);

    expect(screen.getByRole('button', { name: 'Add Fee' })).toBeInTheDocument();
  });

  it('does not render date fields when fee applies always', () => {
    vi.mocked(useAddFeeForm).mockReturnValueOnce({
      control: mockControl,
      handleSubmit: mockHandleSubmit,
      errors: {},
      isDirty: false,
      createMutation: { isPending: false },
      onSubmit: mockOnSubmit,
      feeApplies: FEE_APPLIES_OPTIONS.ALWAYS,
      setValue: vi.fn(),
    } as any);

    render(<AddFees />);

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
    vi.mocked(useAddFeeForm).mockReturnValueOnce({
      control: mockControl,
      handleSubmit: mockHandleSubmit,
      errors: {},
      isDirty: false,
      createMutation: { isPending: false },
      onSubmit: mockOnSubmit,
      feeApplies: FEE_APPLIES_OPTIONS.SPECIFIC_DATES,
      setValue: vi.fn(),
    } as any);

    render(<AddFees />);

    expect(screen.getByTestId('date-field-fee_start_date')).toBeInTheDocument();
    expect(screen.getByTestId('date-field-fee_end_date')).toBeInTheDocument();
    expect(screen.getByText('Recurring Fee (Yearly)')).toBeInTheDocument();
  });

  it('disables submit button when form is not dirty', () => {
    vi.mocked(useAddFeeForm).mockReturnValueOnce({
      control: mockControl,
      handleSubmit: mockHandleSubmit,
      errors: {},
      isDirty: false,
      createMutation: { isPending: false },
      onSubmit: mockOnSubmit,
      feeApplies: FEE_APPLIES_OPTIONS.ALWAYS,
      setValue: vi.fn(),
    } as any);

    render(<AddFees />);

    expect(screen.getByRole('button', { name: 'Add Fee' })).toBeDisabled();
  });

  it('disables submit button when mutation is pending', () => {
    vi.mocked(useAddFeeForm).mockReturnValueOnce({
      control: mockControl,
      handleSubmit: mockHandleSubmit,
      errors: {},
      isDirty: true,
      createMutation: { isPending: true },
      onSubmit: mockOnSubmit,
      feeApplies: FEE_APPLIES_OPTIONS.ALWAYS,
      setValue: vi.fn(),
    } as any);

    render(<AddFees />);

    expect(
      screen.getByRole('button', { name: 'Adding Fee...' }),
    ).toBeDisabled();
  });

  it('enables submit button when form is dirty and not pending', () => {
    vi.mocked(useAddFeeForm).mockReturnValueOnce({
      control: mockControl,
      handleSubmit: mockHandleSubmit,
      errors: {},
      isDirty: true,
      createMutation: { isPending: false },
      onSubmit: mockOnSubmit,
      feeApplies: FEE_APPLIES_OPTIONS.ALWAYS,
      setValue: vi.fn(),
    } as any);

    render(<AddFees />);

    expect(screen.getByRole('button', { name: 'Add Fee' })).not.toBeDisabled();
  });

  it('shows button text as Adding Fee... when mutation is pending', () => {
    vi.mocked(useAddFeeForm).mockReturnValueOnce({
      control: mockControl,
      handleSubmit: mockHandleSubmit,
      errors: {},
      isDirty: true,
      createMutation: { isPending: true },
      onSubmit: mockOnSubmit,
      feeApplies: FEE_APPLIES_OPTIONS.ALWAYS,
      setValue: vi.fn(),
    } as any);

    render(<AddFees />);

    expect(screen.getByText('Adding Fee...')).toBeInTheDocument();
  });
});
