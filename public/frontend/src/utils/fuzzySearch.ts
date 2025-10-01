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

export const fuzzySearchBestCity = (
  cities: City[],
  query: string,
): City | null => {
  if (!query.trim()) return null;

  const fuse = new Fuse(cities, BEST_MATCH_CITY_OPTIONS);
  const results = fuse.search(query, { limit: 1 });
  const result = results[0];

  const SCORE_THRESHOLD = 0.075;

  return result && Number(result.score) <= SCORE_THRESHOLD ? result.item : null;
};
