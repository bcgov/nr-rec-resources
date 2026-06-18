import { formatDateReadable } from './dateUtils';

/**
 * Fee type code to label mapping
 */
export const feeTypeMap: Record<string, string> = {
  O: 'Overnight',
  A: 'Additional',
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

/**
 * Month names for recurring fee date formatting
 */
const SHORT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/**
 * Days in each month (using 29 for February to account for leap years)
 */
const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/**
 * Formats MM-DD strings to "Mon D" format (e.g., "06-15" -> "Jun 15").
 * Validates that the month is between 1-12 and day is valid for that month.
 * @param mmdd - Month-day string in MM-DD format
 * @returns Formatted date string or '--' if invalid
 */
export function formatRecurringMonthDay(mmdd?: string | null): string {
  if (!mmdd) return '--';

  const match = mmdd.match(/^(\d{2})-(\d{2})$/);
  if (!match) return '--';

  const month = parseInt(match[1], 10);
  const day = parseInt(match[2], 10);

  if (month < 1 || month > 12) return '--';

  const maxDaysInMonth = DAYS_IN_MONTH[month - 1];
  if (day < 1 || day > maxDaysInMonth) return '--';

  return `${SHORT_MONTHS[month - 1]} ${day}`;
}
