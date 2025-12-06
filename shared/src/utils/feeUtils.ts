import { formatDateReadable } from './dateUtils';

/**
 * Fee type code to label mapping
 */
export const feeTypeMap: Record<string, string> = {
  C: 'Camping',
  D: 'Day Use',
  H: 'Hut',
  P: 'Parking',
  T: 'Trail Use',
};

/**
 * Common interface for fee objects that works with both admin and public DTOs
 */
export interface FeeWithDayIndicators {
  monday_ind?: string;
  tuesday_ind?: string;
  wednesday_ind?: string;
  thursday_ind?: string;
  friday_ind?: string;
  saturday_ind?: string;
  sunday_ind?: string;
  [key: string]: any;
}

/**
 * Options for formatting fee days
 */
export interface FormatFeeDaysOptions {
  /**
   * Whether to use abbreviated day names (Mon, Tue) or full names (Monday, Tuesday)
   * @default false (full names)
   */
  abbreviated?: boolean;
  /**
   * Text to display when all days are selected
   * @default 'All Days' for full names, 'All days' for abbreviated
   */
  allDaysText?: string;
}

/**
 * Gets the human-readable label for a fee type code
 * @param code - Fee type code (C, D, H, P, T)
 * @returns Fee type label or 'Unknown Fee Type' if code is not recognized
 */
export function getFeeTypeLabel(code: string | number): string {
  return feeTypeMap[String(code)] || 'Unknown Fee Type';
}

/**
 * Formats a fee date, returning 'N/A' for null or undefined dates
 * @param date - Date to format (Date, string, number, null, or undefined)
 * @returns Formatted date string or 'N/A' if date is null/undefined
 */
export function formatFeeDate(
  date: Date | string | number | null | undefined,
): string {
  if (!date) return 'N/A';
  return formatDateReadable(date) || 'N/A';
}

/**
 * Gets the selected days from fee day indicators as an array
 * @param fee - Fee object with day indicators (monday_ind, tuesday_ind, etc.)
 * @param options - Formatting options
 * @returns Array of day strings (e.g., ["All days"] or ["Mon", "Tue"] or ["Monday", "Tuesday"])
 */
export function getFeeDaysArray(
  fee: FeeWithDayIndicators,
  options: FormatFeeDaysOptions = {},
): string[] {
  const { abbreviated = false, allDaysText } = options;

  const daysMap: Record<string, string> = abbreviated
    ? {
        monday_ind: 'Mon',
        tuesday_ind: 'Tue',
        wednesday_ind: 'Wed',
        thursday_ind: 'Thu',
        friday_ind: 'Fri',
        saturday_ind: 'Sat',
        sunday_ind: 'Sun',
      }
    : {
        monday_ind: 'Monday',
        tuesday_ind: 'Tuesday',
        wednesday_ind: 'Wednesday',
        thursday_ind: 'Thursday',
        friday_ind: 'Friday',
        saturday_ind: 'Saturday',
        sunday_ind: 'Sunday',
      };

  const selectedDays = Object.keys(daysMap).filter((day) => {
    const value = fee[day];
    return typeof value === 'string' && value.toUpperCase() === 'Y';
  });

  if (selectedDays.length === 7) {
    return [allDaysText || (abbreviated ? 'All days' : 'All Days')];
  }

  if (selectedDays.length === 0) {
    return [];
  }

  return selectedDays.map((day) => daysMap[day]);
}

/**
 * Formats the days of week from fee day indicators
 * @param fee - Fee object with day indicators (monday_ind, tuesday_ind, etc.)
 * @param options - Formatting options
 * @returns Formatted string of days (e.g., "All Days" or "Monday, Tuesday" or "Mon, Tue")
 */
export function formatFeeDays(
  fee: FeeWithDayIndicators,
  options: FormatFeeDaysOptions = {},
): string {
  const daysArray = getFeeDaysArray(fee, options);

  if (daysArray.length === 0) {
    return '';
  }

  // If it's the "All days" case, return it as a string
  if (
    daysArray.length === 1 &&
    (daysArray[0] === 'All days' || daysArray[0] === 'All Days')
  ) {
    return daysArray[0];
  }

  return daysArray.join(', ');
}
