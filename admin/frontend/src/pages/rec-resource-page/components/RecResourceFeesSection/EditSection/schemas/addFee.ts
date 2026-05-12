import { z } from 'zod';

export const FEE_APPLIES_OPTIONS = {
  ALWAYS: 'always',
  SPECIFIC_DATES: 'specific_dates',
} as const;

export const DAY_PRESET_OPTIONS = {
  ALL_DAYS: 'all_days',
  WEEKENDS: 'weekends',
  CUSTOM: 'custom',
} as const;

// Base schema for real-time validation (applied on onChange)
export const addFeeSchemaBase = z.object({
  recreation_fee_code: z
    .string()
    .min(1, 'Fee type is required')
    .max(1, 'Fee type must be a single character'),
  fee_amount: z.number().optional(),
  fee_applies: z.enum([
    FEE_APPLIES_OPTIONS.ALWAYS,
    FEE_APPLIES_OPTIONS.SPECIFIC_DATES,
  ]),
  fee_start_date: z.string().optional(),
  fee_end_date: z.string().optional(),
  recurring_start_mmdd: z.string().optional(),
  recurring_end_mmdd: z.string().optional(),
  day_preset: z
    .enum([
      DAY_PRESET_OPTIONS.ALL_DAYS,
      DAY_PRESET_OPTIONS.WEEKENDS,
      DAY_PRESET_OPTIONS.CUSTOM,
    ])
    .default(DAY_PRESET_OPTIONS.ALL_DAYS),
  monday_ind: z.boolean().default(false),
  tuesday_ind: z.boolean().default(false),
  wednesday_ind: z.boolean().default(false),
  thursday_ind: z.boolean().default(false),
  friday_ind: z.boolean().default(false),
  saturday_ind: z.boolean().default(false),
  sunday_ind: z.boolean().default(false),
});

// Submit schema with strict date and day validations
export const addFeeSchema = addFeeSchemaBase
  .refine(
    (data) => {
      if (data.fee_applies === FEE_APPLIES_OPTIONS.ALWAYS) return true;
      return /^\d{2}-\d{2}$/.test(data.recurring_start_mmdd || '');
    },
    {
      message: 'Start date is required',
      path: ['recurring_start_mmdd'],
    },
  )
  .refine(
    (data) => {
      if (data.fee_applies === FEE_APPLIES_OPTIONS.ALWAYS) return true;
      return /^\d{2}-\d{2}$/.test(data.recurring_end_mmdd || '');
    },
    {
      message: 'End date is required',
      path: ['recurring_end_mmdd'],
    },
  )
  .refine(
    (data) => {
      // If fee applies to specific dates, at least one day must be selected
      if (data.fee_applies === FEE_APPLIES_OPTIONS.SPECIFIC_DATES) {
        return [
          data.monday_ind,
          data.tuesday_ind,
          data.wednesday_ind,
          data.thursday_ind,
          data.friday_ind,
          data.saturday_ind,
          data.sunday_ind,
        ].some((day) => day);
      }
      return true;
    },
    {
      message: 'At least one day must be selected',
      path: ['monday_ind'],
    },
  )
  .refine(
    (data) => {
      if (data.fee_amount === undefined || data.fee_amount === null) {
        return false;
      }
      return data.fee_amount > 0;
    },
    {
      message: 'Amount cannot be zero',
      path: ['fee_amount'],
    },
  );

export type AddFeeFormData = z.infer<typeof addFeeSchema>;
