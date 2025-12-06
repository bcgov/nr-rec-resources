import { RecreationFeeDto } from '@/services';
import {
  formatFeeDays as formatFeeDaysShared,
  getFeeDaysArray,
} from '@shared/utils/feeUtils';

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
