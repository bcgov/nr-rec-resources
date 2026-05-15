export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

// Feb = 29 to allow leap years
export const MAX_DAYS_PER_MONTH = [
  31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31,
] as const;
