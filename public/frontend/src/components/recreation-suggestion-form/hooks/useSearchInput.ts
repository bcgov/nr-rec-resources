import { useCallback, useEffect } from 'react';
import { useStore } from '@tanstack/react-store';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import searchInputStore from '@/store/searchInputStore';
import { ROUTE_PATHS } from '@/constants/routes';
import { City } from '@/components/recreation-suggestion-form/types';

export const FILTER_PARAM_KEY = 'filter';
const LAT_PARAM_KEY = 'lat';
const LON_PARAM_KEY = 'lon';
const COMMUNITY_PARAM_KEY = 'community';

export const useSearchInput = () => {
  const navigate = useNavigate();
  const search = useRouterState({
    select: (s) => s.location.search,
  });
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

  const handleSearch = useCallback(
    (inputValue: string) => {
      const trimmedValue = (inputValue ?? state.searchInputValue).trim();

      const newParams: Record<string, string> = { ...search };

      // Clear city-related params when performing a text search
      delete newParams[LAT_PARAM_KEY];
      delete newParams[LON_PARAM_KEY];
      delete newParams[COMMUNITY_PARAM_KEY];

      if (trimmedValue) newParams[FILTER_PARAM_KEY] = trimmedValue;
      else delete newParams[FILTER_PARAM_KEY];

      navigate({
        to: ROUTE_PATHS.SEARCH,
        search: newParams,
      });
    },
    [navigate, search, state.searchInputValue],
  );

  const handleClearSearch = useCallback(() => {
    setSearchInputValue('');
    setSelectedCity([]);
    navigate({
      to: ROUTE_PATHS.SEARCH,
      search: {},
    });
  }, [navigate, setSearchInputValue, setSelectedCity]);

  const handleClearTypeaheadSearch = useCallback(() => {
    const isMapView = search.view === 'map';
    searchInputStore.setState((prev) => ({
      ...prev,
      searchInputValue: '',
      selectedCity: [],
      // Only set wasCleared if on map view
      // as we use it to prevent auto-zooming when clearing the search
      wasCleared: isMapView,
    }));

    const newParams = { ...search };

    // Remove only params that get set during typeahead search
    delete newParams[FILTER_PARAM_KEY];
    delete newParams[LAT_PARAM_KEY];
    delete newParams[LON_PARAM_KEY];
    delete newParams[COMMUNITY_PARAM_KEY];

    navigate({
      to: ROUTE_PATHS.SEARCH,
      search: newParams,
    });
  }, [navigate, search]);

  const handleClearCityParams = useCallback(() => {
    const newParams = { ...search };
    delete newParams[LAT_PARAM_KEY];
    delete newParams[LON_PARAM_KEY];
    delete newParams[COMMUNITY_PARAM_KEY];

    navigate({
      to: ROUTE_PATHS.SEARCH,
      search: newParams,
    });
  }, [navigate, search]);

  const handleCityOptionSearch = useCallback(
    (city: City) => {
      if (!city) return;

      const newParams: Record<string, string> = {
        ...search,
        [LAT_PARAM_KEY]: String(city.latitude),
        [LON_PARAM_KEY]: String(city.longitude),
        [COMMUNITY_PARAM_KEY]: city.name.trim(),
      };
      delete newParams[FILTER_PARAM_KEY];

      setSelectedCity([city]);
      navigate({
        to: ROUTE_PATHS.SEARCH,
        search: newParams,
      });
    },
    [navigate, search, setSelectedCity],
  );

  // Initialize state from query params
  useEffect(() => {
    const filter = search[FILTER_PARAM_KEY];
    if (filter) setSearchInputValue(filter);
  }, [search, setSearchInputValue]);

  const defaultSearchInputValue =
    search[FILTER_PARAM_KEY] || search[COMMUNITY_PARAM_KEY] || '';

  return {
    defaultSearchInputValue,
    searchInputValue: state.searchInputValue,
    setSearchInputValue,
    selectedCity: state.selectedCity,
    setSelectedCity,
    handleSearch,
    handleClearSearch,
    handleClearTypeaheadSearch,
    handleClearCityParams,
    handleCityOptionSearch,
  };
};
