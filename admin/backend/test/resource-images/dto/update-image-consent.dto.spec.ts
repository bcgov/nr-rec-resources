import {
  UpdateImageConsentDto,
  UpdateImageConsentPatchDto,
} from '@/resource-images/dto/update-image-consent.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';

describe('UpdateImageConsentDto', () => {
  it('should validate with valid optional fields', async () => {
    const dto = plainToInstance(UpdateImageConsentDto, {
      file_name: 'Sunset view',
      date_taken: '2025-02-01',
      contains_pii: 'true',
      photographer_type: 'STAFF',
      photographer_name: 'Jane Doe',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.contains_pii).toBe(true);
  });

  it('should fail validation for invalid date format', async () => {
    const dto = plainToInstance(UpdateImageConsentDto, {
      date_taken: '02-01-2025',
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]?.property).toBe('date_taken');
  });
});

describe('UpdateImageConsentPatchDto', () => {
  it('should validate with valid metadata fields', async () => {
    const dto = plainToInstance(UpdateImageConsentPatchDto, {
      file_name: 'Sunset view',
      date_taken: '2025-02-01',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should fail validation for invalid date format', async () => {
    const dto = plainToInstance(UpdateImageConsentPatchDto, {
      date_taken: '02-01-2025',
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]?.property).toBe('date_taken');
  });
});
