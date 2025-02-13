import { URLSearchFilterParams } from './types';

/**
 * Extracts filter parameters from URLSearchParams object
 *
 * @param searchParams - URLSearchParams object containing query parameters
 * @returns URLSearchFilterParams object with extracted filter values or undefined
 */
export const getFilterState = (
  searchParams: URLSearchParams,
): URLSearchFilterParams => ({
  activities: searchParams.get('activities') ?? undefined,
  type: searchParams.get('type') ?? undefined,
  filter: searchParams.get('filter') ?? undefined,
  district: searchParams.get('district') ?? undefined,
  access: searchParams.get('access') ?? undefined,
  facilities: searchParams.get('facilities') ?? undefined,
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
