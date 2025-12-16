export const DAY_FIELDS = [
  'monday_ind',
  'tuesday_ind',
  'wednesday_ind',
  'thursday_ind',
  'friday_ind',
  'saturday_ind',
  'sunday_ind',
] as const;

export const DAY_PRESET_CONFIG = {
  all_days: {
    monday_ind: true,
    tuesday_ind: true,
    wednesday_ind: true,
    thursday_ind: true,
    friday_ind: true,
    saturday_ind: true,
    sunday_ind: true,
  },
  weekends: {
    monday_ind: false,
    tuesday_ind: false,
    wednesday_ind: false,
    thursday_ind: false,
    friday_ind: false,
    saturday_ind: true,
    sunday_ind: true,
  },
  custom: {
    monday_ind: false,
    tuesday_ind: false,
    wednesday_ind: false,
    thursday_ind: false,
    friday_ind: false,
    saturday_ind: false,
    sunday_ind: false,
  },
} as const;
