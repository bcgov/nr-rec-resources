import { describe, expect, it } from 'vitest';
import {
  EDIT_RESERVATION_FIELD_LABEL_MAP,
  EMAIL_MAX_LENGTH,
  PHONE_MAX_LENGTH,
  WEBSITE_MAX_LENGTH,
  getReservationContactConfig,
} from '@/pages/rec-resource-page/components/RecResourceReservationSection/EditSection/constants';

describe('getReservationContactConfig', () => {
  it('returns phone config for phone reservations', () => {
    expect(
      getReservationContactConfig('reservation_phone_number'),
    ).toMatchObject({
      placeholder: 'Enter the reservation phone number, e.g. 250-555-1234',
      maxLength: PHONE_MAX_LENGTH,
      type: 'tel',
    });
  });

  it('returns email config for email reservations', () => {
    expect(getReservationContactConfig('reservation_email')).toMatchObject({
      placeholder: 'Enter the reservation email, e.g. name@example.com',
      maxLength: EMAIL_MAX_LENGTH,
      type: 'email',
    });
  });

  it('returns website config by default', () => {
    expect(getReservationContactConfig()).toMatchObject({
      placeholder: 'Enter the reservation website, e.g. https://example.com',
      maxLength: WEBSITE_MAX_LENGTH,
      type: 'url',
    });
  });

  it('exposes field labels for the error banner', () => {
    expect(EDIT_RESERVATION_FIELD_LABEL_MAP).toMatchObject({
      has_reservation: 'Reservable',
      reservation_method: 'Reservation method',
      reservation_contact: 'Reservation contact',
    });
  });
});
