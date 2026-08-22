import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { describe, it, expect } from 'vitest';
import {
  CreateRecreationAssetDto,
  UpdateRecreationAssetDto,
  RecreationAssetDto,
  UpdateAssetFieldsDto,
  RecreationAssetBulkUpdateDto,
} from '../../../src/resource-asset/dto/resource-asset.dto';

describe('Recreation Asset DTOs', () => {
  // Helper to transform plain JS object to class instance and validate it
  const validateDto = async <T extends object>(
    cls: new () => T,
    plain: Record<string, any>,
  ) => {
    const instance = plainToInstance(cls, plain);
    const errors = await validate(instance);
    return { instance, errors };
  };

  describe('CreateRecreationAssetDto / BaseRecreationAssetDto', () => {
    it('should validate successfully with valid complete data', async () => {
      const validPayload = {
        parent_id: 100,
        asset_tag: 'CS-012',
        rec_resource_id: 'REC1222',
        asset_code: 1,
        asset_name: 'Campsite #12 Table',
        asset_comment: 'Located near river',
        legacy_structure_id: 'LEG-884',
        asset_length: 12.5,
        asset_width: 3.0,
        asset_area: 37.5,
        default_value: 1500.0,
        actual_value: 1800.5,
        installation_date: '2023-05-15',
      };

      const { errors } = await validateDto(
        CreateRecreationAssetDto,
        validPayload,
      );
      expect(errors.length).toBe(0);
    });

    it('should validate successfully with minimal required fields and null/undefined optionals', async () => {
      const minimalPayload = {
        rec_resource_id: 'REC1222',
        asset_code: 1,
        parent_id: null,
        asset_tag: null,
        asset_name: null,
        asset_comment: null,
        legacy_structure_id: null,
        asset_length: null,
        asset_width: null,
        asset_area: null,
        default_value: null,
        actual_value: null,
        installation_date: null,
      };

      const { errors } = await validateDto(
        CreateRecreationAssetDto,
        minimalPayload,
      );
      expect(errors.length).toBe(0);
    });

    it('should fail when required fields (rec_resource_id, asset_code) are missing', async () => {
      const invalidPayload = {};

      const { errors } = await validateDto(
        CreateRecreationAssetDto,
        invalidPayload,
      );

      const properties = errors.map((e) => e.property);
      expect(properties).toContain('rec_resource_id');
      expect(properties).toContain('asset_code');
    });

    it('should fail when integer and number types are invalid', async () => {
      const invalidPayload = {
        rec_resource_id: 'REC123',
        asset_code: 'not-an-int',
        parent_id: 'not-an-int',
        asset_length: 'not-a-number',
        asset_width: 'not-a-number',
        asset_area: 'not-a-number',
        default_value: 'not-a-number',
        actual_value: 'not-a-number',
      };

      const { errors } = await validateDto(
        CreateRecreationAssetDto,
        invalidPayload,
      );

      const properties = errors.map((e) => e.property);
      expect(properties).toContain('asset_code');
      expect(properties).toContain('parent_id');
      expect(properties).toContain('asset_length');
      expect(properties).toContain('asset_width');
      expect(properties).toContain('asset_area');
      expect(properties).toContain('default_value');
      expect(properties).toContain('actual_value');
    });

    it('should transform numeric string inputs into numbers via @Type', async () => {
      const stringNumericPayload = {
        rec_resource_id: 'REC123',
        asset_code: '12',
        parent_id: '100',
        asset_length: '12.5',
      };

      const { instance, errors } = await validateDto(
        CreateRecreationAssetDto,
        stringNumericPayload,
      );

      expect(errors.length).toBe(0);
      expect(instance.asset_code).toBe(12);
      expect(instance.parent_id).toBe(100);
      expect(instance.asset_length).toBe(12.5);
    });

    it('should fail when string lengths exceed constraints', async () => {
      const overflowPayload = {
        rec_resource_id: 'A'.repeat(21), // Max 20
        asset_code: 1,
        asset_tag: 'B'.repeat(51), // Max 50
        asset_name: 'C'.repeat(201), // Max 200
        legacy_structure_id: 'D'.repeat(21), // Max 20
      };

      const { errors } = await validateDto(
        CreateRecreationAssetDto,
        overflowPayload,
      );

      const properties = errors.map((e) => e.property);
      expect(properties).toContain('rec_resource_id');
      expect(properties).toContain('asset_tag');
      expect(properties).toContain('asset_name');
      expect(properties).toContain('legacy_structure_id');
    });

    it('should fail when string types are invalid', async () => {
      const invalidTypesPayload = {
        rec_resource_id: 12345,
        asset_code: 1,
        asset_tag: 123,
        asset_name: 123,
        asset_comment: 123,
        legacy_structure_id: 123,
      };

      const { errors } = await validateDto(
        CreateRecreationAssetDto,
        invalidTypesPayload,
      );

      const properties = errors.map((e) => e.property);
      expect(properties).toContain('rec_resource_id');
      expect(properties).toContain('asset_tag');
      expect(properties).toContain('asset_name');
      expect(properties).toContain('asset_comment');
      expect(properties).toContain('legacy_structure_id');
    });

    it('should fail when installation_date is not a valid ISO date string', async () => {
      const invalidDatePayload = {
        rec_resource_id: 'REC123',
        asset_code: 1,
        installation_date: 'invalid-date',
      };

      const { errors } = await validateDto(
        CreateRecreationAssetDto,
        invalidDatePayload,
      );

      const properties = errors.map((e) => e.property);
      expect(properties).toContain('installation_date');
    });
  });

  describe('UpdateRecreationAssetDto & UpdateAssetFieldsDto', () => {
    it('should allow partial updates without requiring rec_resource_id or asset_code', async () => {
      const partialPayload = {
        asset_name: 'Updated Name',
        asset_area: 45.0,
      };

      const { errors: updateErrors } = await validateDto(
        UpdateRecreationAssetDto,
        partialPayload,
      );
      expect(updateErrors.length).toBe(0);

      const { errors: fieldErrors } = await validateDto(
        UpdateAssetFieldsDto,
        partialPayload,
      );
      expect(fieldErrors.length).toBe(0);
    });
  });

  describe('RecreationAssetDto', () => {
    it('should validate successfully when asset_id is provided', async () => {
      const validReadDto = {
        asset_id: 101,
        rec_resource_id: 'REC123',
        asset_code: 1,
        recreation_asset_repair: [],
      };

      const { errors } = await validateDto(RecreationAssetDto, validReadDto);
      expect(errors.length).toBe(0);
    });

    it('should fail when asset_id is missing or not an integer', async () => {
      const invalidReadDto = {
        rec_resource_id: 'REC123',
        asset_code: 1,
        asset_id: 'not-an-int',
      };

      const { errors } = await validateDto(RecreationAssetDto, invalidReadDto);

      const properties = errors.map((e) => e.property);
      expect(properties).toContain('asset_id');
    });
  });

  describe('RecreationAssetBulkUpdateDto', () => {
    it('should validate a valid bulk update payload', async () => {
      const validBulkPayload = {
        rec_resource_id: 'REC001',
        asset_ids: [101, 102, 103],
        update_fields: {
          asset_name: 'Bulk Updated Name',
          asset_area: 50.0,
          default_value: 2000.0,
        },
      };

      const { errors } = await validateDto(
        RecreationAssetBulkUpdateDto,
        validBulkPayload,
      );
      expect(errors.length).toBe(0);
    });

    it('should fail when asset_ids is not an array or contains non-integer items', async () => {
      const invalidIdsPayload = {
        rec_resource_id: 'REC001',
        asset_ids: ['abc', 102],
        update_fields: { asset_name: 'Name' },
      };

      const { errors } = await validateDto(
        RecreationAssetBulkUpdateDto,
        invalidIdsPayload,
      );

      const properties = errors.map((e) => e.property);
      expect(properties).toContain('asset_ids');
    });

    it('should fail when asset_ids is empty or omitted', async () => {
      const emptyIdsPayload = {
        rec_resource_id: 'REC001',
        asset_ids: [],
        update_fields: { asset_name: 'Name' },
      };

      const { errors } = await validateDto(
        RecreationAssetBulkUpdateDto,
        emptyIdsPayload,
      );

      const properties = errors.map((e) => e.property);
      expect(properties).toContain('asset_ids');
    });

    it('should fail when update_fields is missing or invalid object', async () => {
      const invalidFieldsPayload = {
        rec_resource_id: 'REC001',
        asset_ids: [101],
        update_fields: 'not-an-object',
      };

      const { errors } = await validateDto(
        RecreationAssetBulkUpdateDto,
        invalidFieldsPayload,
      );

      const properties = errors.map((e) => e.property);
      expect(properties).toContain('update_fields');
    });

    it('should trigger nested validation errors inside update_fields', async () => {
      const invalidNestedPayload = {
        rec_resource_id: 'REC001',
        asset_ids: [101],
        update_fields: {
          asset_name: 'A'.repeat(201), // Violates MaxLength(200)
          asset_length: 'not-a-number',
        },
      };

      const { errors } = await validateDto(
        RecreationAssetBulkUpdateDto,
        invalidNestedPayload,
      );

      expect(errors.length).toBeGreaterThan(0);
      const updateFieldsError = errors.find(
        (e) => e.property === 'update_fields',
      );
      expect(updateFieldsError).toBeDefined();
      expect(updateFieldsError?.children?.length).toBeGreaterThan(0);
    });
  });
});
