import {
  FILE_TYPE_CONFIGS,
  RecResourceNavKey,
} from '@/pages/rec-resource-page';
import { describe, expect, it } from 'vitest';

describe('rec-resource-page constants', () => {
  describe('FILE_TYPE_CONFIGS', () => {
    it('has correct configuration for document type', () => {
      expect(FILE_TYPE_CONFIGS.document).toEqual({
        accept: 'application/pdf',
        maxFiles: 30,
      });
    });

    it('has correct configuration for image type', () => {
      expect(FILE_TYPE_CONFIGS.image).toEqual({
        accept: 'image/png,image/jpg,image/jpeg,image/webp,image/heic',
        maxFiles: 20,
      });
    });

    it('has all required file type configurations', () => {
      expect(Object.keys(FILE_TYPE_CONFIGS)).toEqual(['document', 'image']);
    });
  });

  describe('RecResourceTabKey', () => {
    it('has correct enum values', () => {
      expect(RecResourceNavKey.OVERVIEW).toBe('overview');
      expect(RecResourceNavKey.FILES).toBe('files');
      expect(RecResourceNavKey.FEES).toBe('fees');
      expect(RecResourceNavKey.GEOSPATIAL).toBe('geospatial');
      expect(RecResourceNavKey.RESERVATION).toBe('reservation');
    });

    it('has all expected tab keys', () => {
      expect(Object.values(RecResourceNavKey)).toEqual([
        'overview',
        'files',
        'activities',
        'fees',
        'geospatial',
        'reservation',
      ]);
    });
  });
});
