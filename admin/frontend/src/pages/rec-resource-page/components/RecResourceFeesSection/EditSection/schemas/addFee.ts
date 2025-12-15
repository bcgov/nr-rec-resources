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

export const addFeeSchema = z
  .object({
    recreation_fee_code: z
      .string()
      .min(1, 'Fee type is required')
      .max(1, 'Fee type must be a single character'),
    fee_amount: z.number().positive('Amount must be greater than 0').optional(),
    fee_applies: z.enum([
      FEE_APPLIES_OPTIONS.ALWAYS,
      FEE_APPLIES_OPTIONS.SPECIFIC_DATES,
    ]),
    recurring_fee: z.boolean().default(false),
    fee_start_date: z.string().optional(),
    fee_end_date: z.string().optional(),
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
  })
  .refine(
    (data) => {
      // If fee applies always, don't require dates
      if (data.fee_applies === FEE_APPLIES_OPTIONS.ALWAYS) {
        return true;
      }
      // If specific dates, require start date
      return data.fee_start_date !== null && data.fee_start_date !== undefined;
    },
    {
      message: 'Start date is required when fee applies for specific dates',
      path: ['fee_start_date'],
    },
  )
  .refine(
    (data) => {
      // If no dates provided, validation passes
      if (!data.fee_start_date) {
        return true;
      }
      // If end date is provided, it must be after start date
      if (data.fee_end_date) {
        return new Date(data.fee_end_date) > new Date(data.fee_start_date);
      }
      return true;
    },
    {
      message: 'End date must be after start date',
      path: ['fee_end_date'],
    },
  )
  .refine(
    (data) => {
      // If fee applies to specific dates, at least one day must be selected
      if (data.fee_applies === FEE_APPLIES_OPTIONS.SPECIFIC_DATES) {
        const anyDaySelected = [
          data.monday_ind,
          data.tuesday_ind,
          data.wednesday_ind,
          data.thursday_ind,
          data.friday_ind,
          data.saturday_ind,
          data.sunday_ind,
        ].some((day) => day === true);
        return anyDaySelected;
      }
      return true;
    },
    {
      message: 'At least one day must be selected',
      path: ['monday_ind'],
    },
  );

export type AddFeeFormData = z.infer<typeof addFeeSchema>;
