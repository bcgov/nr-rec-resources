import { URLSearchFilterParams } from './types';

/**
 * Extracts filter parameters from search params object
 *
 * @param searchParams - Search params object containing query parameters
 * @returns URLSearchFilterParams object with extracted filter values or undefined
 */
export const getFilterState = (
  searchParams: Record<string, any>,
): URLSearchFilterParams => ({
  activities: searchParams.activities ?? undefined,
  type: searchParams.type ?? undefined,
  filter: searchParams.filter ?? undefined,
  district: searchParams.district ?? undefined,
  access: searchParams.access ?? undefined,
  facilities: searchParams.facilities ?? undefined,
});

/**
 * Compares two URLSearchFilterParams objects to detect changes
 *
 * @param current - Current filter state object
 * @param prev - Previous filter state object to compare against
 * @returns boolean indicating whether any filter values have changed
 */
export const haveFiltersChanged = (
  current: URLSearchFilterParams,
  prev: URLSearchFilterParams,
): boolean => {
  return Object.keys(current).some(
    (key) =>
      current[key as keyof URLSearchFilterParams] !==
      prev[key as keyof URLSearchFilterParams],
  );
};
