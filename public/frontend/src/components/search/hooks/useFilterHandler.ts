import { useNavigate, useSearch } from '@tanstack/react-router';
import removeFilter from '@/utils/removeFilter';
import { FilterChip } from '@/components/search/types';
import { filterChipStore } from '@/store';
import { trackEvent } from '@shared/utils';
import { ROUTE_PATHS } from '@/constants/routes';
import {
  MATOMO_ACTION_FILTERS_LIST_DESKTOP,
  MATOMO_CATEGORY_FILTERS,
} from '@/constants/analytics';

export const useFilterHandler = () => {
  const navigate = useNavigate();
  const searchParams = useSearch({ from: '/search/' });

  const toggleFilter = (filterChip: FilterChip, isChecked?: boolean) => {
    const { id, label, param } = filterChip;

    const urlSearchParams = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        urlSearchParams.set(key, String(value));
      }
    });

    const updateFilters = removeFilter(id, param, urlSearchParams);

    if (isChecked) {
      const newValue = updateFilters ? `${updateFilters}_${id}` : id;
      // Convert to number if it's a numeric string to prevent quote serialization
      const paramValue =
        !updateFilters && !isNaN(Number(id)) ? Number(id) : newValue;
      navigate({
        to: ROUTE_PATHS.SEARCH,
        search: (prev) => ({
          ...prev,
          [param]: paramValue,
        }),
        resetScroll: false,
      });
      if (!filterChipStore.state?.some((filter) => filter.id === id)) {
        filterChipStore.setState((prevState) => [
          ...prevState,
          { param, id, label },
        ]);
      }
      trackEvent({
        category: MATOMO_CATEGORY_FILTERS,
        action: MATOMO_ACTION_FILTERS_LIST_DESKTOP,
        name: `${MATOMO_ACTION_FILTERS_LIST_DESKTOP}_${label}`,
      });
    } else {
      filterChipStore.setState((prevState) =>
        prevState.filter((filter) => filter.id !== id),
      );

      navigate({
        to: ROUTE_PATHS.SEARCH,
        search: (prev) => {
          const newParams = { ...prev } as Record<string, string | undefined>;
          if (!updateFilters) {
            delete newParams[param];
          } else {
            newParams[param] = updateFilters;
          }
          return newParams;
        },
        resetScroll: false,
      });
    }
  };

  return { toggleFilter };
};
