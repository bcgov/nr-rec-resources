import Fuse, { type IFuseOptions } from 'fuse.js';
import { MAX_LOCATION_OPTIONS } from '@/components/recreation-suggestion-form/constants';
import { City } from '@/components/recreation-suggestion-form/types';

const CITY_SUGGESTIONS_OPTIONS: IFuseOptions<City> = {
  threshold: 0.4,
  keys: ['name'],
  minMatchCharLength: 1,
  useExtendedSearch: true,
  findAllMatches: true,
};

export const BEST_MATCH_CITY_OPTIONS: IFuseOptions<City> = {
  threshold: 0.2,
  keys: ['name'],
  minMatchCharLength: 4,
  includeScore: true,
  ignoreLocation: false,
  ignoreFieldNorm: true,
};

export const fuzzySearchCities = (cities: City[], query: string): City[] => {
  if (!query.trim()) return cities.slice(0, MAX_LOCATION_OPTIONS);

  const fuse = new Fuse(cities, CITY_SUGGESTIONS_OPTIONS);
  return fuse.search(query, { limit: MAX_LOCATION_OPTIONS }).map((r) => r.item);
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
  const SCORE_THRESHOLD = 0.075;

  for (const result of results) {
    if (Number(result.score) > SCORE_THRESHOLD) continue;

    const cityTokens = result.item.name.trim().split(/\s+/);
    const isCitySingleWord = cityTokens.length === 1;

    //
    // Rule 1: single-word query should only match single-word city names
    if (isQuerySingleWord && !isCitySingleWord) continue;

    // Rule 2: multi-word query must have same number of words as city name
    // (allows fuzzy matching but not partial queries)
    if (!isQuerySingleWord && queryTokens.length !== cityTokens.length)
      continue;

    return result.item;
  }

  return null;
};
