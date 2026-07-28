import { describe, expect, it } from 'vitest';
import { createEditReservationSchema } from '@/pages/rec-resource-page/components/RecResourceReservationSection/EditSection/schemas';

describe('createEditReservationSchema', () => {
  const schema = createEditReservationSchema();

  it('allows non-reservable resources without reservation details', () => {
    const result = schema.safeParse({
      has_reservation: false,
      reservation_contact: '',
    });

    expect(result.success).toBe(true);
  });

  it('requires a reservation method when reservations are enabled', () => {
    const result = schema.safeParse({
      has_reservation: true,
      reservation_contact: 'https://example.com',
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.reservation_method).toContain(
      'Select a reservation method.',
    );
  });

  it('requires reservation contact information when the value is blank', () => {
    const result = schema.safeParse({
      has_reservation: true,
      reservation_method: 'reservation_website',
      reservation_contact: '   ',
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.reservation_contact).toContain(
      'Enter reservation contact information.',
    );
  });

  it('validates website reservation contact format', () => {
    const invalid = schema.safeParse({
      has_reservation: true,
      reservation_method: 'reservation_website',
      reservation_contact: 'not-a-url',
    });
    const valid = schema.safeParse({
      has_reservation: true,
      reservation_method: 'reservation_website',
      reservation_contact: 'https://example.com',
    });

    expect(invalid.success).toBe(false);
    expect(invalid.error?.flatten().fieldErrors.reservation_contact).toContain(
      'Invalid URL format. Example: https://example.com/.',
    );
    expect(valid.success).toBe(true);
  });

  it('validates phone reservation contact format', () => {
    const invalid = schema.safeParse({
      has_reservation: true,
      reservation_method: 'reservation_phone_number',
      reservation_contact: 'invalid-number',
    });
    const valid = schema.safeParse({
      has_reservation: true,
      reservation_method: 'reservation_phone_number',
      reservation_contact: '250-555-1234',
    });

    expect(invalid.success).toBe(false);
    expect(invalid.error?.flatten().fieldErrors.reservation_contact).toContain(
      'Invalid phone number format. Example: 250-555-1234.',
    );
    expect(valid.success).toBe(true);
  });

  it('rejects phone numbers that do not match NNN-NNN-NNNN format', () => {
    const formats = [
      '(250) 555-1234', // parentheses format
      '250 555 1234', // spaces instead of dashes
      '+12505551234', // E.164 format (legacy - must be normalised before submit)
      '2505551234', // no separators
      '1-250-555-1234', // leading country code
      '250-555-12345', // too many digits
      '250-55-1234', // too few digits in middle segment
    ];

    for (const contact of formats) {
      const result = schema.safeParse({
        has_reservation: true,
        reservation_method: 'reservation_phone_number',
        reservation_contact: contact,
      });
      expect(result.success, `Expected "${contact}" to be invalid`).toBe(false);
    }
  });

  it('validates email reservation contact format', () => {
    const invalid = schema.safeParse({
      has_reservation: true,
      reservation_method: 'reservation_email',
      reservation_contact: 'invalid-email',
    });
    const valid = schema.safeParse({
      has_reservation: true,
      reservation_method: 'reservation_email',
      reservation_contact: 'name@example.com',
    });

    expect(invalid.success).toBe(false);
    expect(invalid.error?.flatten().fieldErrors.reservation_contact).toContain(
      'Invalid email format. Example: name@example.com.',
    );
    expect(valid.success).toBe(true);
  });
});
