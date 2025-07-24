import { useCallback, useEffect } from 'react';
import { useStore } from '@tanstack/react-store';
import { useSearchParams, useNavigate } from 'react-router-dom';
import searchInputStore from '@/store/searchInputStore';
import { ROUTE_PATHS } from '@/routes';
import { City } from '@/components/recreation-search-form/types';

export const FILTER_PARAM_KEY = 'filter';
const LAT_PARAM_KEY = 'lat';
const LON_PARAM_KEY = 'lon';
const COMMUNITY_PARAM_KEY = 'community';

export const useSearchInput = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const state = useStore(searchInputStore);

  const setSearchInputValue = useCallback(
    (val: string) =>
      searchInputStore.setState((prev) => ({
        ...prev,
        searchInputValue: val,
      })),
    [],
  );

  const setSelectedCity = useCallback(
    (city: City[] | []) =>
      searchInputStore.setState((prev) => ({
        ...prev,
        selectedCity: city,
      })),
    [],
  );

  const handleSearch = useCallback(() => {
    const trimmedValue = state.searchInputValue.trim();
    const newParams = new URLSearchParams(searchParams);

    if (trimmedValue) {
      newParams.set(FILTER_PARAM_KEY, trimmedValue);
    } else {
      newParams.delete(FILTER_PARAM_KEY);
    }

    navigate({
      pathname: ROUTE_PATHS.SEARCH,
      search: newParams.toString(),
    });
  }, [navigate, searchParams, state.searchInputValue]);

  const handleClearSearch = useCallback(() => {
    setSearchInputValue('');
    setSelectedCity([]);

    const newParams = new URLSearchParams();
    setSearchParams(newParams);
  }, [setSearchInputValue, setSelectedCity, setSearchParams]);

  const handleClearTypeaheadSearch = useCallback(() => {
    setSearchInputValue('');
    setSelectedCity([]);

    const newParams = new URLSearchParams(searchParams.toString());
    // Remove only params that get set during typeahead search
    newParams.delete(FILTER_PARAM_KEY);
    newParams.delete(LAT_PARAM_KEY);
    newParams.delete(LON_PARAM_KEY);
    newParams.delete(COMMUNITY_PARAM_KEY);

    setSearchParams(Object.fromEntries(newParams.entries()));
  }, [searchParams, setSearchInputValue, setSelectedCity, setSearchParams]);

  const handleCityOptionSearch = useCallback(
    (city: City) => {
      if (!city) return;
      console.log('handleCityOptionSearch', city);

      const newParams = new URLSearchParams(searchParams);
      newParams.set(LAT_PARAM_KEY, String(city.latitude));
      newParams.set(LON_PARAM_KEY, String(city.longitude));
      newParams.set(COMMUNITY_PARAM_KEY, city.name.trim());

      setSelectedCity([city]);

      navigate({
        pathname: ROUTE_PATHS.SEARCH,
        search: newParams.toString(),
      });
    },
    [navigate, searchParams, setSelectedCity],
  );

  // Initialize state from query params
  useEffect(() => {
    const filter = searchParams.get(FILTER_PARAM_KEY);
    if (filter) {
      setSearchInputValue(filter);
    }
  }, [searchParams, setSearchInputValue]);

  const defaultSearchInputValue =
    searchParams.get(FILTER_PARAM_KEY) ||
    searchParams.get(COMMUNITY_PARAM_KEY) ||
    '';

  return {
    defaultSearchInputValue,
    searchInputValue: state.searchInputValue,
    setSearchInputValue,
    selectedCity: state.selectedCity,
    setSelectedCity,
    handleSearch,
    handleClearSearch,
    handleClearTypeaheadSearch,
    handleCityOptionSearch,
  };
};
