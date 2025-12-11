import { describe, it, expect } from 'vitest';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateRecreationResourceGeospatialDto } from '@/recreation-resources/geospatial/dto/update-recreation-resource-geospatial.dto';

describe('UpdateRecreationResourceGeospatialDto validation', () => {
  it('accepts valid numeric inputs', async () => {
    const payload = {
      utm_zone: 10,
      utm_easting: 500000,
      utm_northing: 5450000,
    };

    const dto = plainToInstance(UpdateRecreationResourceGeospatialDto, payload);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('transforms numeric strings to numbers and validates successfully', async () => {
    const payload = {
      utm_zone: '10',
      utm_easting: '500000',
      utm_northing: '5450000',
    };

    const dto = plainToInstance(UpdateRecreationResourceGeospatialDto, payload);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('fails when utm_zone is not an integer', async () => {
    const payload = {
      utm_zone: 10.5,
      utm_easting: 500000,
      utm_northing: 5450000,
    };

    const dto = plainToInstance(UpdateRecreationResourceGeospatialDto, payload);
    const errors = await validate(dto);
    const zoneError = errors.find((e) => e.property === 'utm_zone');
    expect(zoneError).toBeDefined();
    expect(zoneError?.constraints).toBeDefined();
    expect(Object.keys(zoneError!.constraints!)).toContain('isInt');
  });

  it('fails when utm_zone is below minimum (1)', async () => {
    const payload = {
      utm_zone: 0,
      utm_easting: 500000,
      utm_northing: 5450000,
    };

    const dto = plainToInstance(UpdateRecreationResourceGeospatialDto, payload);
    const errors = await validate(dto);
    const zoneError = errors.find((e) => e.property === 'utm_zone');
    expect(zoneError).toBeDefined();
    expect(zoneError?.constraints).toBeDefined();
    expect(Object.keys(zoneError!.constraints!)).toContain('min');
  });

  it('fails when utm_zone is above maximum (60)', async () => {
    const payload = {
      utm_zone: 61,
      utm_easting: 500000,
      utm_northing: 5450000,
    };

    const dto = plainToInstance(UpdateRecreationResourceGeospatialDto, payload);
    const errors = await validate(dto);
    const zoneError = errors.find((e) => e.property === 'utm_zone');
    expect(zoneError).toBeDefined();
    expect(zoneError?.constraints).toBeDefined();
    expect(Object.keys(zoneError!.constraints!)).toContain('max');
  });

  it('fails when utm_easting is not positive', async () => {
    const payloads = [
      { utm_zone: 10, utm_easting: -1, utm_northing: 5450000 },
      { utm_zone: 10, utm_easting: 0, utm_northing: 5450000 },
    ];

    for (const payload of payloads) {
      const dto = plainToInstance(
        UpdateRecreationResourceGeospatialDto,
        payload,
      );
      const errors = await validate(dto);
      const eastError = errors.find((e) => e.property === 'utm_easting');
      expect(eastError).toBeDefined();
      expect(eastError?.constraints).toBeDefined();
      expect(Object.keys(eastError!.constraints!)).toContain('isPositive');
    }
  });

  it('fails when utm_northing is not positive', async () => {
    const payloads = [
      { utm_zone: 10, utm_easting: 500000, utm_northing: -5 },
      { utm_zone: 10, utm_easting: 500000, utm_northing: 0 },
    ];

    for (const payload of payloads) {
      const dto = plainToInstance(
        UpdateRecreationResourceGeospatialDto,
        payload,
      );
      const errors = await validate(dto);
      const northError = errors.find((e) => e.property === 'utm_northing');
      expect(northError).toBeDefined();
      expect(northError?.constraints).toBeDefined();
      expect(Object.keys(northError!.constraints!)).toContain('isPositive');
    }
  });
});
