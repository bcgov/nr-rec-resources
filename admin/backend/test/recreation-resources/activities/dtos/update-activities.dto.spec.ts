import { UpdateActivitiesDto } from '@/recreation-resources/activities/dtos/update-activities.dto';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';

describe('UpdateActivitiesDto', () => {
  describe('validation', () => {
    it('should pass validation with valid activity codes array', async () => {
      const dto = new UpdateActivitiesDto();
      dto.activity_codes = [1, 2, 3];

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should pass validation with empty array', async () => {
      const dto = new UpdateActivitiesDto();
      dto.activity_codes = [];

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should pass validation with single activity code', async () => {
      const dto = new UpdateActivitiesDto();
      dto.activity_codes = [1];

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should fail validation when activity_codes is not an array', async () => {
      const dto = new UpdateActivitiesDto();
      (dto as any).activity_codes = 'not-an-array';

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0]!.property).toBe('activity_codes');
      expect(errors[0]!.constraints).toHaveProperty('isArray');
    });

    it('should fail validation when activity_codes contains non-number values', async () => {
      const dto = new UpdateActivitiesDto();
      dto.activity_codes = [1, 'invalid' as any, 3];

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0]!.property).toBe('activity_codes');
      expect(errors[0]!.constraints).toHaveProperty('isNumber');
    });

    it('should fail validation when activity_codes contains null values', async () => {
      const dto = new UpdateActivitiesDto();
      dto.activity_codes = [1, null as any, 3];

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0]!.property).toBe('activity_codes');
      expect(errors[0]!.constraints).toHaveProperty('isNumber');
    });

    it('should fail validation when activity_codes contains undefined values', async () => {
      const dto = new UpdateActivitiesDto();
      dto.activity_codes = [1, undefined as any, 3];

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0]!.property).toBe('activity_codes');
      expect(errors[0]!.constraints).toHaveProperty('isNumber');
    });

    it('should pass validation with large array of numbers', async () => {
      const dto = new UpdateActivitiesDto();
      dto.activity_codes = Array.from({ length: 100 }, (_, i) => i + 1);

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should pass validation with zero as activity code', async () => {
      const dto = new UpdateActivitiesDto();
      dto.activity_codes = [0, 1, 2];

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should pass validation with negative numbers (validation allows, business logic may reject)', async () => {
      const dto = new UpdateActivitiesDto();
      dto.activity_codes = [-1, 1, 2];

      const errors = await validate(dto);

      // Note: isNumber validator allows negative numbers
      // Business logic should handle validation of valid activity codes
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with decimal numbers (validation allows, business logic may reject)', async () => {
      const dto = new UpdateActivitiesDto();
      dto.activity_codes = [1.5, 2.7, 3];

      const errors = await validate(dto);

      // Note: isNumber validator allows decimals
      // Business logic should handle validation of valid activity codes
      expect(errors).toHaveLength(0);
    });
  });
});
