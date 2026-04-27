import { useQuery } from '@tanstack/react-query';
import { OPTION_TYPE } from '@/components/recreation-suggestion-form/constants';
import { City } from '@/components/recreation-suggestion-form/types';

const SEARCH_CITIES_API_URL = import.meta.env.VITE_SEARCH_CITIES_API_URL;
const SEARCH_CITIES_API_PARAMS =
  '?pagination[page]=1&pagination[pageSize]=1000&filters[rank][$ne]=5&sort=cityName:asc';

interface RawCity {
  id: number;
  documentId: string;
  cityName: string;
  rank: number;
  provinceCode: string;
  latitude: number;
  longitude: number;
}

const fetchCities = async (): Promise<City[]> => {
  const url = `${SEARCH_CITIES_API_URL}${SEARCH_CITIES_API_PARAMS}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch cities');
  }
  const json = await response.json();
  const cities = json.data.map(
    (city: RawCity): City => ({
      id: city.id,
      name: city.cityName,
      latitude: city.latitude,
      longitude: city.longitude,
      rank: city.rank,
      option_type: OPTION_TYPE.CITY,
    }),
  );

  return cities;
};

export const useSearchCitiesApi = () => {
  return useQuery({
    queryKey: ['searchCities'],
    queryFn: fetchCities,
    retry: 1,
  });
};
