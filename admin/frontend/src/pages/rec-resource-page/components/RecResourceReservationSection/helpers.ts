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

export const getReservationContact = (
  reservationInfo: RecreationResourceReservationInfoDto | null,
  reservationMethod?: ReservationMethod,
) => {
  if (!reservationMethod) {
    return '';
  }

  return reservationInfo?.[reservationMethod] || '';
};
