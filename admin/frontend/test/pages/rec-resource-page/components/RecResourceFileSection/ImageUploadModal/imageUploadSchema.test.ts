import {
  imageUploadSchema,
  ImageUploadFormData,
  isDateSuspiciouslyOld,
} from '@/pages/rec-resource-page/components/RecResourceFileSection/ImageUploadModal/schemas/imageUploadSchema';
import { describe, expect, it } from 'vitest';

describe('imageUploadSchema', () => {
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

  describe('didYouTakePhoto validation', () => {
    it('requires didYouTakePhoto to be answered', () => {
      const result = imageUploadSchema.safeParse(
        createValidFormData({ didYouTakePhoto: null }),
      );
      expect(result.success).toBe(false);
    });

    it('accepts true', () => {
      const result = imageUploadSchema.safeParse(
        createValidFormData({ didYouTakePhoto: true }),
      );
      expect(result.success).toBe(true);
    });

    it('requires photographer name when didYouTakePhoto is false', () => {
      const result = imageUploadSchema.safeParse(
        createValidFormData({
          didYouTakePhoto: false,
          photographerName: '',
        }),
      );
      expect(result.success).toBe(false);
    });

    it('accepts when photographer name provided and didYouTakePhoto is false', () => {
      const result = imageUploadSchema.safeParse(
        createValidFormData({
          didYouTakePhoto: false,
          photographerName: 'John Doe',
        }),
      );
      expect(result.success).toBe(true);
    });
  });

  describe('containsIdentifiableInfo validation', () => {
    it('requires containsIdentifiableInfo to be answered', () => {
      const result = imageUploadSchema.safeParse(
        createValidFormData({ containsIdentifiableInfo: null }),
      );
      expect(result.success).toBe(false);
    });

    it('requires consent form when containsIdentifiableInfo is true', () => {
      const result = imageUploadSchema.safeParse(
        createValidFormData({
          containsIdentifiableInfo: true,
          consentFormFile: null,
        }),
      );
      expect(result.success).toBe(false);
    });

    it('accepts when consent form provided and containsIdentifiableInfo is true', () => {
      const mockFile = new File(['consent'], 'consent.pdf', {
        type: 'application/pdf',
      });
      const result = imageUploadSchema.safeParse(
        createValidFormData({
          containsIdentifiableInfo: true,
          consentFormFile: mockFile,
        }),
      );
      expect(result.success).toBe(true);
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
