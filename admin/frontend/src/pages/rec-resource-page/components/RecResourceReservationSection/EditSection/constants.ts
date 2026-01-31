import { EditReservationFormData } from './schemas';

export const WEBSITE_MAX_LENGTH = 200;
export const EMAIL_MAX_LENGTH = 100;
export const PHONE_MAX_LENGTH = 50;

/**
 * Map of form field names to human-readable labels for error messages.
 */
export const EDIT_RESERVATION_FIELD_LABEL_MAP: Record<
  keyof EditReservationFormData,
  string
> = {
  has_reservation: 'Requires Reservation',
  reservation_email: 'Email',
  reservation_phone_number: 'Phone Number',
  reservation_website: 'Website',
} as const;
