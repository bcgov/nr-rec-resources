import { RecreationFeeDto } from '@/services';
import {
  formatFeeDays as formatFeeDaysShared,
  getFeeDaysArray,
} from '@shared/utils/feeUtils';

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

const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/**
 * Formats the days of week from fee day indicators.
 * Returns "All days" if all 7 days are selected, otherwise returns abbreviated day names.
 *
 * @param fee - Fee object with day indicators (monday_ind, tuesday_ind, etc.)
 * @returns Formatted string of days (e.g., "All days" or "Sat, Sun")
 */
export function formatFeeDays(fee: RecreationFeeDto): string {
  return formatFeeDaysShared(fee, { abbreviated: true });
}

/**
 * Gets individual days as an array from fee day indicators.
 * Returns ["All days"] if all 7 days are selected, otherwise returns array of abbreviated day names.
 *
 * @param fee - Fee object with day indicators (monday_ind, tuesday_ind, etc.)
 * @returns Array of day strings (e.g., ["All days"] or ["Sat", "Sun"])
 */
export function getIndividualDays(fee: RecreationFeeDto): string[] {
  return getFeeDaysArray(fee, { abbreviated: true });
}

/**
 * Formats MM-DD strings to "Mon D" (e.g., "01-01" -> "Jan 1").
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
