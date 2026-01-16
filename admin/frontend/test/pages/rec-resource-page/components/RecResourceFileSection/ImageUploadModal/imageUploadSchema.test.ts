import {
  getUploadState,
  canUpload,
  imageUploadSchema,
  ImageUploadFormData,
} from '@/pages/rec-resource-page/components/RecResourceFileSection/ImageUploadModal/schemas/imageUploadSchema';
import { describe, expect, it } from 'vitest';

describe('imageUploadSchema', () => {
  describe('schema validation', () => {
    it('validates display name is required', () => {
      const result = imageUploadSchema.safeParse({
        displayName: '',
      });
      expect(result.success).toBe(false);
    });

    it('validates display name max length', () => {
      const result = imageUploadSchema.safeParse({
        displayName: 'a'.repeat(51),
      });
      expect(result.success).toBe(false);
    });

    it('accepts valid display name', () => {
      const result = imageUploadSchema.safeParse({
        displayName: 'Valid Name',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('getUploadState', () => {
    it('returns initial when no working hours selection', () => {
      const data: ImageUploadFormData = {
        displayName: 'Test',
        takenDuringWorkingHours: undefined,
        containsPersonalInfo: undefined,
        confirmNoPersonalInfo: false,
      };
      expect(getUploadState(data)).toBe('initial');
    });

    it('returns not-working-hours when working hours is no', () => {
      const data: ImageUploadFormData = {
        displayName: 'Test',
        takenDuringWorkingHours: 'no',
        containsPersonalInfo: undefined,
        confirmNoPersonalInfo: false,
      };
      expect(getUploadState(data)).toBe('not-working-hours');
    });

    it('returns has-personal-info when personal info is yes', () => {
      const data: ImageUploadFormData = {
        displayName: 'Test',
        takenDuringWorkingHours: 'yes',
        containsPersonalInfo: 'yes',
        confirmNoPersonalInfo: false,
      };
      expect(getUploadState(data)).toBe('has-personal-info');
    });

    it('returns confirm-no-personal-info when checkbox not confirmed', () => {
      const data: ImageUploadFormData = {
        displayName: 'Test',
        takenDuringWorkingHours: 'yes',
        containsPersonalInfo: 'no',
        confirmNoPersonalInfo: false,
      };
      expect(getUploadState(data)).toBe('confirm-no-personal-info');
    });

    it('returns ready when all conditions met', () => {
      const data: ImageUploadFormData = {
        displayName: 'Test',
        takenDuringWorkingHours: 'yes',
        containsPersonalInfo: 'no',
        confirmNoPersonalInfo: true,
      };
      expect(getUploadState(data)).toBe('ready');
    });
  });

  describe('canUpload', () => {
    it('returns true when state is ready', () => {
      const data: ImageUploadFormData = {
        displayName: 'Test',
        takenDuringWorkingHours: 'yes',
        containsPersonalInfo: 'no',
        confirmNoPersonalInfo: true,
      };
      expect(canUpload(data)).toBe(true);
    });

    it('returns false when state is not ready', () => {
      const data: ImageUploadFormData = {
        displayName: 'Test',
        takenDuringWorkingHours: 'yes',
        containsPersonalInfo: 'no',
        confirmNoPersonalInfo: false,
      };
      expect(canUpload(data)).toBe(false);
    });
  });
});
