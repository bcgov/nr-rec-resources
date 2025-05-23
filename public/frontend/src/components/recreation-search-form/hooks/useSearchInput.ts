import { useEffect } from 'react';
import { useStore } from '@tanstack/react-store';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { City } from '@/components/recreation-search-form/types';
import searchInputStore from '@/store/searchInputStore';
import { ROUTE_PATHS } from '@/routes';

interface UseSearchInputReturn {
  cityInputValue?: string;
  setCityInputValue: (value: string) => void;
  nameInputValue: string;
  setNameInputValue: (value: string) => void;
  selectedCity?: City[] | [];
  setSelectedCity: (city: City[] | []) => void;
  handleSearch: () => void;
  handleClearSearch: () => void;
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
  const filter = searchParams.get(NAME_INPUT_PARAM_KEY);
  const community = searchParams.get(COMMUNITY_PARAM_KEY);
  const navigate = useNavigate();
  const state = useStore(searchInputStore);

  const setNameInputValue = (val: string) =>
    searchInputStore.setState((prev) => ({ ...prev, nameInputValue: val }));

  const setCityInputValue = (val: string) =>
    searchInputStore.setState((prev) => ({ ...prev, cityInputValue: val }));

  const setSelectedCity = (city: City[]) =>
    searchInputStore.setState((prev) => ({ ...prev, selectedCity: city }));

  const handleSearch = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set(NAME_INPUT_PARAM_KEY, state.nameInputValue.trim());

    navigate({
      pathname: ROUTE_PATHS.SEARCH,
      search: newParams.toString(),
    });
  };

  useEffect(() => {
    if (filter) {
      setNameInputValue(filter);
    }
    if (community) {
      setCityInputValue(community);
    }
  }, []);

  const handleCityInputSearch = (city: City) => {
    if (!city) return;

    const trimmedCityInputValue = city.cityName.trim();
    const newParams = new URLSearchParams(searchParams);
    newParams.set(LATITUDE_PARAM_KEY, String(city.latitude));
    newParams.set(LONGITUDE_PARAM_KEY, String(city.longitude));
    newParams.set(COMMUNITY_PARAM_KEY, trimmedCityInputValue);

    if (state.nameInputValue.trim()) {
      newParams.set(NAME_INPUT_PARAM_KEY, state.nameInputValue.trim());
    }

    setSelectedCity([city]);

    navigate({
      pathname: ROUTE_PATHS.SEARCH,
      search: newParams.toString(),
    });
  };

  const handleClearNameInput = () => {
    setNameInputValue('');
    const newParams = new URLSearchParams(searchParams);
    newParams.delete(NAME_INPUT_PARAM_KEY);
    setSearchParams(newParams);
  };

  const handleClearCityInput = () => {
    setCityInputValue('');
    setSelectedCity([]);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete(LATITUDE_PARAM_KEY);
    newParams.delete(LONGITUDE_PARAM_KEY);
    newParams.delete(COMMUNITY_PARAM_KEY);
    setSearchParams(newParams);
  };

  const handleClearSearch = () => {
    setNameInputValue('');
    setCityInputValue('');
    setSelectedCity([]);
    const newParams = new URLSearchParams();
    setSearchParams(newParams);
  };

  return {
    nameInputValue: state.nameInputValue,
    setNameInputValue,
    cityInputValue: state.cityInputValue,
    setCityInputValue,
    selectedCity: state.selectedCity,
    setSelectedCity,
    handleSearch,
    handleClearSearch,
    handleClearNameInput,
    handleCityInputSearch,
    handleClearCityInput,
  };
};
