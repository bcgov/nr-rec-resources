/**
 * Date formatting utilities for consistent date display across the application.
 *
 * Two function families — pick based on the DB column type:
 *
 *   formatDate*      → @db.Date fields (PostgreSQL `date`). Time is irrelevant.
 *                      Always displays in UTC to preserve the calendar date.
 *                      Example: formatDateFull(fee.fee_start_date)
 *
 *   formatDateTime*  → @db.Timestamp fields and external timestamps. Time matters.
 *                      Displays in the user's browser local timezone by default.
 *                      For geographically-bound events where official communications
 *                      use a specific timezone, pass an explicit override and include
 *                      timeZoneName: 'short' so the label is shown in the UI.
 *                      Example: formatDateTimeReadable(doc.created_at)
 *                      Example: formatDateTimeFull(ignitionDate, { timeZone: 'America/Vancouver', timeZoneName: 'short' })
 */

export type DateInput = Date | string | number | null | undefined;

/**
 * Safely converts various date inputs to a Date object in UTC
 * All dates are treated as UTC input for consistent behavior across timezones
 */
const parseDate = (date: DateInput): Date | null => {
  if (!date) return null;

  if (date instanceof Date) {
    return isNaN(date.getTime()) ? null : date;
  }

  const parsed = new Date(date);
  return isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * Default locale for formatting
 */
export const DEFAULT_LOCALE = 'en-CA';

/**
 * Predefined format configurations for common date formats
 */
const DATE_FORMAT_CONFIGS = {
  iso: {
    locale: DEFAULT_LOCALE,
    options: {
      timeZone: 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    } as const,
  },
  readable: {
    locale: DEFAULT_LOCALE,
    options: {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    } as const,
  },
  full: {
    locale: DEFAULT_LOCALE,
    options: {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    } as const,
  },
  short: {
    locale: DEFAULT_LOCALE,
    options: {
      timeZone: 'UTC',
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
    } as const,
  },
  yearMonth: {
    locale: DEFAULT_LOCALE,
    options: { timeZone: 'UTC', year: 'numeric', month: '2-digit' } as const,
  },
  monthYear: {
    locale: DEFAULT_LOCALE,
    options: { timeZone: 'UTC', year: 'numeric', month: 'short' } as const,
  },
  readableDateTime: {
    locale: DEFAULT_LOCALE,
    options: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    } as const,
  },
  fullDateTime: {
    locale: DEFAULT_LOCALE,
    options: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    } as const,
  },
} as const;

/**
 * Helper function to format dates with common logic
 * @param date - Date to format (treated as UTC input)
 * @param locale - Locale for formatting
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string or null if invalid
 */
const formatDateWithOptions = (
  date: DateInput,
  locale: string,
  options: Intl.DateTimeFormatOptions,
): string | null => {
  const parsedDate = parseDate(date);
  if (!parsedDate) return null;

  return new Intl.DateTimeFormat(locale, options).format(parsedDate);
};

/**
 * Helper function to create date formatter functions
 * @param config - Configuration with locale and options
 * @returns Date formatter function
 */
const createDateFormatter = (config: {
  locale: string;
  options: Intl.DateTimeFormatOptions;
}) => {
  return (
    date: DateInput,
    dateTimeFormatOptions?: Intl.DateTimeFormatOptions,
  ): string | null => {
    return formatDateWithOptions(date, config.locale, {
      ...config.options,
      ...dateTimeFormatOptions,
    });
  };
};

/**
 * Formats a date in ISO format (YYYY-MM-DD) using Pacific timezone
 * @param date - Date to format (treated as UTC input)
 * @returns Formatted date string or null if invalid
 */
export const formatDateISO = createDateFormatter(DATE_FORMAT_CONFIGS.iso);

/**
 * Formats a date in readable format (MMM DD, YYYY) using Pacific timezone
 * @param date - Date to format (treated as UTC input)
 * @returns Formatted date string or null if invalid
 */
export const formatDateReadable = createDateFormatter(
  DATE_FORMAT_CONFIGS.readable,
);

/**
 * Formats a date in full format (MMMM DD, YYYY) using Pacific timezone
 * @param date - Date to format (treated as UTC input)
 * @returns Formatted date string or null if invalid
 */
export const formatDateFull = createDateFormatter(DATE_FORMAT_CONFIGS.full);

/**
 * Formats a date in short format (YY-MM-DD) using Pacific timezone
 * @param date - Date to format (treated as UTC input)
 * @returns Formatted date string or null if invalid
 */
export const formatDateShort = createDateFormatter(DATE_FORMAT_CONFIGS.short);

/**
 * Formats a date showing only year and month (YYYY-MM) using Pacific timezone
 * @param date - Date to format (treated as UTC input)
 * @returns Formatted date string or null if invalid
 */
export const formatYearMonth = createDateFormatter(
  DATE_FORMAT_CONFIGS.yearMonth,
);

/**
 * Formats a date showing month and year (MMM YYYY) using Pacific timezone
 * @param date - Date to format (treated as UTC input)
 * @returns Formatted date string or null if invalid
 */
export const formatMonthYear = createDateFormatter(
  DATE_FORMAT_CONFIGS.monthYear,
);

/**
 * Formats a @db.Timestamp in readable format (MMM D, YYYY, h:mm AM/PM) using browser local timezone.
 * @param date - Timestamp to format
 * @param dateTimeFormatOptions - Optional overrides (e.g. { timeZone: 'America/Vancouver', timeZoneName: 'short' })
 * @returns Formatted datetime string or null if invalid
 */
export const formatDateTimeReadable = createDateFormatter(
  DATE_FORMAT_CONFIGS.readableDateTime,
);

/**
 * Formats a @db.Timestamp in full format (MMMM D, YYYY, h:mm AM/PM) using browser local timezone.
 * @param date - Timestamp to format
 * @param dateTimeFormatOptions - Optional overrides (e.g. { timeZone: 'America/Vancouver', timeZoneName: 'short' })
 * @returns Formatted datetime string or null if invalid
 */
export const formatDateTimeFull = createDateFormatter(
  DATE_FORMAT_CONFIGS.fullDateTime,
);

/**
 * Generic date formatter with custom options
 * @param date - Date to format (treated as UTC input)
 * @param locale - Locale for formatting (default: 'en-CA')
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string or null if invalid
 */
export const formatDateCustom = (
  date: DateInput,
  locale: string = DEFAULT_LOCALE,
  options: Intl.DateTimeFormatOptions,
): string | null => {
  return formatDateWithOptions(date, locale, options);
};

/**
 * Checks if a date is valid
 * @param date - Date to validate
 * @returns True if date is valid, false otherwise
 */
export const isValidDate = (date: DateInput): boolean => {
  return parseDate(date) !== null;
};

/**
 * Gets the current date in ISO format
 * @returns Current date in YYYY-MM-DD format
 */
export const getCurrentDateISO = (): string => {
  return formatDateISO(new Date()) as string;
};
