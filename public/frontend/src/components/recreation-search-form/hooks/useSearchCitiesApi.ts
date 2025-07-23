import { useQuery } from '~/@tanstack/react-query';
import { City } from '@/components/recreation-search-form/types';

const SEARCH_CITIES_API_URL = import.meta.env.VITE_SEARCH_CITIES_API_URL;
const SEARCH_CITIES_API_PARAMS =
  '?pagination[page]=1&pagination[pageSize]=1000&filters[rank][$ne]=5&sort=cityName:asc';

interface RawCity {
  id: string;
  attributes: {
    cityName: string;
    rank: number;
    provinceCode: string;
    latitude: number;
    longitude: number;
  };
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
      id: Number(city.id),
      name: city.attributes.cityName,
      latitude: city.attributes.latitude,
      longitude: city.attributes.longitude,
      rank: city.attributes.rank,
      option_type: 'city',
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
