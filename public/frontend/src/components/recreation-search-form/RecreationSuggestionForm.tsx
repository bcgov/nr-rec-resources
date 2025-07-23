import { useCallback, useMemo } from 'react';
import Form from 'react-bootstrap/Form';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { useRecreationSuggestions } from '@/service/queries/recreation-resource';
import { SuggestionMenu } from '@/components/recreation-search-form/SuggestionMenu';
import { SuggestionTypeahead } from '@shared/components/suggestion-typeahead/SuggestionTypeahead';
import { useSearchCitiesApi } from '@/components/recreation-search-form/hooks/useSearchCitiesApi';
import { useCurrentLocation } from '@/components/recreation-search-form/hooks/useCurrentLocation';
import { useSearchInput } from '@/components/recreation-search-form/hooks/useSearchInput';
import NotificationToast from '@/components/notifications/NotificationToast';
import { RecreationResourceSuggestion } from '@shared/components/suggestion-typeahead/types';
import { City as CitySuggestion } from '@/components/recreation-search-form/types';
import { useNavigate } from 'react-router';
import '@/components/recreation-search-form/RecreationSuggestionForm.scss';
import {
  RenderMenuProps,
  TypeaheadComponentProps,
} from 'react-bootstrap-typeahead';
import { Option } from 'react-bootstrap-typeahead/types/types';
import { ROUTE_PATHS } from '@/routes/constants';

const MAX_LOCATION_OPTIONS = 4;
const CURRENT_LOCATION_TITLE = 'Current location';

export const RecreationSuggestionForm = () => {
  const navigate = useNavigate();
  const { data: citiesList } = useSearchCitiesApi();
  const { getLocation, latitude, longitude, permissionDeniedCount } =
    useCurrentLocation();
  const { searchInputValue, setSearchInputValue, handleCityOptionSearch } =
    useSearchInput();

  const isPermissionDenied = useMemo(
    () => permissionDeniedCount > 0,
    [permissionDeniedCount],
  );

  const currentLocationOption = useMemo<CitySuggestion>(
    () => ({
      id: 0,
      name: CURRENT_LOCATION_TITLE,
      latitude: latitude ?? 0,
      longitude: longitude ?? 0,
      rank: 0,
      option_type: 'current_location',
    }),
    [latitude, longitude],
  );

  const cityOptions = useMemo(() => {
    const searchText = searchInputValue?.toLowerCase() ?? '';
    console.log('citiesList:', citiesList);

    const cities = (citiesList ?? [])
      .filter(
        (city) =>
          city.name.toLowerCase().startsWith(searchText) ||
          city.name.toLowerCase().includes(` ${searchText}`),
      )
      .slice(0, MAX_LOCATION_OPTIONS);

    cities.push(currentLocationOption);

    return cities;
  }, [searchInputValue, currentLocationOption, citiesList]);

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
        results={results as RecreationResourceSuggestion[]}
        searchTerm={searchInputValue}
        menuProps={menuProps}
        cityOptions={cityOptions}
      />
    ),
    [searchInputValue, cityOptions],
  );

  const handleSuggestionChange = (
    suggestion: RecreationResourceSuggestion | CitySuggestion,
  ) => {
    const suggestionType = suggestion.option_type;

    switch (suggestionType) {
      case 'current_location':
        if (!latitude || !longitude) return getLocation();
        return handleCityOptionSearch(currentLocationOption);

      case 'recreation_resource':
        navigate(
          ROUTE_PATHS.REC_RESOURCE.replace(':id', suggestion.rec_resource_id),
        );
        return;

      case 'city':
        handleCityOptionSearch(suggestion);
        return;

      default:
        console.warn('Unhandled suggestion type:', suggestionType);
    }
  };

  const getEmptyLabel = () => {
    return 'No results found';
  };

  return (
    <>
      <Form className="w-100 recreation-resource-suggestion-form">
        <Form.Group controlId="recreation-resource-suggestion">
          <SuggestionTypeahead
            onChange={handleSuggestionChange}
            isLoading={isFetching}
            error={error}
            suggestions={suggestions as RecreationResourceSuggestion[]}
            onSearch={setSearchInputValue}
            emptyLabel={getEmptyLabel()}
            renderMenu={renderMenu}
            placeholder="By name or community"
          />
        </Form.Group>
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
