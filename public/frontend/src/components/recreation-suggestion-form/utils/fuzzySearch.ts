import Fuse, { type IFuseOptions } from 'fuse.js';
import { MAX_LOCATION_OPTIONS } from '@/components/recreation-suggestion-form/constants';
import { City } from '@/components/recreation-suggestion-form/types';

const CITY_SUGGESTIONS_OPTIONS: IFuseOptions<City> = {
  threshold: 0.3,
  keys: ['name'],
  minMatchCharLength: 1,
  useExtendedSearch: true,
  findAllMatches: true,
};

export const BEST_MATCH_CITY_OPTIONS: IFuseOptions<City> = {
  threshold: 0.25,
  keys: ['name'],
  minMatchCharLength: 3,
  includeScore: true,
  ignoreLocation: false,
  ignoreFieldNorm: true,
};

export const fuzzySearchCities = (cities: City[], query: string): City[] => {
  if (!query.trim()) return cities.slice(0, MAX_LOCATION_OPTIONS);

  const fuse = new Fuse(cities, CITY_SUGGESTIONS_OPTIONS);
  return fuse.search(query, { limit: MAX_LOCATION_OPTIONS }).map((r) => r.item);
};

// Helper function to check if all query words have reasonable matches
const allWordsMatch = (queryWords: string[], cityWords: string[]): boolean => {
  const wordFuse = new Fuse(cityWords, {
    threshold: 0.3,
    minMatchCharLength: 1,
    includeScore: true,
  });

  return queryWords.every((queryWord) => {
    const results = wordFuse.search(queryWord);
    return results.length > 0 && Number(results[0].score) <= 0.3;
  });
};

// This needs to be more strict to avoid cases like "beach" matching "Welcome Beach"
// and doing a location search by a loose city name match
export const fuzzySearchBestCity = (
  cities: City[],
  query: string,
): City | null => {
  if (!query.trim()) return null;

  const fuse = new Fuse(cities, BEST_MATCH_CITY_OPTIONS);
  const queryTokens = query.trim().split(/\s+/);
  const isQuerySingleWord = queryTokens.length === 1;

  const results = fuse.search(query, { limit: 10 });
  const SCORE_THRESHOLD = 0.3;

  for (const result of results) {
    if (Number(result.score) > SCORE_THRESHOLD) continue;

    const cityTokens = result.item.name.trim().split(/\s+/);
    const isCitySingleWord = cityTokens.length === 1;

    // Single-word queries only match single-word cities
    if (isQuerySingleWord && !isCitySingleWord) continue;

    // For single-word queries, add stricter checks
    // This prevents "beach" from matching "Peachland" while still allowing fuzzy typos
    if (isQuerySingleWord && isCitySingleWord) {
      const cityName = result.item.name.toLowerCase();
      const queryLower = query.toLowerCase().trim();

      // Reject if query is an exact substring starting after position 0
      const substringIndex = cityName.indexOf(queryLower);
      if (substringIndex > 0) continue;

      // Reject if the length difference is too large (prevents "beach" → "Peachland")
      // Allow up to 3 character difference for typos (e.g., "sqaumish" → "Squamish")
      const lengthDiff = Math.abs(cityName.length - queryLower.length);
      if (lengthDiff > 3) continue;
    }

    // Multi-word queries must have same word count and each word must match
    if (!isQuerySingleWord) {
      if (queryTokens.length !== cityTokens.length) continue;
      if (!allWordsMatch(queryTokens, cityTokens)) continue;
    }

    return result.item;
  }

  return null;
};
