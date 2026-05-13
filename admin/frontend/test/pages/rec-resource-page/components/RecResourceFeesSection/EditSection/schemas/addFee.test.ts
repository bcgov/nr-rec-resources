import { describe, expect, it } from 'vitest';
import {
  addFeeSchema,
  FEE_APPLIES_OPTIONS,
  DAY_PRESET_OPTIONS,
} from '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/schemas/addFee';

describe('addFeeSchema', () => {
  describe('valid data', () => {
    it('validates a complete fee that applies always', () => {
      const validData = {
        recreation_fee_code: 'D',
        fee_amount: 50,
        fee_applies: FEE_APPLIES_OPTIONS.ALWAYS,
        day_preset: DAY_PRESET_OPTIONS.ALL_DAYS,
        monday_ind: true,
        tuesday_ind: true,
        wednesday_ind: true,
        thursday_ind: true,
        friday_ind: true,
        saturday_ind: false,
        sunday_ind: false,
      };

      const result = addFeeSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.fee_amount).toBe(50);
        expect(result.data.fee_applies).toBe(FEE_APPLIES_OPTIONS.ALWAYS);
      }
    });

    it('validates a complete fee that applies to specific dates with all days selected', () => {
      const validData = {
        recreation_fee_code: 'C',
        fee_amount: 75.5,
        fee_applies: FEE_APPLIES_OPTIONS.SPECIFIC_DATES,
        recurring_start_mmdd: '06-15',
        recurring_end_mmdd: '08-31',
        day_preset: DAY_PRESET_OPTIONS.ALL_DAYS,
        monday_ind: true,
        tuesday_ind: true,
        wednesday_ind: true,
        thursday_ind: true,
        friday_ind: true,
        saturday_ind: true,
        sunday_ind: true,
      };

      const result = addFeeSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.recurring_start_mmdd).toBe('06-15');
        expect(result.data.recurring_end_mmdd).toBe('08-31');
      }
    });

    it('validates a fee with only weekdays selected', () => {
      const validData = {
        recreation_fee_code: 'P',
        fee_amount: 25,
        fee_applies: FEE_APPLIES_OPTIONS.SPECIFIC_DATES,
        recurring_start_mmdd: '01-01',
        recurring_end_mmdd: '12-31',
        day_preset: DAY_PRESET_OPTIONS.CUSTOM,
        monday_ind: true,
        tuesday_ind: true,
        wednesday_ind: true,
        thursday_ind: true,
        friday_ind: true,
        saturday_ind: false,
        sunday_ind: false,
      };

      const result = addFeeSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('validates a fee with only weekends selected', () => {
      const validData = {
        recreation_fee_code: 'G',
        fee_amount: 40,
        fee_applies: FEE_APPLIES_OPTIONS.SPECIFIC_DATES,
        recurring_start_mmdd: '03-01',
        recurring_end_mmdd: '10-31',
        day_preset: DAY_PRESET_OPTIONS.WEEKENDS,
        monday_ind: false,
        tuesday_ind: false,
        wednesday_ind: false,
        thursday_ind: false,
        friday_ind: false,
        saturday_ind: true,
        sunday_ind: true,
      };

      const result = addFeeSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('validates with default values when optional fields are not provided', () => {
      const validData = {
        recreation_fee_code: 'D',
        fee_amount: 50,
        fee_applies: FEE_APPLIES_OPTIONS.ALWAYS,
      };

      const result = addFeeSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.day_preset).toBe(DAY_PRESET_OPTIONS.ALL_DAYS);
        expect(result.data.monday_ind).toBe(false);
      }
    });
  });

  describe('invalid recreation_fee_code', () => {
    it('rejects empty fee code', () => {
      const invalidData = {
        recreation_fee_code: '',
        fee_amount: 50,
        fee_applies: FEE_APPLIES_OPTIONS.ALWAYS,
      };

      const result = addFeeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('required');
      }
    });

    it('rejects fee code longer than 1 character', () => {
      const invalidData = {
        recreation_fee_code: 'DAY',
        fee_amount: 50,
        fee_applies: FEE_APPLIES_OPTIONS.ALWAYS,
      };

      const result = addFeeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('single character');
      }
    });
  });

  describe('fee_amount validation', () => {
    it('rejects zero fee amount', () => {
      const invalidData = {
        recreation_fee_code: 'D',
        fee_amount: 0,
        fee_applies: FEE_APPLIES_OPTIONS.ALWAYS,
      };

      const result = addFeeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((issue) =>
            issue.message.includes('cannot be zero'),
          ),
        ).toBe(true);
      }
    });

    it('rejects negative fee amount', () => {
      const invalidData = {
        recreation_fee_code: 'D',
        fee_amount: -10,
        fee_applies: FEE_APPLIES_OPTIONS.ALWAYS,
      };

      const result = addFeeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((issue) =>
            issue.message.includes('cannot be zero'),
          ),
        ).toBe(true);
      }
    });

    it('allows positive decimal fee amounts', () => {
      const validData = {
        recreation_fee_code: 'D',
        fee_amount: 25.5,
        fee_applies: FEE_APPLIES_OPTIONS.ALWAYS,
      };

      const result = addFeeSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.fee_amount).toBe(25.5);
      }
    });
  });

  describe('recurring date validation', () => {
    it('requires start date when fee applies to specific dates', () => {
      const invalidData = {
        recreation_fee_code: 'D',
        fee_amount: 50,
        fee_applies: FEE_APPLIES_OPTIONS.SPECIFIC_DATES,
        is_recurring: true,
        recurring_start_mmdd: undefined,
        recurring_end_mmdd: '08-31',
        monday_ind: true,
        tuesday_ind: true,
        wednesday_ind: true,
        thursday_ind: true,
        friday_ind: true,
        saturday_ind: false,
        sunday_ind: false,
      };

      const result = addFeeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((issue) =>
            issue.path.includes('recurring_start_mmdd'),
          ),
        ).toBe(true);
      }
    });

    it('requires end date when fee applies to specific dates', () => {
      const invalidData = {
        recreation_fee_code: 'D',
        fee_amount: 50,
        fee_applies: FEE_APPLIES_OPTIONS.SPECIFIC_DATES,
        is_recurring: true,
        recurring_start_mmdd: '06-15',
        recurring_end_mmdd: undefined,
        monday_ind: true,
        tuesday_ind: true,
        wednesday_ind: true,
        thursday_ind: true,
        friday_ind: true,
        saturday_ind: false,
        sunday_ind: false,
      };

      const result = addFeeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((issue) =>
            issue.path.includes('recurring_end_mmdd'),
          ),
        ).toBe(true);
      }
    });

    it('rejects invalid start date format', () => {
      const invalidData = {
        recreation_fee_code: 'D',
        fee_amount: 50,
        fee_applies: FEE_APPLIES_OPTIONS.SPECIFIC_DATES,
        is_recurring: true,
        recurring_start_mmdd: '6-15',
        recurring_end_mmdd: '08-31',
        monday_ind: true,
        tuesday_ind: true,
        wednesday_ind: true,
        thursday_ind: true,
        friday_ind: true,
        saturday_ind: false,
        sunday_ind: false,
      };

      const result = addFeeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((issue) =>
            issue.path.includes('recurring_start_mmdd'),
          ),
        ).toBe(true);
      }
    });

    it('rejects invalid end date format', () => {
      const invalidData = {
        recreation_fee_code: 'D',
        fee_amount: 50,
        fee_applies: FEE_APPLIES_OPTIONS.SPECIFIC_DATES,
        is_recurring: true,
        recurring_start_mmdd: '06-15',
        recurring_end_mmdd: '8-31',
        monday_ind: true,
        tuesday_ind: true,
        wednesday_ind: true,
        thursday_ind: true,
        friday_ind: true,
        saturday_ind: false,
        sunday_ind: false,
      };

      const result = addFeeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((issue) =>
            issue.path.includes('recurring_end_mmdd'),
          ),
        ).toBe(true);
      }
    });
    it('allows same month and day for start and end dates', () => {
      // This test verifies that a fee can have identical start and end dates (e.g., June 15 to June 15)
      const validData = {
        recreation_fee_code: 'D',
        fee_amount: 50,
        fee_applies: FEE_APPLIES_OPTIONS.SPECIFIC_DATES,
        recurring_start_mmdd: '06-15',
        recurring_end_mmdd: '06-15',
        monday_ind: true,
        tuesday_ind: true,
        wednesday_ind: true,
        thursday_ind: true,
        friday_ind: true,
        saturday_ind: false,
        sunday_ind: false,
      };

      const result = addFeeSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('allows same month with later day for end date', () => {
      const validData = {
        recreation_fee_code: 'D',
        fee_amount: 50,
        fee_applies: FEE_APPLIES_OPTIONS.SPECIFIC_DATES,
        recurring_start_mmdd: '06-10',
        recurring_end_mmdd: '06-25',
        monday_ind: true,
        tuesday_ind: true,
        wednesday_ind: true,
        thursday_ind: true,
        friday_ind: true,
        saturday_ind: false,
        sunday_ind: false,
      };

      const result = addFeeSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('day selection validation', () => {
    it('requires at least one day when fee applies to specific dates', () => {
      const invalidData = {
        recreation_fee_code: 'D',
        fee_amount: 50,
        fee_applies: FEE_APPLIES_OPTIONS.SPECIFIC_DATES,
        recurring_start_mmdd: '06-15',
        recurring_end_mmdd: '08-31',
        monday_ind: false,
        tuesday_ind: false,
        wednesday_ind: false,
        thursday_ind: false,
        friday_ind: false,
        saturday_ind: false,
        sunday_ind: false,
      };

      const result = addFeeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((issue) =>
            issue.message.includes('At least one day must be selected'),
          ),
        ).toBe(true);
      }
    });

    it('allows no days selected when fee applies always', () => {
      const validData = {
        recreation_fee_code: 'D',
        fee_amount: 50,
        fee_applies: FEE_APPLIES_OPTIONS.ALWAYS,
        monday_ind: false,
        tuesday_ind: false,
        wednesday_ind: false,
        thursday_ind: false,
        friday_ind: false,
        saturday_ind: false,
        sunday_ind: false,
      };

      const result = addFeeSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('validates a single day selection', () => {
      const validData = {
        recreation_fee_code: 'D',
        fee_amount: 50,
        fee_applies: FEE_APPLIES_OPTIONS.SPECIFIC_DATES,
        recurring_start_mmdd: '06-15',
        recurring_end_mmdd: '08-31',
        monday_ind: true,
        tuesday_ind: false,
        wednesday_ind: false,
        thursday_ind: false,
        friday_ind: false,
        saturday_ind: false,
        sunday_ind: false,
      };

      const result = addFeeSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('day_preset validation', () => {
    it('validates all_days preset', () => {
      const validData = {
        recreation_fee_code: 'D',
        fee_amount: 50,
        fee_applies: FEE_APPLIES_OPTIONS.ALWAYS,
        day_preset: DAY_PRESET_OPTIONS.ALL_DAYS,
      };

      const result = addFeeSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.day_preset).toBe(DAY_PRESET_OPTIONS.ALL_DAYS);
      }
    });

    it('validates weekends preset', () => {
      const validData = {
        recreation_fee_code: 'D',
        fee_amount: 50,
        fee_applies: FEE_APPLIES_OPTIONS.ALWAYS,
        day_preset: DAY_PRESET_OPTIONS.WEEKENDS,
      };

      const result = addFeeSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.day_preset).toBe(DAY_PRESET_OPTIONS.WEEKENDS);
      }
    });

    it('validates custom preset', () => {
      const validData = {
        recreation_fee_code: 'D',
        fee_amount: 50,
        fee_applies: FEE_APPLIES_OPTIONS.ALWAYS,
        day_preset: DAY_PRESET_OPTIONS.CUSTOM,
      };

      const result = addFeeSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.day_preset).toBe(DAY_PRESET_OPTIONS.CUSTOM);
      }
    });

    it('uses default preset when not provided', () => {
      const validData = {
        recreation_fee_code: 'D',
        fee_amount: 50,
        fee_applies: FEE_APPLIES_OPTIONS.ALWAYS,
      };

      const result = addFeeSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.day_preset).toBe(DAY_PRESET_OPTIONS.ALL_DAYS);
      }
    });

    it('rejects invalid preset', () => {
      const invalidData = {
        recreation_fee_code: 'D',
        fee_amount: 50,
        fee_applies: FEE_APPLIES_OPTIONS.ALWAYS,
        day_preset: 'invalid_preset' as any,
      };

      const result = addFeeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('fee_applies validation', () => {
    it('validates always option', () => {
      const validData = {
        recreation_fee_code: 'D',
        fee_amount: 50,
        fee_applies: FEE_APPLIES_OPTIONS.ALWAYS,
      };

      const result = addFeeSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.fee_applies).toBe(FEE_APPLIES_OPTIONS.ALWAYS);
      }
    });

    it('validates specific_dates option', () => {
      const validData = {
        recreation_fee_code: 'D',
        fee_amount: 50,
        fee_applies: FEE_APPLIES_OPTIONS.SPECIFIC_DATES,
        recurring_start_mmdd: '06-15',
        recurring_end_mmdd: '08-31',
        monday_ind: true,
      };

      const result = addFeeSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.fee_applies).toBe(
          FEE_APPLIES_OPTIONS.SPECIFIC_DATES,
        );
      }
    });

    it('rejects invalid fee_applies option', () => {
      const invalidData = {
        recreation_fee_code: 'D',
        fee_amount: 50,
        fee_applies: 'invalid_option' as any,
      };

      const result = addFeeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('optional fields', () => {
    it('allows optional fee_start_date and fee_end_date fields', () => {
      const validData = {
        recreation_fee_code: 'D',
        fee_amount: 50,
        fee_applies: FEE_APPLIES_OPTIONS.ALWAYS,
        fee_start_date: '2025-01-01',
        fee_end_date: '2025-12-31',
      };

      const result = addFeeSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.fee_start_date).toBe('2025-01-01');
        expect(result.data.fee_end_date).toBe('2025-12-31');
      }
    });

    it('allows undefined optional fields', () => {
      const validData = {
        recreation_fee_code: 'D',
        fee_amount: 50,
        fee_applies: FEE_APPLIES_OPTIONS.ALWAYS,
      };

      const result = addFeeSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.fee_start_date).toBeUndefined();
        expect(result.data.fee_end_date).toBeUndefined();
      }
    });
  });

  describe('complex scenarios', () => {
    it('validates complete fee with all fields populated', () => {
      const validData = {
        recreation_fee_code: 'C',
        fee_amount: 100.99,
        fee_applies: FEE_APPLIES_OPTIONS.SPECIFIC_DATES,
        fee_start_date: '2025-06-01',
        fee_end_date: '2025-08-31',
        recurring_start_mmdd: '06-01',
        recurring_end_mmdd: '08-31',
        day_preset: DAY_PRESET_OPTIONS.CUSTOM,
        monday_ind: true,
        tuesday_ind: true,
        wednesday_ind: true,
        thursday_ind: false,
        friday_ind: false,
        saturday_ind: true,
        sunday_ind: false,
      };

      const result = addFeeSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.fee_amount).toBe(100.99);
        expect(result.data.fee_applies).toBe(
          FEE_APPLIES_OPTIONS.SPECIFIC_DATES,
        );
      }
    });

    it('validates year-round fee for specific dates', () => {
      const validData = {
        recreation_fee_code: 'G',
        fee_amount: 35,
        fee_applies: FEE_APPLIES_OPTIONS.SPECIFIC_DATES,
        recurring_start_mmdd: '01-01',
        recurring_end_mmdd: '12-31',
        monday_ind: true,
        tuesday_ind: true,
        wednesday_ind: true,
        thursday_ind: true,
        friday_ind: true,
        saturday_ind: true,
        sunday_ind: true,
      };

      const result = addFeeSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});
