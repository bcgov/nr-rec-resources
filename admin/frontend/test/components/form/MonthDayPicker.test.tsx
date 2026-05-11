import { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'react-bootstrap';
import { Control, FieldErrors, FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';
import { MonthDayPicker } from '@/components';
import { MonthDayPickerProps } from '@/components/form/MonthDayPicker';

type TestForm = { dateField: string };

const Wrapper = ({
  children,
  defaultValue = '',
}: {
  children: (
    control: Control<TestForm>,
    errors: FieldErrors<TestForm>,
  ) => ReactNode;
  defaultValue?: string;
}) => {
  const methods = useForm<TestForm>({
    defaultValues: { dateField: defaultValue },
  });
  return (
    <FormProvider {...methods}>
      <Form>{children(methods.control, methods.formState.errors)}</Form>
    </FormProvider>
  );
};

const defaultProps: Omit<
  MonthDayPickerProps<TestForm>,
  'control' | 'errors'
> = {
  name: 'dateField',
  label: 'Select Date',
};

const renderPicker = (defaultValue = '') =>
  render(
    <Wrapper defaultValue={defaultValue}>
      {(control, errors) => (
        <MonthDayPicker {...defaultProps} control={control} errors={errors} />
      )}
    </Wrapper>,
  );

const getSelects = () => screen.getAllByRole('combobox') as HTMLSelectElement[];

describe('MonthDayPicker', () => {
  it('renders month and day selects with correct aria-labels', () => {
    renderPicker();
    const [monthSelect, daySelect] = getSelects();
    expect(monthSelect).toHaveAttribute('aria-label', 'Select Date month');
    expect(daySelect).toHaveAttribute('aria-label', 'Select Date day');
  });

  it('renders all 12 months plus placeholder', () => {
    renderPicker();
    const [monthSelect] = getSelects();
    expect(monthSelect.options).toHaveLength(13);
    expect(monthSelect.options[0]).toHaveTextContent('Month');
    expect(monthSelect.options[1]).toHaveTextContent('January');
    expect(monthSelect.options[12]).toHaveTextContent('December');
  });

  it('disables day select until month is chosen', () => {
    renderPicker();
    expect(getSelects()[1]).toBeDisabled();
  });

  it('enables day select and shows correct day count after month selection', async () => {
    const user = userEvent.setup();
    renderPicker();
    const [monthSelect, daySelect] = getSelects();

    await user.selectOptions(monthSelect, '01'); // January = 31 days
    expect(daySelect).not.toBeDisabled();
    expect(daySelect.options).toHaveLength(32); // 31 + placeholder

    await user.selectOptions(monthSelect, '02'); // February = 29 days
    expect(daySelect.options).toHaveLength(30); // 29 + placeholder

    await user.selectOptions(monthSelect, '04'); // April = 30 days
    expect(daySelect.options).toHaveLength(31); // 30 + placeholder
  });

  it('clears day when switching to a month with fewer days', async () => {
    const user = userEvent.setup();
    renderPicker('01-31');
    const [monthSelect, daySelect] = getSelects();

    expect(daySelect).toHaveValue('31');
    await user.selectOptions(monthSelect, '02'); // Feb has no day 31
    expect(daySelect).toHaveValue('');
  });

  it('retains day when switching to a month that still has that day', async () => {
    const user = userEvent.setup();
    renderPicker('01-20');
    const [monthSelect, daySelect] = getSelects();

    await user.selectOptions(monthSelect, '04'); // April has 30 days, day 20 is valid
    expect(daySelect).toHaveValue('20');
  });

  it('clears both selects when month is cleared', async () => {
    const user = userEvent.setup();
    renderPicker('03-15');
    const [monthSelect, daySelect] = getSelects();

    await user.selectOptions(monthSelect, '');
    expect(monthSelect).toHaveValue('');
    expect(daySelect).toHaveValue('');
  });

  it('stores value as MM-DD with zero-padding', async () => {
    const user = userEvent.setup();
    renderPicker();
    const [monthSelect, daySelect] = getSelects();

    await user.selectOptions(monthSelect, '02');
    await user.selectOptions(daySelect, '05');
    expect(monthSelect).toHaveValue('02');
    expect(daySelect).toHaveValue('05');
  });

  it('initializes correctly from a default MM-DD value', () => {
    renderPicker('07-25');
    const [monthSelect, daySelect] = getSelects();
    expect(monthSelect).toHaveValue('07');
    expect(daySelect).toHaveValue('25');
  });

  it('handles incomplete value (month only, no day)', () => {
    renderPicker('03-');
    const [monthSelect, daySelect] = getSelects();
    expect(monthSelect).toHaveValue('03');
    expect(daySelect).toHaveValue('');
  });

  it('shows required asterisk when required=true', () => {
    render(
      <Wrapper>
        {(control, errors) => (
          <MonthDayPicker
            {...defaultProps}
            control={control}
            errors={errors}
            required
          />
        )}
      </Wrapper>,
    );
    expect(screen.getByText('Select Date *')).toBeInTheDocument();
  });

  it('shows validation error message and marks selects invalid', () => {
    render(
      <Wrapper>
        {(control) => (
          <MonthDayPicker
            {...defaultProps}
            control={control}
            errors={{
              dateField: { message: 'Date is required', type: 'required' },
            }}
          />
        )}
      </Wrapper>,
    );
    expect(screen.getByText('Date is required')).toBeInTheDocument();
    getSelects().forEach((select) => expect(select).toHaveClass('is-invalid'));
  });

  it('allows selecting February 29 for leap year support', async () => {
    const user = userEvent.setup();
    renderPicker();
    const [monthSelect, daySelect] = getSelects();

    await user.selectOptions(monthSelect, '02');
    await user.selectOptions(daySelect, '29');
    expect(daySelect).toHaveValue('29');
  });
});
