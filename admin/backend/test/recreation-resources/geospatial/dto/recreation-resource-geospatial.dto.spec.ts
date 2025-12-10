import { describe, it, expect } from 'vitest';
import { RecreationResourceGeospatialDto } from '@/recreation-resources/geospatial/dto/recreation-resource-geospatial.dto';

describe('RecreationResourceGeospatialDto', () => {
  it('maps plain object fields onto the DTO instance', () => {
    const payload = {
      rec_resource_id: 'REC100',
      spatial_feature_geometry: ['{"type":"Polygon","coordinates":[]}'],
      site_point_geometry: '{"type":"Point","coordinates":[1,2]}',
      utm_zone: 10,
      utm_easting: 500000,
      utm_northing: 5450000,
      latitude: 53.123,
      longitude: -127.123,
    };

    const dto = Object.assign(new RecreationResourceGeospatialDto(), payload);

    expect(dto.rec_resource_id).toBe(payload.rec_resource_id);
    expect(dto.spatial_feature_geometry).toEqual(
      payload.spatial_feature_geometry,
    );
    expect(dto.site_point_geometry).toBe(payload.site_point_geometry);
    expect(dto.utm_zone).toBe(payload.utm_zone);
    expect(dto.utm_easting).toBe(payload.utm_easting);
    expect(dto.utm_northing).toBe(payload.utm_northing);
    expect(dto.latitude).toBe(payload.latitude);
    expect(dto.longitude).toBe(payload.longitude);
  });

  it('allows optional fields to be undefined when omitted', () => {
    const payload = { rec_resource_id: 'REC_ONLY' };
    const dto = Object.assign(new RecreationResourceGeospatialDto(), payload);

    expect(dto.rec_resource_id).toBe('REC_ONLY');
    expect(dto.spatial_feature_geometry).toBeUndefined();
    expect(dto.site_point_geometry).toBeUndefined();
    expect(dto.utm_zone).toBeUndefined();
    expect(dto.utm_easting).toBeUndefined();
    expect(dto.utm_northing).toBeUndefined();
    expect(dto.latitude).toBeUndefined();
    expect(dto.longitude).toBeUndefined();
  });

  it('accepts explicit null values for nullable numeric fields', () => {
    const payload = {
      rec_resource_id: 'REC_NULLS',
      utm_zone: null,
      utm_easting: null,
      utm_northing: null,
      latitude: null,
      longitude: null,
    } as any;

    const dto = Object.assign(new RecreationResourceGeospatialDto(), payload);

    expect(dto.rec_resource_id).toBe('REC_NULLS');
    expect(dto.utm_zone).toBeNull();
    expect(dto.utm_easting).toBeNull();
    expect(dto.utm_northing).toBeNull();
    expect(dto.latitude).toBeNull();
    expect(dto.longitude).toBeNull();
  });
});
