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
  MonthDayPicker: ({ name, label }: any) => (
    <div data-testid={`month-day-picker-${name}`}>{label}</div>
  ),
  SelectField: ({ name, label, options }: any) => (
    <div data-testid={`select-field-${name}`}>
      {label} - {options?.length || 0} options
    </div>
  ),
}));

vi.mock('react-hook-form', () => ({
  Controller: ({ name, render }: any) => {
    const field = {
      value: false,
      onChange: vi.fn(),
    };
    return <div data-testid={`controller-${name}`}>{render({ field })}</div>;
  },
}));

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/constants',
  () => ({
    DAYS: [
      { key: 'monday_ind', label: 'Monday' },
      { key: 'tuesday_ind', label: 'Tuesday' },
      { key: 'wednesday_ind', label: 'Wednesday' },
      { key: 'thursday_ind', label: 'Thursday' },
      { key: 'friday_ind', label: 'Friday' },
      { key: 'saturday_ind', label: 'Saturday' },
      { key: 'sunday_ind', label: 'Sunday' },
    ],
    DAY_PRESET_OPTIONS_LIST: [
      { id: 'all_days', label: 'All Days' },
      { id: 'weekdays', label: 'Weekdays' },
      { id: 'weekends', label: 'Weekends' },
    ],
  }),
);

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

  it('renders recurring fee checkbox', () => {
    render(
      <RecResourceFeeForm recResourceId="test-rec-resource-id" mode="create" />,
    );

    expect(
      screen.getByRole('checkbox', {
        name: /Fee is recurring\. Fee applies every year for the selected dates/i,
      }),
    ).toBeInTheDocument();
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

    expect(
      screen.getByTestId('month-day-picker-recurring_start_mmdd'),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('month-day-picker-recurring_end_mmdd'),
    ).toBeInTheDocument();
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

  it('disables submit button when options are loading', () => {
    vi.mocked(useFeeOptions).mockReturnValueOnce({
      options: [],
      isLoading: true,
    });

    render(
      <RecResourceFeeForm recResourceId="test-rec-resource-id" mode="create" />,
    );

    expect(screen.getByRole('button', { name: 'Add Fee' })).toBeDisabled();
  });

  it('renders error message for day selection validation', () => {
    vi.mocked(useFeeForm).mockReturnValueOnce({
      control: mockControl,
      handleSubmit: mockHandleSubmit,
      errors: {
        monday_ind: {
          message: 'At least one day must be selected',
        },
      },
      isDirty: false,
      mutation: { isPending: false },
      onSubmit: mockOnSubmit,
      feeApplies: FEE_APPLIES_OPTIONS.ALWAYS,
    } as any);

    render(
      <RecResourceFeeForm recResourceId="test-rec-resource-id" mode="create" />,
    );

    expect(
      screen.getByText('At least one day must be selected'),
    ).toBeInTheDocument();
  });
});

describe('RecResourceFeeForm (edit mode)', () => {
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

  it('shows Save Changes button text in edit mode', () => {
    render(
      <RecResourceFeeForm recResourceId="test-rec-resource-id" mode="edit" />,
    );

    expect(
      screen.getByRole('button', { name: 'Save Changes' }),
    ).toBeInTheDocument();
  });

  it('shows Saving... button text when mutation is pending in edit mode', () => {
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
      <RecResourceFeeForm recResourceId="test-rec-resource-id" mode="edit" />,
    );

    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('passes initialFee and onDone props to useFeeForm hook', () => {
    const mockOnDone = vi.fn();
    const mockInitialFee = {
      id: 'fee-1',
      recResourceId: 'rec-1',
      feeApplies: 'SPECIFIC_DATES',
      recreation_fee_code: 'D',
      fee_amount: 50,
    } as any;

    render(
      <RecResourceFeeForm
        recResourceId="test-rec-resource-id"
        mode="edit"
        initialFee={mockInitialFee}
        onDone={mockOnDone}
      />,
    );

    expect(vi.mocked(useFeeForm)).toHaveBeenCalledWith({
      recResourceId: 'test-rec-resource-id',
      mode: 'edit',
      initialFee: mockInitialFee,
      onDone: mockOnDone,
    });
  });
});

describe('RecResourceFeeForm (recurring fee behavior)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not disable day preset when fee is recurring', () => {
    vi.mocked(useFeeForm).mockReturnValue({
      control: mockControl,
      handleSubmit: mockHandleSubmit,
      errors: {},
      isDirty: false,
      mutation: { isPending: false },
      onSubmit: mockOnSubmit,
      feeApplies: FEE_APPLIES_OPTIONS.SPECIFIC_DATES,
    } as any);
    vi.mocked(useFeeOptions).mockReturnValue({
      options: [{ id: 'D', label: 'Day use' }],
      isLoading: false,
    });

    render(
      <RecResourceFeeForm recResourceId="test-rec-resource-id" mode="create" />,
    );

    expect(screen.getByTestId('select-field-day_preset')).toBeInTheDocument();
  });

  it('does not disable day checkboxes when fee is recurring', () => {
    vi.mocked(useFeeForm).mockReturnValue({
      control: mockControl,
      handleSubmit: mockHandleSubmit,
      errors: {},
      isDirty: false,
      mutation: { isPending: false },
      onSubmit: mockOnSubmit,
      feeApplies: FEE_APPLIES_OPTIONS.SPECIFIC_DATES,
    } as any);
    vi.mocked(useFeeOptions).mockReturnValue({
      options: [{ id: 'D', label: 'Day use' }],
      isLoading: false,
    });

    render(
      <RecResourceFeeForm recResourceId="test-rec-resource-id" mode="create" />,
    );

    expect(screen.getByText('Monday')).toBeInTheDocument();
    expect(screen.getByText('Sunday')).toBeInTheDocument();
  });
});
