/**
 * Formats a date for display using Canadian English locale
 * and Pacific Time (America/Vancouver).
 *
 * Accepts either:
 * - A date string (e.g. "2025-08-06")
 * - A Unix timestamp in milliseconds (e.g. 1754431503000)
 *
 * Examples:
 *   formatDisplayDate("2025-08-06")       → "August 6, 2025"
 *   formatDisplayDate(1754431503000)      → "September 4, 2025"
 */

export const formatDate = (dateVal: any) => {
  if (!dateVal) return null;
  const date = new Date(dateVal);
  if (isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Vancouver',
  });
};
