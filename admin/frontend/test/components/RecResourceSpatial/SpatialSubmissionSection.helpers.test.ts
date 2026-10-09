import { describe, it, expect } from 'vitest';
import {
  getMissingRequiredFields,
  requiresSectionIdsForFeatureCollection,
} from '@/components/RecResourceSpatial/SpatialSubmissionSection.helpers';
import { WizardValues } from '@/components/RecResourceSpatial/SpatialSubmissionSection.types';
import { DEFAULT_WIZARD_VALUES } from '@/components/RecResourceSpatial/SpatialSubmissionSection.constants';

describe('SpatialSubmissionSection.helpers', () => {
  describe('getMissingRequiredFields', () => {
    it('returns empty array when all required fields are filled', () => {
      const values: WizardValues = {
        ...DEFAULT_WIZARD_VALUES,
        recreationType: 'SIT',
        featureType: 'Polygon',
        metadata: {
          ...DEFAULT_WIZARD_VALUES.metadata,
          email: 'user@example.com',
          telephone: '6045550100',
          contactName: 'John Doe',
          districtCode: 'DCC',
          recreationDistrict: 'RDCC',
        },
      };

      const result = getMissingRequiredFields(values);
      expect(result).toEqual([]);
    });

    it('returns recreationType when empty', () => {
      const values: WizardValues = {
        ...DEFAULT_WIZARD_VALUES,
        recreationType: '',
        featureType: 'Polygon',
        metadata: {
          ...DEFAULT_WIZARD_VALUES.metadata,
          email: 'user@example.com',
          telephone: '6045550100',
          contactName: 'John Doe',
          districtCode: 'DCC',
          recreationDistrict: 'RDCC',
        },
      };

      const result = getMissingRequiredFields(values);
      expect(result).toContain('recreationType');
    });

    it('returns featureType when empty', () => {
      const values: WizardValues = {
        ...DEFAULT_WIZARD_VALUES,
        recreationType: 'SIT',
        featureType: '',
        metadata: {
          ...DEFAULT_WIZARD_VALUES.metadata,
          email: 'user@example.com',
          telephone: '6045550100',
          contactName: 'John Doe',
          districtCode: 'DCC',
          recreationDistrict: 'RDCC',
        },
      };

      const result = getMissingRequiredFields(values);
      expect(result).toContain('featureType');
    });

    it('returns email when empty', () => {
      const values: WizardValues = {
        ...DEFAULT_WIZARD_VALUES,
        recreationType: 'SIT',
        featureType: 'Polygon',
        metadata: {
          ...DEFAULT_WIZARD_VALUES.metadata,
          email: '',
          telephone: '6045550100',
          contactName: 'John Doe',
          districtCode: 'DCC',
          recreationDistrict: 'RDCC',
        },
      };

      const result = getMissingRequiredFields(values);
      expect(result).toContain('email');
    });

    it('returns telephone when empty', () => {
      const values: WizardValues = {
        ...DEFAULT_WIZARD_VALUES,
        recreationType: 'SIT',
        featureType: 'Polygon',
        metadata: {
          ...DEFAULT_WIZARD_VALUES.metadata,
          email: 'user@example.com',
          telephone: '',
          contactName: 'John Doe',
          districtCode: 'DCC',
          recreationDistrict: 'RDCC',
        },
      };

      const result = getMissingRequiredFields(values);
      expect(result).toContain('telephone');
    });

    it('returns contactName when empty', () => {
      const values: WizardValues = {
        ...DEFAULT_WIZARD_VALUES,
        recreationType: 'SIT',
        featureType: 'Polygon',
        metadata: {
          ...DEFAULT_WIZARD_VALUES.metadata,
          email: 'user@example.com',
          telephone: '6045550100',
          contactName: '',
          districtCode: 'DCC',
          recreationDistrict: 'RDCC',
        },
      };

      const result = getMissingRequiredFields(values);
      expect(result).toContain('contactName');
    });

    it('returns districtCode when empty', () => {
      const values: WizardValues = {
        ...DEFAULT_WIZARD_VALUES,
        recreationType: 'SIT',
        featureType: 'Polygon',
        metadata: {
          ...DEFAULT_WIZARD_VALUES.metadata,
          email: 'user@example.com',
          telephone: '6045550100',
          contactName: 'John Doe',
          districtCode: '',
          recreationDistrict: 'RDCC',
        },
      };

      const result = getMissingRequiredFields(values);
      expect(result).toContain('districtCode');
    });

    it('returns recreationDistrict when empty', () => {
      const values: WizardValues = {
        ...DEFAULT_WIZARD_VALUES,
        recreationType: 'SIT',
        featureType: 'Polygon',
        metadata: {
          ...DEFAULT_WIZARD_VALUES.metadata,
          email: 'user@example.com',
          telephone: '6045550100',
          contactName: 'John Doe',
          districtCode: 'DCC',
          recreationDistrict: '',
        },
      };

      const result = getMissingRequiredFields(values);
      expect(result).toContain('recreationDistrict');
    });

    it('returns multiple missing fields', () => {
      const values: WizardValues = {
        ...DEFAULT_WIZARD_VALUES,
        recreationType: '',
        featureType: '',
        metadata: {
          ...DEFAULT_WIZARD_VALUES.metadata,
          email: '',
          telephone: '',
          contactName: '',
          districtCode: '',
          recreationDistrict: '',
        },
      };

      const result = getMissingRequiredFields(values);
      expect(result).toHaveLength(7);
      expect(result).toContain('recreationType');
      expect(result).toContain('featureType');
      expect(result).toContain('email');
      expect(result).toContain('telephone');
      expect(result).toContain('contactName');
      expect(result).toContain('districtCode');
      expect(result).toContain('recreationDistrict');
    });

    it('treats whitespace-only values as missing', () => {
      const values: WizardValues = {
        ...DEFAULT_WIZARD_VALUES,
        recreationType: '   ',
        featureType: 'Polygon',
        metadata: {
          ...DEFAULT_WIZARD_VALUES.metadata,
          email: '  ',
          telephone: '6045550100',
          contactName: '\t\n',
          districtCode: 'DCC',
          recreationDistrict: 'RDCC',
        },
      };

      const result = getMissingRequiredFields(values);
      expect(result).toContain('recreationType');
      expect(result).toContain('email');
      expect(result).toContain('contactName');
    });
  });

  describe('requiresSectionIdsForFeatureCollection', () => {
    it('returns true for LineString geometry', () => {
      const featureCollection = {
        features: [
          {
            geometry: { type: 'LineString' },
          },
        ],
      };

      expect(requiresSectionIdsForFeatureCollection(featureCollection)).toBe(
        true,
      );
    });

    it('returns true for MultiLineString geometry', () => {
      const featureCollection = {
        features: [
          {
            geometry: { type: 'MultiLineString' },
          },
        ],
      };

      expect(requiresSectionIdsForFeatureCollection(featureCollection)).toBe(
        true,
      );
    });

    it('returns true for Point geometry', () => {
      const featureCollection = {
        features: [
          {
            geometry: { type: 'Point' },
          },
        ],
      };

      expect(requiresSectionIdsForFeatureCollection(featureCollection)).toBe(
        true,
      );
    });

    it('returns false for Polygon geometry', () => {
      const featureCollection = {
        features: [
          {
            geometry: { type: 'Polygon' },
          },
        ],
      };

      expect(requiresSectionIdsForFeatureCollection(featureCollection)).toBe(
        false,
      );
    });

    it('returns false for MultiPolygon geometry', () => {
      const featureCollection = {
        features: [
          {
            geometry: { type: 'MultiPolygon' },
          },
        ],
      };

      expect(requiresSectionIdsForFeatureCollection(featureCollection)).toBe(
        false,
      );
    });

    it('returns false when no features exist', () => {
      const featureCollection = {
        features: [],
      };

      expect(requiresSectionIdsForFeatureCollection(featureCollection)).toBe(
        false,
      );
    });

    it('returns false when featureCollection is null', () => {
      expect(requiresSectionIdsForFeatureCollection(null)).toBe(false);
    });

    it('returns false when features array is undefined', () => {
      const featureCollection = {
        features: undefined,
      };

      expect(requiresSectionIdsForFeatureCollection(featureCollection)).toBe(
        false,
      );
    });

    it('returns false when first feature has no geometry', () => {
      const featureCollection = {
        features: [
          {
            geometry: undefined,
          },
        ],
      };

      expect(requiresSectionIdsForFeatureCollection(featureCollection)).toBe(
        false,
      );
    });

    it('checks only the first feature geometry type', () => {
      const featureCollection = {
        features: [
          {
            geometry: { type: 'Polygon' },
          },
          {
            geometry: { type: 'LineString' },
          },
          {
            geometry: { type: 'Point' },
          },
        ],
      };

      // Should return false because first feature is Polygon
      expect(requiresSectionIdsForFeatureCollection(featureCollection)).toBe(
        false,
      );
    });

    it('returns true when first feature is LineString even if others are Polygon', () => {
      const featureCollection = {
        features: [
          {
            geometry: { type: 'LineString' },
          },
          {
            geometry: { type: 'Polygon' },
          },
        ],
      };

      // Should return true because first feature is LineString
      expect(requiresSectionIdsForFeatureCollection(featureCollection)).toBe(
        true,
      );
    });

    it('handles undefined geometry type gracefully', () => {
      const featureCollection = {
        features: [
          {
            geometry: { type: undefined },
          },
        ],
      };

      expect(requiresSectionIdsForFeatureCollection(featureCollection)).toBe(
        false,
      );
    });

    it('handles null geometry gracefully', () => {
      const featureCollection = {
        features: [
          {
            geometry: null,
          },
        ],
      };

      expect(requiresSectionIdsForFeatureCollection(featureCollection)).toBe(
        false,
      );
    });

    it('is case-sensitive for geometry type', () => {
      const featureCollection = {
        features: [
          {
            geometry: { type: 'polygon' }, // lowercase
          },
        ],
      };

      // Should return true because 'polygon' !== 'Polygon'
      expect(requiresSectionIdsForFeatureCollection(featureCollection)).toBe(
        true,
      );
    });
  });
});
