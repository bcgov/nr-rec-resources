import { CurrencyInputField } from '@/components/form';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'react-bootstrap';
import { FormProvider, useForm } from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual('react-hook-form');
  return {
    ...actual,
    useFormContext: vi.fn(() => ({
      control: vi.fn(),
      formState: { errors: {} },
    })),
  };
});

describe('CurrencyInputField', () => {
  const renderWithControl = (
    props: any = {},
    setup?: (methods: any) => void,
  ) => {
    const WrapperWithControl = () => {
      const methods = useForm<{ fee_amount: undefined }>({
        defaultValues: { fee_amount: undefined },
      });

      // Allow custom setup of form state
      if (setup) {
        setup(methods);
      }

      // Merge props errors with form state errors
      const allErrors = {
        ...methods.formState.errors,
        ...(props.errors || {}),
      };

      return (
        <FormProvider {...methods}>
          <Form>
            <CurrencyInputField<{ fee_amount: undefined }>
              name="fee_amount"
              label="Amount"
              {...props}
              control={methods.control}
              errors={allErrors}
            />
          </Form>
        </FormProvider>
      );
    };
    return render(<WrapperWithControl />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with label and dollar sign', () => {
    renderWithControl();

    expect(screen.getByLabelText('Amount')).toBeInTheDocument();
    expect(screen.getByText('$')).toBeInTheDocument();
  });

  it('should accept numeric input and format to 2 decimals', async () => {
    const user = userEvent.setup();
    renderWithControl();

    const input = screen.getByRole('textbox');
    await user.type(input, '50');
    await user.click(document.body);

    expect(input).toHaveValue('50.00');
  });

  it('should display 2 decimals when typing decimal value', async () => {
    const user = userEvent.setup();
    renderWithControl();

    const input = screen.getByRole('textbox');
    await user.type(input, '50.5');
    await user.click(document.body);

    expect(input).toHaveValue('50.50');
  });

  it('should round to 2 decimals', async () => {
    const user = userEvent.setup();
    renderWithControl();

    const input = screen.getByRole('textbox');
    await user.type(input, '50.567');
    await user.click(document.body);

    expect(input).toHaveValue('50.57');
  });

  it('should show error message and invalid state', () => {
    renderWithControl({
      errors: { fee_amount: { message: 'Amount is required' } },
    });

    expect(screen.getByText('Amount is required')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveClass('is-invalid');
  });

  it('should show required asterisk when required', () => {
    renderWithControl({ required: true });

    expect(screen.getByText('Amount *')).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    renderWithControl({ disabled: true });

    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('should have correct placeholder', () => {
    renderWithControl();

    expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument();
  });

  it('should use custom placeholder', () => {
    renderWithControl({ placeholder: 'Enter amount' });

    expect(screen.getByPlaceholderText('Enter amount')).toBeInTheDocument();
  });

  it('should clear value when input is empty', async () => {
    const user = userEvent.setup();
    renderWithControl();

    const input = screen.getByRole('textbox');
    await user.type(input, '50');
    await user.clear(input);

    expect(input).toHaveValue('');
  });

  it('should not allow zero as a value', async () => {
    const user = userEvent.setup();
    renderWithControl({
      errors: { fee_amount: { message: 'Amount cannot be zero' } },
    });

    const input = screen.getByRole('textbox');
    await user.type(input, '0');
    await user.click(document.body);

    expect(input).toHaveValue('0.00');
    expect(screen.getByText('Amount cannot be zero')).toBeInTheDocument();
    expect(input).toHaveClass('is-invalid');
  });
});
