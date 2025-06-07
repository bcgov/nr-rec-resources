import { RecreationFeeModel } from '@/service/custom-models';

// Shared fee type map
export const feeTypeMap: Record<string, string> = {
  C: 'Camping',
  D: 'Day Use',
  H: 'Hut',
  P: 'Parking',
  T: 'Trail Use',
};

export function getFeeTypeLabel(code: string) {
  return feeTypeMap[code] || 'Unknown Fee Type';
}

export function formatFeeDate(dateStr: Date | null | undefined) {
  if (!dateStr) return 'N/A';
  // Format as UTC date string: e.g., "February 1, 2025"
  return dateStr.toLocaleDateString('en-CA', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatFeeDays(fee: RecreationFeeModel) {
  const daysMap: Record<string, string> = {
    monday_ind: 'Monday',
    tuesday_ind: 'Tuesday',
    wednesday_ind: 'Wednesday',
    thursday_ind: 'Thursday',
    friday_ind: 'Friday',
    saturday_ind: 'Saturday',
    sunday_ind: 'Sunday',
  };

  const selectedDays = Object.keys(daysMap).filter((day) => {
    const value = fee[day as keyof RecreationFeeModel];
    return typeof value === 'string' && value.toUpperCase() === 'Y';
  });

  return selectedDays.length === 7
    ? 'All Days'
    : selectedDays.map((day) => daysMap[day]).join(', ');
}
