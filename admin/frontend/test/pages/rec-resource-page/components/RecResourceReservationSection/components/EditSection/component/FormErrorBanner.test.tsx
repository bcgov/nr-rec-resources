import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FieldErrors } from 'react-hook-form';
import { FormErrorBanner } from '@/pages/rec-resource-page/components/RecResourceReservationSection/EditSection/components/FormErrorBanner';
import { EditReservationFormData } from '@/pages/rec-resource-page/components/RecResourceReservationSection/EditSection/schemas/editReservation';

describe('FormErrorBanner', () => {
  it('returns null when there are no errors', () => {
    const { container } = render(
      <FormErrorBanner errors={{} as FieldErrors<EditReservationFormData>} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders error messages using field names when no label map is provided', () => {
    const errors: FieldErrors<EditReservationFormData> = {
      reservation_email: {
        type: 'required',
        message: 'Email is required',
      },
    };

    render(<FormErrorBanner errors={errors} />);

    expect(
      screen.getByText('Please review and correct the following errors:'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('reservation_email: Email is required'),
    ).toBeInTheDocument();

    // icon rendered
    expect(screen.getByLabelText('Error')).toBeInTheDocument();
  });

  it('uses fieldLabelMap when provided', () => {
    const errors: FieldErrors<EditReservationFormData> = {
      reservation_email: {
        type: 'pattern',
        message: 'Invalid email format',
      },
    };

    const fieldLabelMap = {
      reservation_email: 'Email Address',
    } as Record<keyof EditReservationFormData, string>;

    render(<FormErrorBanner errors={errors} fieldLabelMap={fieldLabelMap} />);

    expect(
      screen.getByText('Email Address: Invalid email format'),
    ).toBeInTheDocument();
  });

  it('renders multiple errors and applies className', () => {
    const errors: FieldErrors<EditReservationFormData> = {
      reservation_email: {
        type: 'required',
        message: 'Email is required',
      },
      reservation_website: {
        type: 'minLength',
        message: 'Website name is too short',
      },
    };

    const { container } = render(
      <FormErrorBanner errors={errors} className="custom-error-banner" />,
    );

    expect(
      screen.getByText('reservation_email: Email is required'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('reservation_website: Website name is too short'),
    ).toBeInTheDocument();

    expect(container.querySelector('.custom-error-banner')).toBeTruthy();

    // verifies list rendering path
    expect(container.querySelectorAll('li')).toHaveLength(2);
  });
});
