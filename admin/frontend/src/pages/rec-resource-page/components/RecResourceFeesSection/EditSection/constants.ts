import { type AddFeeFormData } from '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/schemas/addFee';
import {
  FEE_APPLIES_OPTIONS,
  DAY_PRESET_OPTIONS,
} from '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/schemas/addFee';

export const DAYS = [
  { key: 'monday_ind' as const, label: 'Monday' },
  { key: 'tuesday_ind' as const, label: 'Tuesday' },
  { key: 'wednesday_ind' as const, label: 'Wednesday' },
  { key: 'thursday_ind' as const, label: 'Thursday' },
  { key: 'friday_ind' as const, label: 'Friday' },
  { key: 'saturday_ind' as const, label: 'Saturday' },
  { key: 'sunday_ind' as const, label: 'Sunday' },
] as const satisfies Array<{ key: keyof AddFeeFormData; label: string }>;

export const FEE_APPLIES_DROPDOWN_OPTIONS = [
  { id: FEE_APPLIES_OPTIONS.ALWAYS, label: 'Fee always applies' },
  {
    id: FEE_APPLIES_OPTIONS.SPECIFIC_DATES,
    label: 'Fee applies for specific dates',
  },
];

export const DAY_PRESET_OPTIONS_LIST = [
  { id: DAY_PRESET_OPTIONS.ALL_DAYS, label: 'All days (Mon-Sun)' },
  { id: DAY_PRESET_OPTIONS.WEEKENDS, label: 'Weekends (Sat-Sun)' },
  { id: DAY_PRESET_OPTIONS.CUSTOM, label: 'Custom days' },
];
