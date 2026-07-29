import { RecreationResourceReservationInfoDto } from '@/services';
import { ReservationMethod } from '@/pages/rec-resource-page/components/RecResourceReservationSection/EditSection/constants';

export const getReservationMethod = (
  reservationInfo: RecreationResourceReservationInfoDto | null,
): ReservationMethod | undefined => {
  if (reservationInfo?.reservation_website) {
    return 'reservation_website';
  }

  if (reservationInfo?.reservation_phone_number) {
    return 'reservation_phone_number';
  }

  if (reservationInfo?.reservation_email) {
    return 'reservation_email';
  }

  return undefined;
};

/**
 * Normalise a stored phone number to NNN-NNN-NNNN display format.
 * Handles legacy E.164 values (e.g. +12505551234) that were stored by the
 * previous backend transform, converting them back to the expected format.
 */
const normalisePhoneNumber = (value: string): string => {
  // Already in expected format
  if (/^\d{3}-\d{3}-\d{4}$/.test(value)) {
    return value;
  }
  // Legacy E.164 format: +1XXXXXXXXXX
  const e164Match = value.match(/^\+1(\d{3})(\d{3})(\d{4})$/);
  if (e164Match) {
    return `${e164Match[1]}-${e164Match[2]}-${e164Match[3]}`;
  }
  return value;
};

export const getReservationContact = (
  reservationInfo: RecreationResourceReservationInfoDto | null,
  reservationMethod?: ReservationMethod,
) => {
  if (!reservationMethod) {
    return '';
  }

  const value = reservationInfo?.[reservationMethod] || '';

  if (reservationMethod === 'reservation_phone_number' && value) {
    return normalisePhoneNumber(value);
  }

  return value;
};
