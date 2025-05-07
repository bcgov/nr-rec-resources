import { useState } from 'react';
import {
  URLSearchParamsInit,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { City } from '@/components/recreation-search-form/types';
import { ROUTE_PATHS } from '@/routes';

interface UseSearchInputReturn {
  cityInputValue?: string;
  setCityInputValue: (value: string) => void;
  nameInputValue: string;
  setNameInputValue: (value: string) => void;
  selectedCity?: City[] | [];
  setSelectedCity: (city: City[] | []) => void;
  handleSearch: () => void;
  handleClearNameInput: () => void;
  handleCityInputSearch: (city: City) => void;
  handleClearCityInput: () => void;
}

const NAME_INPUT_PARAM_KEY = 'filter';
const LATITUDE_PARAM_KEY = 'lat';
const LONGITUDE_PARAM_KEY = 'lon';
const COMMUNITY_PARAM_KEY = 'community';

export const useSearchInput = (): UseSearchInputReturn => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [nameInputValue, setNameInputValue] = useState(
    searchParams.get(NAME_INPUT_PARAM_KEY) ?? '',
  );
  const [cityInputValue, setCityInputValue] = useState<string>(
    searchParams.get(COMMUNITY_PARAM_KEY) ?? '',
  );
  const [selectedCity, setSelectedCity] = useState<City[] | []>([]);
  const navigate = useNavigate();

  const handleSearch = () => {
    const trimmedNameInputValue = nameInputValue.trim();
    const newParams = new URLSearchParams(searchParams);
    newParams.set(NAME_INPUT_PARAM_KEY, trimmedNameInputValue);

    navigate({
      pathname: ROUTE_PATHS.SEARCH,
      search: newParams.toString(),
    });
  };

  const handleCityInputSearch = (city: City) => {
    if (!city) return;
    const trimmedCityInputValue = city?.cityName.trim();
    const newParams = new URLSearchParams(searchParams);
    newParams.set(LATITUDE_PARAM_KEY, String(city.latitude));
    newParams.set(LONGITUDE_PARAM_KEY, String(city.longitude));
    newParams.set(COMMUNITY_PARAM_KEY, trimmedCityInputValue);

    navigate({
      pathname: ROUTE_PATHS.SEARCH,
      search: newParams.toString(),
    });
  };

  const handleClearNameInput = () => {
    setNameInputValue('');
    const newParams = new URLSearchParams(searchParams);
    newParams.delete(NAME_INPUT_PARAM_KEY);
    setSearchParams(newParams as URLSearchParamsInit);
  };

  const handleClearCityInput = () => {
    setCityInputValue('');
    const newParams = new URLSearchParams(searchParams);
    newParams.delete(LATITUDE_PARAM_KEY);
    newParams.delete(LONGITUDE_PARAM_KEY);
    setSearchParams(newParams as URLSearchParamsInit);
  };

  return {
    cityInputValue,
    setCityInputValue,
    nameInputValue,
    setNameInputValue,
    selectedCity,
    setSelectedCity,
    handleSearch,
    handleClearNameInput,
    handleCityInputSearch,
    handleClearCityInput,
  };
};
