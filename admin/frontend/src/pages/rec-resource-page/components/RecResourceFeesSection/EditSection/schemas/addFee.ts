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

export const FEE_APPLIES_DROPDOWN_OPTIONS = [
  { value: FEE_APPLIES_OPTIONS.ALWAYS, label: 'Always' },
  { value: FEE_APPLIES_OPTIONS.SPECIFIC_DATES, label: 'Specific Dates' },
];

export const addFeeSchemaBase = z.object({
  fee_type_sub_type: z.string().min(1, 'Fee type is required'),
  fee_amount: z.number().optional(),
  fee_applies: z.enum([
    FEE_APPLIES_OPTIONS.ALWAYS,
    FEE_APPLIES_OPTIONS.SPECIFIC_DATES,
  ]),
  fee_start_date: z.string().optional(),
  fee_end_date: z.string().optional(),
  recurring_start_mmdd: z.string().optional(),
  recurring_end_mmdd: z.string().optional(),
  is_recurring: z.boolean().default(false),
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
  fee_determination_letter_confirmed: z.boolean().default(false),
});

export const createAddFeeSchema = ({
  requireFdlConfirmation = false,
}: {
  requireFdlConfirmation?: boolean;
} = {}) =>
  addFeeSchemaBase
    .refine(
      (data) => {
        if (data.fee_applies === FEE_APPLIES_OPTIONS.ALWAYS) return true;
        if (!data.is_recurring) return true;
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
        if (!data.is_recurring) return true;
        return /^\d{2}-\d{2}$/.test(data.recurring_end_mmdd || '');
      },
      {
        message: 'End date is required',
        path: ['recurring_end_mmdd'],
      },
    )
    .refine(
      (data) => {
        if (data.fee_applies === FEE_APPLIES_OPTIONS.SPECIFIC_DATES) {
          if (data.is_recurring === false) return true;
          return /^\d{2}-\d{2}$/.test(data.recurring_start_mmdd || '');
        }
        return true;
      },
      {
        message: 'Start date is required',
        path: ['recurring_start_mmdd'],
      },
    )
    .refine(
      (data) => {
        if (data.fee_applies === FEE_APPLIES_OPTIONS.SPECIFIC_DATES) {
          if (data.is_recurring === false) return true;
          return /^\d{2}-\d{2}$/.test(data.recurring_end_mmdd || '');
        }
        return true;
      },
      {
        message: 'End date is required',
        path: ['recurring_end_mmdd'],
      },
    )
    .refine(
      (data) => {
        if (data.fee_applies === FEE_APPLIES_OPTIONS.SPECIFIC_DATES) {
          return [
            data.monday_ind,
            data.tuesday_ind,
            data.wednesday_ind,
            data.thursday_ind,
            data.friday_ind,
            data.saturday_ind,
            data.sunday_ind,
          ].some(Boolean);
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
    )
    .refine(
      (data) => {
        if (requireFdlConfirmation) {
          return data.fee_determination_letter_confirmed === true;
        }
        return true;
      },
      {
        message: 'You must confirm you have a fee determination letter',
        path: ['fee_determination_letter_confirmed'],
      },
    );

export const addFeeSchema = createAddFeeSchema({
  requireFdlConfirmation: true,
});

export type AddFeeFormData = z.infer<ReturnType<typeof createAddFeeSchema>>;
