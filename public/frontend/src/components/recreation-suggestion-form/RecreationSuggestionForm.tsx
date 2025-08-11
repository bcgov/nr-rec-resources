import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { useRecreationSuggestions } from '@/service/queries/recreation-resource';
import { SuggestionMenu } from '@/components/recreation-suggestion-form/SuggestionMenu';
import { SuggestionTypeahead } from '@shared/components/suggestion-typeahead/SuggestionTypeahead';
import { useSearchCitiesApi } from '@/components/recreation-suggestion-form/hooks/useSearchCitiesApi';
import { useCurrentLocation } from '@/components/recreation-suggestion-form/hooks/useCurrentLocation';
import { useSearchInput } from '@/components/recreation-suggestion-form/hooks/useSearchInput';
import {
  RenderMenuProps,
  TypeaheadComponentProps,
} from 'react-bootstrap-typeahead';
import NotificationToast from '@/components/notifications/NotificationToast';
import {
  City as CitySuggestion,
  RecreationSuggestion,
} from '@/components/recreation-suggestion-form/types';
import '@/components/recreation-suggestion-form/RecreationSuggestionForm.scss';
import { Option } from 'react-bootstrap-typeahead/types/types';
import { trackClickEvent } from '@/utils/matomo';
import { ROUTE_PATHS } from '@/routes/constants';
import {
  CURRENT_LOCATION_TITLE,
  MAX_LOCATION_OPTIONS,
  OPTION_TYPE,
  SEARCH_PLACEHOLDER,
} from '@/components/recreation-suggestion-form/constants';

interface RecreationSuggestionFormProps {
  allowEmptySearch?: boolean;
  disableNavigation?: boolean;
  searchBtnVariant?: 'primary' | 'secondary';
  trackingSource: string; // Used for tracking which page the search is initiated from ie 'Landing page', 'Search map'
}

const RecreationSuggestionForm = ({
  allowEmptySearch,
  disableNavigation = false,
  searchBtnVariant = 'primary',
  trackingSource,
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

  const trackingName = `Recreation Resource ${trackingSource} search`;

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

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const input = e.currentTarget.querySelector('input') as HTMLInputElement;
      const inputValue = input?.value ?? '';

      if (inputValue.trim() || allowEmptySearch) {
        handleSearch(inputValue);
      }
      trackClickEvent({
        category: trackingName,
        name: 'Search button clicked',
      })();
    },
    [allowEmptySearch, handleSearch, trackingName],
  );

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const inputValue = (e.target as HTMLInputElement).value;

        if (inputValue.trim() || allowEmptySearch) {
          handleSearch(inputValue);
        }
      }
    },
    [allowEmptySearch, handleSearch],
  );

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
          trackClickEvent({
            category: trackingName,
            name: `Current location selected`,
          })();
        } catch (err) {
          console.warn('Failed to get current location:', err);
        }
        return;
      }

      case OPTION_TYPE.RECREATION_RESOURCE:
        if (disableNavigation) {
          return handleSearch(suggestion.name);
        }
        trackClickEvent({
          category: trackingName,
          name: `Recreation resource selected: ${suggestion.name}`,
        })();
        navigate(
          ROUTE_PATHS.REC_RESOURCE.replace(':id', suggestion.rec_resource_id),
        );
        return;

      case OPTION_TYPE.CITY:
        trackClickEvent({
          category: trackingName,
          name: `City selected: ${suggestion.name}`,
        })();
        handleCityOptionSearch(suggestion);
        return;

      default:
        console.warn('Unhandled suggestion type:', suggestionType);
    }
  };

  return (
    <>
      <Form
        className="w-100 recreation-resource-suggestion-form"
        onSubmit={handleSubmit}
      >
        <SuggestionTypeahead<RecreationSuggestion | CitySuggestion>
          onChange={handleSuggestionChange}
          onClear={handleClearTypeaheadSearch}
          onKeyDown={handleInputKeyDown}
          isLoading={isFetching}
          error={error}
          defaultValue={defaultSearchInputValue}
          suggestions={suggestions as RecreationSuggestion[]}
          onSearch={setSearchInputValue}
          renderMenu={renderMenu}
          placeholder={SEARCH_PLACEHOLDER}
        />
        <Button variant={searchBtnVariant} type="submit" className="submit-btn">
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

export default RecreationSuggestionForm;
