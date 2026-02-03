import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormErrorBanner } from '@/pages/rec-resource-page/components/shared/FormErrorBanner';
import { FieldErrors } from 'react-hook-form';

// Dummy type for testing
interface TestFormData {
  email: string;
  age: number;
}

describe('FormErrorBanner', () => {
  it('renders nothing when there are no errors', () => {
    const { container } = render(<FormErrorBanner<TestFormData> errors={{}} />);
    // Checks that the component returns null (empty DOM)
    expect(container.firstChild).toBeNull();
  });

  it('renders error messages with default field names when no label map is provided', () => {
    const errors: FieldErrors<TestFormData> = {
      email: { type: 'required', message: 'Email is required' },
      age: { type: 'min', message: 'Must be at least 18' },
    };

    render(<FormErrorBanner<TestFormData> errors={errors} />);

    expect(
      screen.getByText(/Please review and correct the following errors/i),
    ).toBeInTheDocument();
    expect(screen.getByText('email: Email is required')).toBeInTheDocument();
    expect(screen.getByText('age: Must be at least 18')).toBeInTheDocument();
  });

  it('uses the fieldLabelMap for human-readable labels when provided', () => {
    const errors: FieldErrors<TestFormData> = {
      email: { type: 'invalid', message: 'Invalid format' },
    };
    const labelMap = {
      email: 'Work Email Address',
    };

    render(
      <FormErrorBanner<TestFormData>
        errors={errors}
        fieldLabelMap={labelMap}
      />,
    );

    // Should use "Work Email Address" instead of "email"
    expect(
      screen.getByText('Work Email Address: Invalid format'),
    ).toBeInTheDocument();
  });

  it('applies the custom className to the Alert component', () => {
    const errors: FieldErrors<TestFormData> = {
      email: { type: 'required', message: 'Required' },
    };

    render(
      <FormErrorBanner<TestFormData>
        errors={errors}
        className="custom-test-class"
      />,
    );

    const alertElement = screen.getByRole('alert');
    expect(alertElement).toHaveClass('custom-test-class');
  });

  it('handles partial label maps correctly', () => {
    const errors: FieldErrors<TestFormData> = {
      email: { type: 'required', message: 'Required' },
      age: { type: 'required', message: 'Required' },
    };
    // Only mapping email, leaving age to default
    const partialMap = { email: 'Email' };

    render(
      <FormErrorBanner<TestFormData>
        errors={errors}
        fieldLabelMap={partialMap}
      />,
    );

    expect(screen.getByText('Email: Required')).toBeInTheDocument();
    expect(screen.getByText('age: Required')).toBeInTheDocument();
  });
});
