import {
  imageUploadSchema,
  ImageUploadFormData,
  isDateSuspiciouslyOld,
} from '@/pages/rec-resource-page/components/RecResourceFileSection/ImageUploadModal/schemas/imageUploadSchema';
import { describe, expect, it } from 'vitest';

describe('imageUploadSchema', () => {
  const mockConsentFile = new File(['consent'], 'consent.pdf', {
    type: 'application/pdf',
  });

  const NON_STAFF_TYPES = ['CONTRACTOR', 'VOLUNTEER', 'PHOTOGRAPHER', 'OTHER'];

  const createValidFormData = (
    overrides: Partial<ImageUploadFormData> = {},
  ): ImageUploadFormData => ({
    displayName: 'Test Image',
    dateCreated: null,
    didYouTakePhoto: true,
    containsIdentifiableInfo: false,
    photographerName: '',
    photographerType: 'STAFF',
    consentFormFile: null,
    confirmationChecked: true,
    ...overrides,
  });

  describe('displayName validation', () => {
    it('requires display name', () => {
      const result = imageUploadSchema.safeParse(
        createValidFormData({ displayName: '' }),
      );
      expect(result.success).toBe(false);
    });

    it('rejects display name exceeding 50 characters', () => {
      const result = imageUploadSchema.safeParse(
        createValidFormData({ displayName: 'a'.repeat(51) }),
      );
      expect(result.success).toBe(false);
    });

    it('accepts valid display name', () => {
      const result = imageUploadSchema.safeParse(createValidFormData());
      expect(result.success).toBe(true);
    });
  });

  describe('dateCreated validation', () => {
    it('accepts null date', () => {
      const result = imageUploadSchema.safeParse(
        createValidFormData({ dateCreated: null }),
      );
      expect(result.success).toBe(true);
    });

    it('accepts past date', () => {
      const result = imageUploadSchema.safeParse(
        createValidFormData({ dateCreated: new Date('2020-01-01') }),
      );
      expect(result.success).toBe(true);
    });

    it('rejects future date', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const result = imageUploadSchema.safeParse(
        createValidFormData({ dateCreated: futureDate }),
      );
      expect(result.success).toBe(false);
    });
  });

  describe('staff-specific validation', () => {
    it('requires "working hours" answer for staff', () => {
      const result = imageUploadSchema.safeParse(
        createValidFormData({
          photographerType: 'STAFF',
          didYouTakePhoto: null,
        }),
      );
      expect(result.success).toBe(false);
    });

    it('does not require photographer name for staff', () => {
      const result = imageUploadSchema.safeParse(
        createValidFormData({
          photographerType: 'STAFF',
          photographerName: '',
        }),
      );
      expect(result.success).toBe(true);
    });

    describe('consent form requirements', () => {
      it('does not require consent when working hours + no PII', () => {
        const result = imageUploadSchema.safeParse(
          createValidFormData({
            photographerType: 'STAFF',
            didYouTakePhoto: true,
            containsIdentifiableInfo: false,
            consentFormFile: null,
          }),
        );
        expect(result.success).toBe(true);
      });

      it('requires consent when working hours + has PII', () => {
        const result = imageUploadSchema.safeParse(
          createValidFormData({
            photographerType: 'STAFF',
            didYouTakePhoto: true,
            containsIdentifiableInfo: true,
            consentFormFile: null,
          }),
        );
        expect(result.success).toBe(false);
      });

      it('requires consent when NOT working hours', () => {
        const result = imageUploadSchema.safeParse(
          createValidFormData({
            photographerType: 'STAFF',
            didYouTakePhoto: false,
            containsIdentifiableInfo: false,
            consentFormFile: null,
          }),
        );
        expect(result.success).toBe(false);
      });

      it('accepts consent form when required', () => {
        const result = imageUploadSchema.safeParse(
          createValidFormData({
            photographerType: 'STAFF',
            didYouTakePhoto: true,
            containsIdentifiableInfo: true,
            consentFormFile: mockConsentFile,
          }),
        );
        expect(result.success).toBe(true);
      });
    });
  });

  describe('non-staff validation (all types behave the same)', () => {
    it.each(NON_STAFF_TYPES)(
      '%s: does not require "working hours" answer',
      (photographerType) => {
        const result = imageUploadSchema.safeParse(
          createValidFormData({
            photographerType,
            didYouTakePhoto: null,
            photographerName: 'John Doe',
            consentFormFile: mockConsentFile,
          }),
        );
        expect(result.success).toBe(true);
      },
    );

    it.each(NON_STAFF_TYPES)(
      '%s: requires photographer name',
      (photographerType) => {
        const result = imageUploadSchema.safeParse(
          createValidFormData({
            photographerType,
            photographerName: '',
            consentFormFile: mockConsentFile,
          }),
        );
        expect(result.success).toBe(false);
      },
    );

    it.each(NON_STAFF_TYPES)(
      '%s: accepts when photographer name provided',
      (photographerType) => {
        const result = imageUploadSchema.safeParse(
          createValidFormData({
            photographerType,
            photographerName: 'John Doe',
            consentFormFile: mockConsentFile,
          }),
        );
        expect(result.success).toBe(true);
      },
    );

    it.each(NON_STAFF_TYPES)(
      '%s: always requires consent form',
      (photographerType) => {
        const result = imageUploadSchema.safeParse(
          createValidFormData({
            photographerType,
            photographerName: 'John Doe',
            containsIdentifiableInfo: false,
            consentFormFile: null,
          }),
        );
        expect(result.success).toBe(false);
      },
    );

    it.each(NON_STAFF_TYPES)(
      '%s: accepts when consent form provided',
      (photographerType) => {
        const result = imageUploadSchema.safeParse(
          createValidFormData({
            photographerType,
            photographerName: 'John Doe',
            containsIdentifiableInfo: false,
            consentFormFile: mockConsentFile,
          }),
        );
        expect(result.success).toBe(true);
      },
    );
  });

  describe('containsIdentifiableInfo validation', () => {
    it('requires containsIdentifiableInfo to be answered', () => {
      const result = imageUploadSchema.safeParse(
        createValidFormData({ containsIdentifiableInfo: null }),
      );
      expect(result.success).toBe(false);
    });
  });

  describe('confirmationChecked validation', () => {
    it('requires confirmation checkbox to be checked', () => {
      const result = imageUploadSchema.safeParse(
        createValidFormData({ confirmationChecked: false }),
      );
      expect(result.success).toBe(false);
    });

    it('accepts when confirmation is checked', () => {
      const result = imageUploadSchema.safeParse(
        createValidFormData({ confirmationChecked: true }),
      );
      expect(result.success).toBe(true);
    });
  });

  describe('isDateSuspiciouslyOld', () => {
    it('returns false for null date', () => {
      expect(isDateSuspiciouslyOld(null)).toBe(false);
    });

    it('returns false for recent date', () => {
      expect(isDateSuspiciouslyOld(new Date())).toBe(false);
    });

    it('returns true for date older than 50 years', () => {
      const oldDate = new Date();
      oldDate.setFullYear(oldDate.getFullYear() - 51);
      expect(isDateSuspiciouslyOld(oldDate)).toBe(true);
    });
  });
});
