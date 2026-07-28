import { describe, expect, it } from 'vitest';
import {
  getReservationContact,
  getReservationMethod,
} from '@/pages/rec-resource-page/components/RecResourceReservationSection/helpers';

describe('RecResourceReservationSection helpers', () => {
  it('returns reservation methods in priority order', () => {
    expect(
      getReservationMethod({
        reservation_email: 'name@example.com',
        reservation_phone_number: '250-555-1234',
        reservation_website: 'https://example.com',
      } as any),
    ).toBe('reservation_website');

    expect(
      getReservationMethod({
        reservation_email: 'name@example.com',
        reservation_phone_number: '250-555-1234',
        reservation_website: null,
      } as any),
    ).toBe('reservation_phone_number');

    expect(
      getReservationMethod({
        reservation_email: 'name@example.com',
        reservation_phone_number: null,
        reservation_website: null,
      } as any),
    ).toBe('reservation_email');
  });

  it('returns undefined when no reservation method exists', () => {
    expect(getReservationMethod(null)).toBeUndefined();
    expect(
      getReservationMethod({
        reservation_email: null,
        reservation_phone_number: null,
        reservation_website: null,
      } as any),
    ).toBeUndefined();
  });

  it('returns the reservation contact for the selected method', () => {
    expect(
      getReservationContact(
        {
          reservation_email: 'name@example.com',
          reservation_phone_number: '250-555-1234',
          reservation_website: 'https://example.com',
        } as any,
        'reservation_email',
      ),
    ).toBe('name@example.com');
  });

  it('returns an empty string when no method is selected', () => {
    expect(getReservationContact(null)).toBe('');
  });

  describe('getReservationContact – phone number normalisation', () => {
    it('returns a phone number already in NNN-NNN-NNNN format unchanged', () => {
      expect(
        getReservationContact(
          { reservation_phone_number: '250-555-1234' } as any,
          'reservation_phone_number',
        ),
      ).toBe('250-555-1234');
    });

    it('converts a legacy E.164 value (+1XXXXXXXXXX) to NNN-NNN-NNNN', () => {
      expect(
        getReservationContact(
          { reservation_phone_number: '+12505551234' } as any,
          'reservation_phone_number',
        ),
      ).toBe('250-555-1234');
    });

    it('leaves an unrecognised phone value as-is', () => {
      expect(
        getReservationContact(
          { reservation_phone_number: '(250) 555-1234' } as any,
          'reservation_phone_number',
        ),
      ).toBe('(250) 555-1234');
    });

    it('returns an empty string when phone number is absent', () => {
      expect(
        getReservationContact(
          { reservation_phone_number: null } as any,
          'reservation_phone_number',
        ),
      ).toBe('');
    });
  });
});
