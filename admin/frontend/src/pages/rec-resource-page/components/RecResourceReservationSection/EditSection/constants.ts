import { EditReservationFormData } from '@/pages/rec-resource-page/components/RecResourceReservationSection/EditSection/schemas';

export const WEBSITE_MAX_LENGTH = 200;
export const EMAIL_MAX_LENGTH = 100;
export const PHONE_MAX_LENGTH = 50;

export const RESERVATION_METHOD_OPTIONS = [
  { value: 'reservation_website', label: 'Website' },
  { value: 'reservation_phone_number', label: 'Phone number' },
  { value: 'reservation_email', label: 'Email' },
] as const;

export const RESERVATION_METHOD_LABEL_MAP = {
  reservation_website: 'Website',
  reservation_phone_number: 'Phone number',
  reservation_email: 'Email',
} as const;

export type ReservationMethod = keyof typeof RESERVATION_METHOD_LABEL_MAP;

export const getReservationContactConfig = (
  method?: ReservationMethod,
): {
  placeholder: string;
  maxLength: number;
  type?: string;
} => {
  if (method === 'reservation_phone_number') {
    return {
      placeholder: 'Enter the reservation phone number, e.g. 250-555-1234',
      maxLength: PHONE_MAX_LENGTH,
      type: 'tel',
    };
  }

  if (method === 'reservation_email') {
    return {
      placeholder: 'Enter the reservation email, e.g. name@example.com',
      maxLength: EMAIL_MAX_LENGTH,
      type: 'email',
    };
  }

  return {
    placeholder: 'Enter the reservation website, e.g. https://example.com',
    maxLength: WEBSITE_MAX_LENGTH,
    type: 'url',
  };
};

/**
 * Map of form field names to human-readable labels for error messages.
 */
export const EDIT_RESERVATION_FIELD_LABEL_MAP: Record<
  keyof EditReservationFormData,
  string
> = {
  has_reservation: 'Reservable',
  reservation_method: 'Reservation method',
  reservation_contact: 'Reservation contact',
} as const;
