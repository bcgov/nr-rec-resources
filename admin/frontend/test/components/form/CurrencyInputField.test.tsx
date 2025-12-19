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
  const defaultProps = {
    name: 'fee_amount',
    label: 'Amount',
    control: null as any,
    errors: {},
  };

  const renderWithControl = (props = {}) => {
    const WrapperWithControl = () => {
      const methods = useForm({
        defaultValues: { fee_amount: undefined },
      });
      return (
        <FormProvider {...methods}>
          <Form>
            <CurrencyInputField
              {...defaultProps}
              {...props}
              control={methods.control}
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
});
