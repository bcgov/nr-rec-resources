import { describe, it, expect } from 'vitest';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateRecreationResourceGeospatialDto } from '@/recreation-resources/geospatial/dto/update-recreation-resource-geospatial.dto';

describe('UpdateRecreationResourceGeospatialDto validation', () => {
  it('accepts valid feature arrays and optional metadata', async () => {
    const payload = {
      newFeatures: [
        {
          geometry: { type: 'Polygon', coordinates: [] },
          section_id: 'River Way South',
        },
      ],
      amendedFeatures: [],
      retiredFeatures: [],
      recreation_type_code: 'SIT',
      submitted_by: 'sam.user@gov.bc.ca',
    };

    const dto = plainToInstance(UpdateRecreationResourceGeospatialDto, payload);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('accepts empty feature arrays when optional', async () => {
    const payload = {
      newFeatures: [],
      amendedFeatures: [],
      retiredFeatures: [],
    };

    const dto = plainToInstance(UpdateRecreationResourceGeospatialDto, payload);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('fails when newFeatures is missing or not an array', async () => {
    const payload = {
      newFeatures: 'not-an-array',
      amendedFeatures: [],
      retiredFeatures: [],
    };

    const dto = plainToInstance(UpdateRecreationResourceGeospatialDto, payload);
    const errors = await validate(dto);
    const featureError = errors.find((e) => e.property === 'newFeatures');
    expect(featureError).toBeDefined();
    expect(featureError?.constraints).toBeDefined();
    expect(Object.keys(featureError!.constraints!)).toContain('isArray');
  });

  it('fails when nested feature geometry is invalid or missing', async () => {
    const payload = {
      newFeatures: [
        {
          geometry: 'invalid-geometry-type', // Should be an object/record
        },
      ],
      amendedFeatures: [],
      retiredFeatures: [],
    };

    const dto = plainToInstance(UpdateRecreationResourceGeospatialDto, payload);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const newFeaturesError = errors.find((e) => e.property === 'newFeatures');
    expect(newFeaturesError).toBeDefined();
  });
});
