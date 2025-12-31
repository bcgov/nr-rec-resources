import { UpdateFeaturesDto } from '@/recreation-resources/features/dtos/update-features.dto';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';

describe('UpdateFeaturesDto', () => {
  describe('validation', () => {
    it('should pass validation with valid feature codes array', async () => {
      const dto = new UpdateFeaturesDto();
      dto.feature_codes = ['A1', 'B2', 'X0'];

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should pass validation with empty array', async () => {
      const dto = new UpdateFeaturesDto();
      dto.feature_codes = [];

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should pass validation with single feature code', async () => {
      const dto = new UpdateFeaturesDto();
      dto.feature_codes = ['A1'];

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should fail validation when feature_codes is not an array', async () => {
      const dto = new UpdateFeaturesDto();
      (dto as any).feature_codes = 'not-an-array';

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0]!.property).toBe('feature_codes');
      expect(errors[0]!.constraints).toHaveProperty('isArray');
    });

    it('should fail validation when feature_codes contains non-string values', async () => {
      const dto = new UpdateFeaturesDto();
      dto.feature_codes = ['A1', 123 as any, 'X0'];

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0]!.property).toBe('feature_codes');
      expect(errors[0]!.constraints).toHaveProperty('isString');
    });

    it('should fail validation when feature_codes contains null values', async () => {
      const dto = new UpdateFeaturesDto();
      dto.feature_codes = ['A1', null as any, 'X0'];

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0]!.property).toBe('feature_codes');
      expect(errors[0]!.constraints).toHaveProperty('isString');
    });

    it('should fail validation when feature_codes contains undefined values', async () => {
      const dto = new UpdateFeaturesDto();
      dto.feature_codes = ['A1', undefined as any, 'X0'];

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0]!.property).toBe('feature_codes');
      expect(errors[0]!.constraints).toHaveProperty('isString');
    });

    it('should fail validation when feature_codes contains empty strings', async () => {
      const dto = new UpdateFeaturesDto();
      dto.feature_codes = ['A1', '', 'X0'];

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0]!.property).toBe('feature_codes');
      expect(errors[0]!.constraints).toHaveProperty('isNotEmpty');
    });
  });
});
