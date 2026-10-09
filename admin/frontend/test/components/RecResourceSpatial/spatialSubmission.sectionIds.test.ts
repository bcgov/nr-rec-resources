import { describe, it, expect } from 'vitest';
import {
  extractSectionIdDetails,
  prepareFeatureCollectionForSectionEditing,
  updateFeatureSectionId,
} from '@/components/RecResourceSpatial/spatialSubmissionUtils';

describe('spatialSubmission.sectionIds', () => {
  describe('prepareFeatureCollectionForSectionEditing', () => {
    it('uses section_id field when present', () => {
      const featureCollection = {
        features: [
          {
            properties: { section_id: 'Section 1' },
            geometry: {},
          },
          {
            properties: { section_id: 'Section 2' },
            geometry: {},
          },
        ],
      };

      const result =
        prepareFeatureCollectionForSectionEditing(featureCollection);

      expect(result.fieldName).toBe('section_id');
      expect(result.featureCollection.features[0].properties.section_id).toBe(
        'Section 1',
      );
      expect(result.featureCollection.features[1].properties.section_id).toBe(
        'Section 2',
      );
    });

    it('uses SECTIONID field when section_id is not present', () => {
      const featureCollection = {
        features: [
          {
            properties: { SECTIONID: 'Section 1' },
            geometry: {},
          },
          {
            properties: { SECTIONID: 'Section 2' },
            geometry: {},
          },
        ],
      };

      const result =
        prepareFeatureCollectionForSectionEditing(featureCollection);

      expect(result.fieldName).toBe('SECTIONID');
      expect(result.sourceFieldName).toBe('SECTIONID');
    });

    it('uses segment_id field when section_id is not present', () => {
      const featureCollection = {
        features: [
          {
            properties: { segment_id: 'Segment 1' },
            geometry: {},
          },
        ],
      };

      const result =
        prepareFeatureCollectionForSectionEditing(featureCollection);

      expect(result.sourceFieldName).toBe('segment_id');
    });

    it('uses default field name when no section ID field is found', () => {
      const featureCollection = {
        features: [
          {
            properties: { name: 'Feature 1' },
            geometry: {},
          },
        ],
      };

      const result =
        prepareFeatureCollectionForSectionEditing(featureCollection);

      expect(result.fieldName).toBe('section_id');
    });

    it('handles empty features array', () => {
      const featureCollection = {
        features: [],
      };

      const result =
        prepareFeatureCollectionForSectionEditing(featureCollection);

      expect(result.fieldName).toBe('section_id');
      expect(result.featureCollection.features).toEqual([]);
    });

    it('handles null featureCollection', () => {
      const result = prepareFeatureCollectionForSectionEditing(null);

      expect(result.fieldName).toBe('section_id');
      expect(result.featureCollection.features).toEqual([]);
    });

    it('handles features with no properties', () => {
      const featureCollection = {
        features: [
          {
            geometry: {},
          },
        ],
      };

      const result =
        prepareFeatureCollectionForSectionEditing(featureCollection);

      expect(result.fieldName).toBe('section_id');
      expect(result.featureCollection.features[0].properties.section_id).toBe(
        '',
      );
    });

    it('preserves other properties while adding section_id field', () => {
      const featureCollection = {
        features: [
          {
            properties: { name: 'Feature 1', type: 'test' },
            geometry: {},
          },
        ],
      };

      const result =
        prepareFeatureCollectionForSectionEditing(featureCollection);

      expect(result.featureCollection.features[0].properties.name).toBe(
        'Feature 1',
      );
      expect(result.featureCollection.features[0].properties.type).toBe('test');
      expect(result.featureCollection.features[0].properties.section_id).toBe(
        '',
      );
    });

    it('trims whitespace from section IDs', () => {
      const featureCollection = {
        features: [
          {
            properties: { section_id: '  Section 1  ' },
            geometry: {},
          },
        ],
      };

      const result =
        prepareFeatureCollectionForSectionEditing(featureCollection);

      expect(result.featureCollection.features[0].properties.section_id).toBe(
        'Section 1',
      );
    });

    it('uses map_label field as fallback when no section ID field exists', () => {
      const featureCollection = {
        features: [
          {
            properties: { map_label: 'Label-Section 1' },
            geometry: {},
          },
        ],
      };

      const result =
        prepareFeatureCollectionForSectionEditing(featureCollection);

      expect(result.sourceFieldName).toBe('map_label');
    });

    it('extracts last word from map_label when used as fallback', () => {
      const featureCollection = {
        features: [
          {
            properties: { map_label: 'Trail Loop  Section' },
            geometry: {},
          },
        ],
      };

      const result =
        prepareFeatureCollectionForSectionEditing(featureCollection);

      expect(result.featureCollection.features[0].properties.section_id).toBe(
        'Section',
      );
    });

    it('handles feature properties with null or undefined values', () => {
      const featureCollection = {
        features: [
          {
            properties: { section_id: null },
            geometry: {},
          },
          {
            properties: { section_id: undefined },
            geometry: {},
          },
        ],
      };

      const result =
        prepareFeatureCollectionForSectionEditing(featureCollection);

      expect(result.featureCollection.features[0].properties.section_id).toBe(
        '',
      );
      expect(result.featureCollection.features[1].properties.section_id).toBe(
        '',
      );
    });
  });

  describe('updateFeatureSectionId', () => {
    it('updates section ID for specified feature', () => {
      const featureCollection = {
        features: [
          { properties: { section_id: 'Section 1' } },
          { properties: { section_id: 'Section 2' } },
        ],
      };

      const result = updateFeatureSectionId(
        featureCollection,
        1,
        'section_id',
        'Updated Section 2',
      );

      expect(result.features[0].properties.section_id).toBe('Section 1');
      expect(result.features[1].properties.section_id).toBe(
        'Updated Section 2',
      );
    });

    it('does not mutate original feature collection', () => {
      const featureCollection = {
        features: [
          { properties: { section_id: 'Section 1' } },
          { properties: { section_id: 'Section 2' } },
        ],
      };

      updateFeatureSectionId(
        featureCollection,
        0,
        'section_id',
        'Updated Section 1',
      );

      expect(featureCollection.features[0].properties.section_id).toBe(
        'Section 1',
      );
    });

    it('handles null featureCollection', () => {
      const result = updateFeatureSectionId(
        null,
        0,
        'section_id',
        'New Section',
      );

      expect(result.features).toEqual([]);
    });

    it('handles empty features array', () => {
      const featureCollection = { features: [] };

      const result = updateFeatureSectionId(
        featureCollection,
        0,
        'section_id',
        'New Section',
      );

      expect(result.features).toEqual([]);
    });

    it('adds field if it does not exist', () => {
      const featureCollection = {
        features: [{ properties: { name: 'Feature 1' } }],
      };

      const result = updateFeatureSectionId(
        featureCollection,
        0,
        'section_id',
        'New Section',
      );

      expect(result.features[0].properties.section_id).toBe('New Section');
      expect(result.features[0].properties.name).toBe('Feature 1');
    });

    it('preserves other properties while updating', () => {
      const featureCollection = {
        features: [
          { properties: { section_id: 'Old', name: 'Test', type: 'line' } },
        ],
      };

      const result = updateFeatureSectionId(
        featureCollection,
        0,
        'section_id',
        'New',
      );

      expect(result.features[0].properties.section_id).toBe('New');
      expect(result.features[0].properties.name).toBe('Test');
      expect(result.features[0].properties.type).toBe('line');
    });

    it('handles feature with no properties', () => {
      const featureCollection = {
        features: [{ geometry: {} }],
      };

      const result = updateFeatureSectionId(
        featureCollection,
        0,
        'section_id',
        'New Section',
      );

      expect(result.features[0].properties.section_id).toBe('New Section');
    });

    it('updates correct feature by index', () => {
      const featureCollection = {
        features: [
          { properties: { section_id: 'A' } },
          { properties: { section_id: 'B' } },
          { properties: { section_id: 'C' } },
        ],
      };

      const result = updateFeatureSectionId(
        featureCollection,
        1,
        'section_id',
        'Updated B',
      );

      expect(result.features[0].properties.section_id).toBe('A');
      expect(result.features[1].properties.section_id).toBe('Updated B');
      expect(result.features[2].properties.section_id).toBe('C');
    });
  });

  describe('extractSectionIdDetails', () => {
    it('extracts section IDs from features', () => {
      const featureCollection = {
        features: [
          { properties: { section_id: 'Section 1' }, geometry: {} },
          { properties: { section_id: 'Section 2' }, geometry: {} },
        ],
      };

      const result = extractSectionIdDetails(featureCollection);

      expect(result.fieldName).toBe('section_id');
      expect(result.sectionIds).toEqual(['Section 1', 'Section 2']);
      expect(result.featureSectionIds).toHaveLength(2);
      expect(result.issues).toEqual([]);
    });

    it('returns error for missing section IDs', () => {
      const featureCollection = {
        features: [
          { properties: { section_id: null }, geometry: {} },
          { properties: { section_id: 'Section 2' }, geometry: {} },
        ],
      };

      const result = extractSectionIdDetails(featureCollection);

      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].type).toBe('SECTION_ID');
      expect(result.issues[0].severity).toBe('ERROR');
      expect(result.issues[0].message).toContain('missing');
      expect(result.issues[0].message).toContain('#1');
    });

    it('detects duplicate section IDs', () => {
      const featureCollection = {
        features: [
          { properties: { section_id: 'Duplicate' }, geometry: {} },
          { properties: { section_id: 'Unique' }, geometry: {} },
          { properties: { section_id: 'Duplicate' }, geometry: {} },
        ],
      };

      const result = extractSectionIdDetails(featureCollection);

      const duplicateIssues = result.issues.filter((issue) =>
        issue.message.includes('used by'),
      );
      expect(duplicateIssues.length).toBeGreaterThan(0);
      expect(duplicateIssues[0].severity).toBe('ERROR');
    });

    it('returns warning when no section ID field is found', () => {
      const featureCollection = {
        features: [{ properties: { name: 'Feature 1' }, geometry: {} }],
      };

      const result = extractSectionIdDetails(featureCollection);

      expect(result.fieldName).toBeNull();
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues[0].type).toBe('ATTRIBUTE');
      expect(result.issues[0].severity).toBe('WARNING');
    });

    it('handles empty features array', () => {
      const featureCollection = { features: [] };

      const result = extractSectionIdDetails(featureCollection);

      expect(result.fieldName).toBeNull();
      expect(result.sectionIds).toEqual([]);
      expect(result.featureSectionIds).toEqual([]);
      expect(result.issues).toEqual([]);
    });

    it('handles null featureCollection', () => {
      const result = extractSectionIdDetails(null);

      expect(result.fieldName).toBeNull();
      expect(result.sectionIds).toEqual([]);
      expect(result.featureSectionIds).toEqual([]);
    });

    it('sorts section IDs alphanumerically', () => {
      const featureCollection = {
        features: [
          { properties: { section_id: 'Section 3' }, geometry: {} },
          { properties: { section_id: 'Section 1' }, geometry: {} },
          { properties: { section_id: 'Section 20' }, geometry: {} },
          { properties: { section_id: 'Section 2' }, geometry: {} },
        ],
      };

      const result = extractSectionIdDetails(featureCollection);

      expect(result.sectionIds).toEqual([
        'Section 1',
        'Section 2',
        'Section 3',
        'Section 20',
      ]);
    });

    it('includes feature indices in results', () => {
      const featureCollection = {
        features: [
          { properties: { section_id: 'Section 1' }, geometry: {} },
          { properties: { section_id: 'Section 2' }, geometry: {} },
          { properties: { section_id: 'Section 3' }, geometry: {} },
        ],
      };

      const result = extractSectionIdDetails(featureCollection);

      expect(result.featureSectionIds[0].featureIndex).toBe(1);
      expect(result.featureSectionIds[1].featureIndex).toBe(2);
      expect(result.featureSectionIds[2].featureIndex).toBe(3);
    });

    it('handles features with no properties', () => {
      const featureCollection = {
        features: [
          { geometry: {} },
          { properties: { section_id: 'Section 1' }, geometry: {} },
        ],
      };

      const result = extractSectionIdDetails(featureCollection);

      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('trims whitespace from section IDs', () => {
      const featureCollection = {
        features: [
          { properties: { section_id: '  Section 1  ' }, geometry: {} },
          { properties: { section_id: '\tSection 2\n' }, geometry: {} },
        ],
      };

      const result = extractSectionIdDetails(featureCollection);

      expect(result.sectionIds).toContain('Section 1');
      expect(result.sectionIds).toContain('Section 2');
    });

    it('handles map_label as fallback field', () => {
      const featureCollection = {
        features: [
          { properties: { map_label: 'Map Label 1' }, geometry: {} },
          { properties: { map_label: 'Map Label 2' }, geometry: {} },
        ],
      };

      const result = extractSectionIdDetails(featureCollection);

      // Should find and use map_label since no section_id exists
      expect(result.fieldName).toBe('map_label');
    });

    it('extracts last word from map_label', () => {
      const featureCollection = {
        features: [
          { properties: { map_label: 'Trail Loop  Section' }, geometry: {} },
        ],
      };

      const result = extractSectionIdDetails(featureCollection);

      expect(result.sectionIds[0]).toBe('Section');
    });

    it('reports multiple missing features correctly', () => {
      const featureCollection = {
        features: [
          { properties: { section_id: null }, geometry: {} },
          { properties: { section_id: 'Present' }, geometry: {} },
          { properties: { section_id: undefined }, geometry: {} },
          { properties: { section_id: 'Also Present' }, geometry: {} },
          { properties: { section_id: '' }, geometry: {} },
        ],
      };

      const result = extractSectionIdDetails(featureCollection);

      const missingIssue = result.issues.find((issue) =>
        issue.message.includes('missing'),
      );
      expect(missingIssue?.message).toContain('3 feature(s)');
    });
  });
});
