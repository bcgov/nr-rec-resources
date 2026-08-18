import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { describe, it, expect } from 'vitest';
import {
  CreateRecreationAssetRepairDto,
  UpdateRecreationAssetRepairDto,
  RecreationAssetRepairDto,
  RepairChange,
  RecreationAssetBulkRepairDto,
} from '../../../src/resource-asset/dto/resource-asset-repair.dto';

describe('Recreation Asset Repair DTOs', () => {
  // Helper function to transform plain JS object to class instance and validate it
  const validateDto = async <T extends object>(
    cls: new () => T,
    plain: Record<string, any>,
  ) => {
    const instance = plainToInstance(cls, plain);
    const errors = await validate(instance);
    return { instance, errors };
  };

  describe('BaseRecreationAssetRepairDto & CreateRecreationAssetRepairDto', () => {
    it('should validate successfully with a complete valid payload', async () => {
      const validPayload = {
        recreation_remed_repair_code: 'RC',
        estimated_repair_cost: 450.0,
        actual_repair_cost: 485.5,
        repair_completed_date: '2026-08-10',
        urgency: 'High',
        trail_segment_start: 'KM 0.5',
        trail_segment_end: 'KM 1.2',
        asset_id: 1,
      };

      const { errors } = await validateDto(
        CreateRecreationAssetRepairDto,
        validPayload,
      );
      expect(errors.length).toBe(0);
    });

    it('should validate successfully when all optional fields are omitted or explicit null', async () => {
      const emptyPayload = {
        recreation_remed_repair_code: null,
        estimated_repair_cost: null,
        actual_repair_cost: null,
        repair_completed_date: null,
        urgency: null,
        trail_segment_start: null,
        trail_segment_end: null,
      };

      const { errors } = await validateDto(
        CreateRecreationAssetRepairDto,
        emptyPayload,
      );
      expect(errors.length).toBe(0);
    });

    it('should fail when string max length constraints are exceeded', async () => {
      const overflowPayload = {
        recreation_remed_repair_code: 'ABC', // Max 2
        urgency: 'A'.repeat(26), // Max 25
        trail_segment_start: 'B'.repeat(51), // Max 50
        trail_segment_end: 'C'.repeat(51), // Max 50
      };

      const { errors } = await validateDto(
        CreateRecreationAssetRepairDto,
        overflowPayload,
      );

      const properties = errors.map((e) => e.property);
      expect(properties).toContain('recreation_remed_repair_code');
      expect(properties).toContain('urgency');
      expect(properties).toContain('trail_segment_start');
      expect(properties).toContain('trail_segment_end');
    });

    it('should fail when numeric or integer types are invalid', async () => {
      const invalidTypesPayload = {
        estimated_repair_cost: 'not-a-number',
        actual_repair_cost: 'not-a-number',
        asset_id: 'not-an-int',
      };

      const { errors } = await validateDto(
        CreateRecreationAssetRepairDto,
        invalidTypesPayload,
      );

      const properties = errors.map((e) => e.property);
      expect(properties).toContain('estimated_repair_cost');
      expect(properties).toContain('actual_repair_cost');
      expect(properties).toContain('asset_id');
    });

    it('should transform numeric string inputs into numbers via @Type', async () => {
      const stringNumericPayload = {
        estimated_repair_cost: '450.50',
        actual_repair_cost: '485.25',
        asset_id: '12',
      };

      const { instance, errors } = await validateDto(
        CreateRecreationAssetRepairDto,
        stringNumericPayload,
      );

      expect(errors.length).toBe(0);
      expect(instance.estimated_repair_cost).toBe(450.5);
      expect(instance.actual_repair_cost).toBe(485.25);
      expect(instance.asset_id).toBe(12);
    });

    it('should fail when repair_completed_date is an invalid date string', async () => {
      const invalidDatePayload = {
        repair_completed_date: 'invalid-date',
      };

      const { errors } = await validateDto(
        CreateRecreationAssetRepairDto,
        invalidDatePayload,
      );

      const properties = errors.map((e) => e.property);
      expect(properties).toContain('repair_completed_date');
    });

    it('should fail when non-string values are provided for string fields', async () => {
      const invalidStringsPayload = {
        recreation_remed_repair_code: 123,
        urgency: 123,
        trail_segment_start: 123,
        trail_segment_end: 123,
      };

      const { errors } = await validateDto(
        CreateRecreationAssetRepairDto,
        invalidStringsPayload,
      );

      const properties = errors.map((e) => e.property);
      expect(properties).toContain('recreation_remed_repair_code');
      expect(properties).toContain('urgency');
      expect(properties).toContain('trail_segment_start');
      expect(properties).toContain('trail_segment_end');
    });
  });

  describe('UpdateRecreationAssetRepairDto', () => {
    it('should allow partial updates with any combination of fields', async () => {
      const partialPayload = {
        urgency: 'Medium',
        actual_repair_cost: 200,
      };

      const { errors } = await validateDto(
        UpdateRecreationAssetRepairDto,
        partialPayload,
      );
      expect(errors.length).toBe(0);
    });
  });

  describe('RecreationAssetRepairDto', () => {
    it('should validate successfully when all required read fields are provided', async () => {
      const validReadPayload = {
        repair_id: 1,
        asset_id: 10,
        created_at: '2026-08-01T10:00:00Z',
        created_by: 'user1',
        updated_at: '2026-08-02T10:00:00Z',
        updated_by: 'user2',
      };

      const { errors } = await validateDto(
        RecreationAssetRepairDto,
        validReadPayload,
      );
      expect(errors.length).toBe(0);
    });

    it('should fail when required fields (repair_id, asset_id) are missing or invalid', async () => {
      const invalidReadPayload = {
        repair_id: 'not-an-int',
        // asset_id missing
      };

      const { errors } = await validateDto(
        RecreationAssetRepairDto,
        invalidReadPayload,
      );

      const properties = errors.map((e) => e.property);
      expect(properties).toContain('repair_id');
      expect(properties).toContain('asset_id');
    });

    it('should transform numeric string values for repair_id and asset_id via @Type', async () => {
      const payload = {
        repair_id: '100',
        asset_id: '200',
      };

      const { instance, errors } = await validateDto(
        RecreationAssetRepairDto,
        payload,
      );

      expect(errors.length).toBe(0);
      expect(instance.repair_id).toBe(100);
      expect(instance.asset_id).toBe(200);
    });

    it('should allow optional metadata fields to be null or undefined', async () => {
      const payload = {
        repair_id: 1,
        asset_id: 2,
        created_at: null,
        created_by: null,
        updated_at: null,
        updated_by: null,
      };

      const { errors } = await validateDto(RecreationAssetRepairDto, payload);
      expect(errors.length).toBe(0);
    });
  });

  describe('RepairChange', () => {
    it('should validate a valid RepairChange object', async () => {
      const validChange = {
        repair_cost: 1000.0,
        asset_ids: [1, 2, 3],
      };

      const { errors } = await validateDto(RepairChange, validChange);
      expect(errors.length).toBe(0);
    });

    it('should fail when repair_cost is missing or not a number', async () => {
      const invalidCost = {
        repair_cost: 'invalid',
        asset_ids: [1, 2],
      };

      const { errors } = await validateDto(RepairChange, invalidCost);

      const properties = errors.map((e) => e.property);
      expect(properties).toContain('repair_cost');
    });

    it('should fail when repair_cost is null or empty', async () => {
      const emptyCost = {
        repair_cost: null,
        asset_ids: [1, 2],
      };

      const { errors } = await validateDto(RepairChange, emptyCost);

      const properties = errors.map((e) => e.property);
      expect(properties).toContain('repair_cost');
    });

    it('should fail when asset_ids is not an array or contains non-integer values', async () => {
      const invalidAssetIds = {
        repair_cost: 500,
        asset_ids: ['abc', 2],
      };

      const { errors } = await validateDto(RepairChange, invalidAssetIds);

      const properties = errors.map((e) => e.property);
      expect(properties).toContain('asset_ids');
    });

    it('should fail when asset_ids is not an array type', async () => {
      const nonArrayAssetIds = {
        repair_cost: 500,
        asset_ids: '1, 2, 3',
      };

      const { errors } = await validateDto(RepairChange, nonArrayAssetIds);

      const properties = errors.map((e) => e.property);
      expect(properties).toContain('asset_ids');
    });
  });

  describe('RecreationAssetBulkRepairDto', () => {
    it('should validate a complete bulk repair payload successfully', async () => {
      const validBulkPayload = {
        recreation_remed_repair_code: 'CL',
        completed_date: '2023-10-01',
        changes: [
          {
            repair_cost: 1000.0,
            asset_ids: [1, 2, 3],
          },
        ],
      };

      const { errors } = await validateDto(
        RecreationAssetBulkRepairDto,
        validBulkPayload,
      );
      expect(errors.length).toBe(0);
    });

    it('should validate successfully without optional completed_date', async () => {
      const validBulkPayload = {
        recreation_remed_repair_code: 'CL',
        changes: [
          {
            repair_cost: 500.0,
            asset_ids: [10],
          },
        ],
      };

      const { errors } = await validateDto(
        RecreationAssetBulkRepairDto,
        validBulkPayload,
      );
      expect(errors.length).toBe(0);
    });

    it('should fail when recreation_remed_repair_code is missing, empty, or not a string', async () => {
      const invalidCodePayload = {
        recreation_remed_repair_code: '',
        changes: [],
      };

      const { errors } = await validateDto(
        RecreationAssetBulkRepairDto,
        invalidCodePayload,
      );

      const properties = errors.map((e) => e.property);
      expect(properties).toContain('recreation_remed_repair_code');
    });

    it('should fail when completed_date is an invalid ISO date string', async () => {
      const invalidDatePayload = {
        recreation_remed_repair_code: 'CL',
        completed_date: '2023-13-45',
        changes: [],
      };

      const { errors } = await validateDto(
        RecreationAssetBulkRepairDto,
        invalidDatePayload,
      );

      const properties = errors.map((e) => e.property);
      expect(properties).toContain('completed_date');
    });

    it('should fail when changes is not an array', async () => {
      const invalidChangesPayload = {
        recreation_remed_repair_code: 'CL',
        changes: 'not-an-array',
      };

      const { errors } = await validateDto(
        RecreationAssetBulkRepairDto,
        invalidChangesPayload,
      );

      const properties = errors.map((e) => e.property);
      expect(properties).toContain('changes');
    });

    it('should trigger nested validation errors when items in changes are invalid', async () => {
      const invalidNestedChangesPayload = {
        recreation_remed_repair_code: 'CL',
        changes: [
          {
            repair_cost: 'invalid-cost',
            asset_ids: ['invalid-id'],
          },
        ],
      };

      const { errors } = await validateDto(
        RecreationAssetBulkRepairDto,
        invalidNestedChangesPayload,
      );

      expect(errors.length).toBeGreaterThan(0);
      const changesError = errors.find((e) => e.property === 'changes');
      expect(changesError).toBeDefined();
      expect(changesError?.children?.length).toBeGreaterThan(0);
    });
  });
});
