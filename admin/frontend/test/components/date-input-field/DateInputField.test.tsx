import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'react-bootstrap';
import { FormProvider, useForm } from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DateInputField,
  DateInputFieldProps,
} from '@/components/date-input-field';

// Mock react-hook-form
vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual('react-hook-form');
  return {
    ...actual,
    useFormContext: vi.fn(() => ({
      register: vi.fn(),
      formState: { errors: {} },
    })),
  };
});

describe('DateInputField', () => {
  const mockRegister = vi.fn(() => ({}));
  const mockErrors = {};

  const defaultProps: DateInputFieldProps = {
    name: 'project_established_date',
    label: 'Established Date',
    register: mockRegister,
    errors: mockErrors,
  };

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const methods = useForm({
      defaultValues: { establishedDate: '' },
    });
    return (
      <FormProvider {...methods}>
        <Form>{children}</Form>
      </FormProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with basic props (register mode)', () => {
    render(<DateInputField {...defaultProps} />, { wrapper: Wrapper });

    expect(screen.getByLabelText('Established Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Established Date')).toHaveAttribute(
      'type',
      'date',
    );
  });

  it('renders required asterisk when required=true', () => {
    render(<DateInputField {...defaultProps} required />, { wrapper: Wrapper });

    expect(screen.getByText('Established Date *')).toBeInTheDocument();
  });

  it('does not show required asterisk when required=false', () => {
    render(<DateInputField {...defaultProps} />, { wrapper: Wrapper });

    expect(screen.getByText('Established Date')).toBeInTheDocument();
    expect(screen.queryByText('Established Date *')).not.toBeInTheDocument();
  });

  it('applies placeholder when provided', () => {
    render(<DateInputField {...defaultProps} placeholder="Select a date" />, {
      wrapper: Wrapper,
    });

    expect(screen.getByPlaceholderText('Select a date')).toBeInTheDocument();
  });

  it('applies max date (today)', () => {
    const today = new Date().toISOString().split('T')[0];

    render(<DateInputField {...defaultProps} />, { wrapper: Wrapper });

    expect(screen.getByLabelText('Established Date')).toHaveAttribute(
      'max',
      today,
    );
  });

  it('calls register() with correct field name (register mode)', () => {
    render(<DateInputField {...defaultProps} />, { wrapper: Wrapper });

    expect(mockRegister).toHaveBeenCalledWith('project_established_date');
  });

  it('shows error message when error exists (register mode)', () => {
    const errors = {
      project_established_date: { message: 'Date is required' },
    };

    render(<DateInputField {...defaultProps} errors={errors} />, {
      wrapper: Wrapper,
    });

    expect(screen.getByText('Date is required')).toBeInTheDocument();
    expect(screen.getByLabelText('Established Date')).toHaveClass('is-invalid');
  });

  it('does not show error message when no error exists', () => {
    render(<DateInputField {...defaultProps} />, { wrapper: Wrapper });

    expect(
      screen.queryByText(/required|invalid|error/i),
    ).not.toBeInTheDocument();
  });

  it('handles user input (register mode)', async () => {
    const user = userEvent.setup();

    render(<DateInputField {...defaultProps} />, { wrapper: Wrapper });

    const input = screen.getByLabelText('Established Date');
    await user.type(input, '2023-01-01');

    expect(input).toHaveValue('2023-01-01');
  });

  //
  // --- CONTROLLED MODE (Controller) ---
  //

  it('handles controlled field value updates', async () => {
    const user = userEvent.setup();

    const WrapperControlled = () => {
      const methods = useForm({
        defaultValues: { establishedDate: '' },
      });
      return (
        <FormProvider {...methods}>
          <Form>
            <DateInputField
              {...defaultProps}
              control={methods.control}
              register={undefined}
            />
          </Form>
        </FormProvider>
      );
    };

    render(<WrapperControlled />);

    const input = screen.getByLabelText('Established Date');

    await user.type(input, '2024-10-05');

    expect(input).toHaveValue('2024-10-05');
  });

  it('renders proper form group structure', () => {
    render(<DateInputField {...defaultProps} />, { wrapper: Wrapper });

    const label = screen.getByText('Established Date');
    const input = screen.getByLabelText('Established Date');

    expect(label).toHaveAttribute('for', input.id);
    expect(input.closest('div')).toBeInTheDocument();
  });

  it('supports empty errors object', () => {
    render(<DateInputField {...defaultProps} errors={{}} />, {
      wrapper: Wrapper,
    });

    expect(screen.getByLabelText('Established Date')).not.toHaveClass(
      'is-invalid',
    );
  });
});
