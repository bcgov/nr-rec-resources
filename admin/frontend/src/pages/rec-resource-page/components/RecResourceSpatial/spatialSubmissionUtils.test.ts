import { describe, expect, it } from 'vitest';
import {
  extractSectionIdDetails,
  prepareFeatureCollectionForSectionEditing,
  updateFeatureSectionId,
} from './spatialSubmissionUtils';

describe('extractSectionIdDetails', () => {
  it('extracts unique section IDs from a section_id field', () => {
    const featureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { section_id: '10' },
          geometry: null,
        },
        {
          type: 'Feature',
          properties: { section_id: '2' },
          geometry: null,
        },
        {
          type: 'Feature',
          properties: { section_id: '10' },
          geometry: null,
        },
      ],
    };

    expect(extractSectionIdDetails(featureCollection)).toEqual({
      fieldName: 'section_id',
      sectionIds: ['2', '10'],
      featureSectionIds: [
        { featureIndex: 1, sectionId: '10' },
        { featureIndex: 2, sectionId: '2' },
        { featureIndex: 3, sectionId: '10' },
      ],
      issues: [
        {
          type: 'SECTION_ID',
          severity: 'ERROR',
          message:
            'Section ID "10" is used by 2 features (#1, #3); each feature should have a unique section_id.',
          code: 'SECTION_ID_DUPLICATE',
        },
      ],
    });
  });

  it('detects alternate segment id field names', () => {
    const featureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { SegmentID: 7 },
          geometry: null,
        },
        {
          type: 'Feature',
          properties: { SegmentID: 12 },
          geometry: null,
        },
      ],
    };

    expect(extractSectionIdDetails(featureCollection)).toEqual({
      fieldName: 'SegmentID',
      sectionIds: ['7', '12'],
      featureSectionIds: [
        { featureIndex: 1, sectionId: '7' },
        { featureIndex: 2, sectionId: '12' },
      ],
      issues: [],
    });
  });

  it('returns an empty list when no section-like id field exists', () => {
    const featureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'test' },
          geometry: null,
        },
      ],
    };

    expect(extractSectionIdDetails(featureCollection)).toEqual({
      fieldName: null,
      sectionIds: [],
      featureSectionIds: [],
      issues: [
        {
          type: 'ATTRIBUTE',
          severity: 'WARNING',
          message:
            'No Section ID field was found among the uploaded attributes (name). Expected a field such as SECTION_ID.',
        },
      ],
    });
  });

  it('creates an editable section_id field from MAP_LABEL when needed', () => {
    const featureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { MAP_LABEL: 'REC123 River Way South' },
          geometry: null,
        },
      ],
    };

    expect(
      prepareFeatureCollectionForSectionEditing(featureCollection),
    ).toEqual({
      featureCollection: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              MAP_LABEL: 'REC123 River Way South',
              section_id: 'South',
            },
            geometry: null,
          },
        ],
      },
      fieldName: 'section_id',
      sourceFieldName: 'MAP_LABEL',
    });
  });

  it('updates a single feature section id in-place', () => {
    const featureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { section_id: 'River Way South' },
          geometry: null,
        },
        {
          type: 'Feature',
          properties: { section_id: 'North Loop 1' },
          geometry: null,
        },
      ],
    };

    expect(
      updateFeatureSectionId(
        featureCollection,
        1,
        'section_id',
        'North Loop Renamed',
      ),
    ).toEqual({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { section_id: 'River Way South' },
          geometry: null,
        },
        {
          type: 'Feature',
          properties: { section_id: 'North Loop Renamed' },
          geometry: null,
        },
      ],
    });
  });
});
