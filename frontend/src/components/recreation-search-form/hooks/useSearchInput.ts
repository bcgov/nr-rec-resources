import { useState } from 'react';
import {
  URLSearchParamsInit,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { City } from '@/components/recreation-search-form/types';
import { ROUTE_PATHS } from '@/routes';

interface UseSearchInputProps {
  initialCityInputValue?: string;
  initialNameInputValue?: string;
}

interface UseSearchInputReturn {
  cityInputValue?: string;
  setCityInputValue: (value: string) => void;
  nameInputValue: string;
  setNameInputValue: (value: string) => void;
  selectedCity?: City[] | [];
  setSelectedCity: (city: City[] | []) => void;
  handleSearch: (city?: City) => void;
  handleClear: () => void;
}

const NAME_INPUT_PARAM_KEY = 'filter';
const LATITUDE_PARAM_KEY = 'lat';
const LONGITUDE_PARAM_KEY = 'lon';

export const useSearchInput = ({
  initialCityInputValue,
  initialNameInputValue,
}: UseSearchInputProps = {}): UseSearchInputReturn => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [nameInputValue, setNameInputValue] = useState(
    initialNameInputValue ?? searchParams.get(NAME_INPUT_PARAM_KEY) ?? '',
  );
  const [cityInputValue, setCityInputValue] = useState<string>(
    initialCityInputValue ?? '',
  );
  const [selectedCity, setSelectedCity] = useState<City[] | []>([]);
  const navigate = useNavigate();

  const handleSearch = (city?: City) => {
    const trimmedNameInputValue = nameInputValue.trim();
    const newParams = new URLSearchParams(searchParams);
    newParams.set(NAME_INPUT_PARAM_KEY, trimmedNameInputValue);
    if (city?.latitude && city?.longitude) {
      newParams.set(LATITUDE_PARAM_KEY, String(city.latitude));
      newParams.set(LONGITUDE_PARAM_KEY, String(city.longitude));
    }
    navigate({
      pathname: ROUTE_PATHS.SEARCH,
      search: newParams.toString(),
    });
  };

  const handleClear = () => {
    setNameInputValue('');
    const newParams = new URLSearchParams(searchParams);
    newParams.delete(NAME_INPUT_PARAM_KEY);
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
    handleClear,
  };
};
