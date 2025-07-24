import { useCallback, useMemo } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { useRecreationSuggestions } from '@/service/queries/recreation-resource';
import { SuggestionMenu } from '@/components/recreation-search-form/SuggestionMenu';
import { SuggestionTypeahead } from '@shared/components/suggestion-typeahead/SuggestionTypeahead';
import { useSearchCitiesApi } from '@/components/recreation-search-form/hooks/useSearchCitiesApi';
import { useCurrentLocation } from '@/components/recreation-search-form/hooks/useCurrentLocation';
import { useSearchInput } from '@/components/recreation-search-form/hooks/useSearchInput';
import {
  RenderMenuProps,
  TypeaheadComponentProps,
} from 'react-bootstrap-typeahead';
import NotificationToast from '@/components/notifications/NotificationToast';
import {
  City as CitySuggestion,
  RecreationSuggestion,
} from '@/components/recreation-search-form/types';
import { useNavigate } from 'react-router';
import '@/components/recreation-search-form/RecreationSuggestionForm.scss';
import { Option } from 'react-bootstrap-typeahead/types/types';
import { ROUTE_PATHS } from '@/routes/constants';
import {
  CURRENT_LOCATION_TITLE,
  MAX_LOCATION_OPTIONS,
  OPTION_TYPE,
} from '@/components/recreation-search-form/constants';

interface RecreationSuggestionFormProps {
  searchBtnVariant?: 'primary' | 'secondary';
}

export const RecreationSuggestionForm = ({
  searchBtnVariant = 'primary',
}: RecreationSuggestionFormProps) => {
  const navigate = useNavigate();
  const { data: citiesList } = useSearchCitiesApi();
  const { getLocation, permissionDeniedCount } = useCurrentLocation();
  const {
    defaultSearchInputValue,
    searchInputValue,
    setSearchInputValue,
    handleCityOptionSearch,
    handleClearTypeaheadSearch,
    handleSearch,
  } = useSearchInput();

  const isPermissionDenied = useMemo(
    () => permissionDeniedCount > 0,
    [permissionDeniedCount],
  );

  const currentLocationOption = useMemo<CitySuggestion>(
    () => ({
      id: 0,
      name: CURRENT_LOCATION_TITLE,
      latitude: undefined,
      longitude: undefined,
      rank: 0,
      option_type: OPTION_TYPE.CURRENT_LOCATION,
    }),
    [],
  );

  const cityOptions = useMemo(() => {
    const searchText = searchInputValue?.toLowerCase() ?? '';

    const filteredCities = (citiesList ?? [])
      .filter(
        (city) =>
          city.name.toLowerCase().startsWith(searchText) ||
          city.name.toLowerCase().includes(` ${searchText}`),
      )
      .slice(0, MAX_LOCATION_OPTIONS);

    return [...filteredCities, currentLocationOption];
  }, [currentLocationOption, searchInputValue, citiesList]);

  const {
    data: suggestions,
    error,
    isFetching,
  } = useRecreationSuggestions({
    query: searchInputValue,
  });

  const renderMenu: TypeaheadComponentProps['renderMenu'] = useCallback(
    (results: Option[], menuProps: RenderMenuProps) => (
      <SuggestionMenu
        results={results as RecreationSuggestion[]}
        searchTerm={searchInputValue}
        menuProps={menuProps}
        cityOptions={cityOptions}
      />
    ),
    [searchInputValue, cityOptions],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInputValue.trim()) {
      handleSearch();
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchInputValue.trim()) {
        handleSearch();
      }
    }
  };

  const handleSuggestionChange = async (
    suggestion: RecreationSuggestion | CitySuggestion,
  ) => {
    const suggestionType = suggestion.option_type;

    switch (suggestionType) {
      case OPTION_TYPE.CURRENT_LOCATION: {
        try {
          const { latitude, longitude } = await getLocation();
          if (latitude == null || longitude == null) {
            console.warn('Current location not available');
            return;
          }
          const updatedCurrentLocation = {
            ...currentLocationOption,
            latitude,
            longitude,
          };

          handleCityOptionSearch(updatedCurrentLocation);
        } catch (err) {
          console.warn('Failed to get current location:', err);
        }
        return;
      }

      case OPTION_TYPE.RECREATION_RESOURCE:
        navigate(
          ROUTE_PATHS.REC_RESOURCE.replace(':id', suggestion.rec_resource_id),
        );
        return;

      case OPTION_TYPE.CITY:
        handleCityOptionSearch(suggestion);
        return;

      default:
        console.warn('Unhandled suggestion type:', suggestionType);
    }
  };

  return (
    <>
      <Form className="w-100 recreation-resource-suggestion-form">
        <SuggestionTypeahead
          onChange={handleSuggestionChange}
          onClear={handleClearTypeaheadSearch}
          onKeyDown={handleInputKeyDown}
          isLoading={isFetching}
          error={error}
          defaultValue={defaultSearchInputValue}
          suggestions={suggestions as RecreationSuggestion[]}
          onSearch={setSearchInputValue}
          emptyLabel="No results found"
          renderMenu={renderMenu}
          placeholder="By name or community"
        />
        <Button
          variant={searchBtnVariant}
          type="submit"
          onClick={handleSubmit}
          className="submit-btn"
        >
          Search
        </Button>
      </Form>
      <NotificationToast
        isOpen={isPermissionDenied}
        title="Location permission blocked"
        messages={[
          'Recreation Sites and Trails does not have permission to show your location.',
          permissionDeniedCount > 1
            ? 'Please update your location permission and try again.'
            : '',
        ].filter(Boolean)}
        variant="warning"
      />
    </>
  );
};
