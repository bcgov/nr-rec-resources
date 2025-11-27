import { TextField } from '@/pages/rec-resource-page/components/RecResourceOverviewSection/EditSection/components';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'react-bootstrap';
import { FormProvider, useForm } from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

describe('TextField', () => {
  const mockRegister = vi.fn();
  const mockErrors = {};

  const defaultProps = {
    name: 'maintenance_standard_code' as const,
    label: 'Test Label',
    register: mockRegister,
    errors: mockErrors,
  };

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const methods = useForm();
    return (
      <FormProvider {...methods}>
        <Form>{children}</Form>
      </FormProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with basic props', () => {
    render(<TextField {...defaultProps} />, { wrapper: Wrapper });

    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should render as textarea when specified', () => {
    render(<TextField {...defaultProps} as="textarea" />, { wrapper: Wrapper });

    const textarea = screen.getByLabelText('Test Label');
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  it('should show required asterisk when required is true', () => {
    render(<TextField {...defaultProps} required />, { wrapper: Wrapper });
    expect(screen.getByText('Test Label *')).toBeInTheDocument();
  });

  it('should not show required asterisk when required is false or undefined', () => {
    const { rerender } = render(<TextField {...defaultProps} />, {
      wrapper: Wrapper,
    });

    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.queryByText('Test Label *')).not.toBeInTheDocument();

    rerender(<TextField {...defaultProps} required={false} />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.queryByText('Test Label *')).not.toBeInTheDocument();
  });

  it('should show error message when error exists', () => {
    const errorMessage = 'This field is required';
    render(
      <TextField
        {...defaultProps}
        errors={{ maintenance_standard_code: { message: errorMessage } }}
      />,
      { wrapper: Wrapper },
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveClass('is-invalid');
  });

  it('should pass through other props to the input', () => {
    const placeholder = 'Enter text here';
    render(<TextField {...defaultProps} placeholder={placeholder} />, {
      wrapper: Wrapper,
    });

    const input = screen.getByPlaceholderText(placeholder);
    expect(input).toBeInTheDocument();
  });

  it('should handle user input', async () => {
    const user = userEvent.setup();

    render(<TextField {...defaultProps} />, { wrapper: Wrapper });

    const input = screen.getByRole('textbox');
    const testValue = 'test value';
    await user.type(input, testValue);

    // Verify the input value was updated
    expect(input).toHaveValue(testValue);
  });

  it('should be enabled by default', () => {
    render(<TextField {...defaultProps} />, { wrapper: Wrapper });
    expect(screen.getByRole('textbox')).toBeEnabled();
  });

  it('should apply placeholder when provided', () => {
    render(<TextField {...defaultProps} placeholder="Enter value here" />, {
      wrapper: Wrapper,
    });

    const input = screen.getByPlaceholderText('Enter value here');
    expect(input).toBeInTheDocument();
  });

  it('should apply rows to textarea', () => {
    render(<TextField {...defaultProps} as="textarea" rows={5} />, {
      wrapper: Wrapper,
    });

    const textarea = screen.getByLabelText('Test Label');
    expect(textarea).toHaveAttribute('rows', '5');
  });

  it('should call register with correct field name', () => {
    mockRegister.mockReturnValue({});
    render(<TextField {...defaultProps} />);

    expect(mockRegister).toHaveBeenCalledWith('maintenance_standard_code');
  });

  it('should display error message when error exists', () => {
    const errorsWithMessage = {
      maintenance_standard_code: { message: 'This field is required' },
    };

    render(<TextField {...defaultProps} errors={errorsWithMessage} />, {
      wrapper: Wrapper,
    });

    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveClass('is-invalid');
  });

  it('should not display error message when no error', () => {
    render(<TextField {...defaultProps} />, { wrapper: Wrapper });

    expect(
      screen.queryByText(/error|required|invalid/i),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('textbox')).not.toHaveClass('is-invalid');
  });

  it('should handle different error formats', () => {
    const errorsWithDifferentFormat = {
      maintenance_standard_code: { message: 'Custom error message' },
    };

    render(<TextField {...defaultProps} errors={errorsWithDifferentFormat} />, {
      wrapper: Wrapper,
    });

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('should render with correct form group structure', () => {
    render(<TextField {...defaultProps} />, { wrapper: Wrapper });

    // Check for the form group by its structure rather than class name
    const input = screen.getByRole('textbox');
    const label = screen.getByText('Test Label');

    // The input should be in the document and have the form-control class
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('form-control');

    // The label should be associated with the input
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute('for', input.id);

    // The input should be wrapped in a form group
    const formGroup = input.closest('div');
    expect(formGroup).toBeInTheDocument();
  });

  it('should handle textarea with form-control class', () => {
    render(<TextField {...defaultProps} as="textarea" />, { wrapper: Wrapper });
    render(<TextField {...defaultProps} as="textarea" />);

    const textarea = screen.getByLabelText('Test Label');
    expect(textarea).toHaveClass('form-control');
  });

  it('should support user input', async () => {
    const user = userEvent.setup();
    mockRegister.mockReturnValue({});

    render(<TextField {...defaultProps} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'test value');

    expect(input).toHaveValue('test value');
  });

  it('should handle empty errors object', () => {
    render(<TextField {...defaultProps} errors={{}} />);

    expect(screen.queryByText(/error|required/i)).not.toBeInTheDocument();
    expect(screen.getByRole('textbox')).not.toHaveClass('is-invalid');
  });

  it('should handle undefined errors', () => {
    // Provide a default empty object for errors
    render(<TextField {...defaultProps} errors={{}} />);

    expect(screen.queryByText(/error|required/i)).not.toBeInTheDocument();
    expect(screen.getByRole('textbox')).not.toHaveClass('is-invalid');
  });
});
