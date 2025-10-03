import { useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import {
  RenderMenuProps,
  TypeaheadComponentProps,
} from 'react-bootstrap-typeahead';
import { useRecreationSuggestions } from '@/service/queries/recreation-resource';
import { SuggestionMenu } from '@/components/recreation-suggestion-form/SuggestionMenu';
import { SuggestionTypeahead } from '@shared/components/suggestion-typeahead/SuggestionTypeahead';
import { useSearchCitiesApi } from '@/components/recreation-suggestion-form/hooks/useSearchCitiesApi';
import { useCurrentLocation } from '@/components/recreation-suggestion-form/hooks/useCurrentLocation';
import { useSearchInput } from '@/components/recreation-suggestion-form/hooks/useSearchInput';
import NotificationToast from '@/components/notifications/NotificationToast';
import {
  City as CitySuggestion,
  RecreationSuggestion,
} from '@/components/recreation-suggestion-form/types';
import '@/components/recreation-suggestion-form/RecreationSuggestionForm.scss';
import { trackClickEvent } from '@/utils/matomo';
import {
  fuzzySearchCities,
  fuzzySearchBestCity,
} from '@/components/recreation-suggestion-form/utils/fuzzySearch';
import { ROUTE_PATHS } from '@/routes/constants';
import {
  CURRENT_LOCATION_TITLE,
  OPTION_TYPE,
  SEARCH_PLACEHOLDER,
} from '@/components/recreation-suggestion-form/constants';
import { Option } from 'react-bootstrap-typeahead/types/types';

interface RecreationSuggestionFormProps {
  /**
   * Whether to allow searching with an empty input.
   * If true, the search will be performed even if the input is empty.
   */
  allowEmptySearch?: boolean;
  /**
   * Whether to disable navigation when a suggestion is selected.
   * If true, the search will be performed instead of navigating to the resource page.
   */
  disableNavigation?: boolean;
  /**
   * Variant of the search button.
   * Can be 'primary' or 'secondary'.
   */
  searchBtnVariant?: 'primary' | 'secondary';
  /**
   * The source of the search, used for tracking purposes.
   * This should be a descriptive string indicating where the search was initiated.
   */
  trackingSource: string;
}

const RecreationSuggestionForm = ({
  allowEmptySearch,
  disableNavigation = false,
  searchBtnVariant = 'primary',
  trackingSource,
}: RecreationSuggestionFormProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filter = searchParams.get('filter');
  const community = searchParams.get('community');
  const isSearchParams = filter || community;
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

  const trackingName = `${trackingSource} search`;

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
    const searchText = searchInputValue?.trim() ?? '';

    if (!searchText) return [currentLocationOption];

    const filteredCities = fuzzySearchCities(citiesList ?? [], searchText);

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
        {...menuProps}
        results={results as RecreationSuggestion[]}
        searchTerm={searchInputValue}
        cityOptions={cityOptions}
      />
    ),
    [searchInputValue, cityOptions],
  );

  const performSearch = useCallback(
    (inputValue: string) => {
      const trimmedInputValue = inputValue.trim();
      if (!trimmedInputValue && !allowEmptySearch) return;

      const bestCityMatch = fuzzySearchBestCity(
        citiesList ?? [],
        trimmedInputValue,
      );

      if (bestCityMatch) {
        handleCityOptionSearch(bestCityMatch);
        trackClickEvent({
          category: trackingName,
          name: `City match selected: ${bestCityMatch.name}`,
        })();
      } else {
        handleSearch(trimmedInputValue);
        trackClickEvent({
          category: trackingName,
          name: 'Search button clicked',
        })();
      }
    },
    [
      allowEmptySearch,
      citiesList,
      handleCityOptionSearch,
      handleSearch,
      trackingName,
    ],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const input = e.currentTarget.querySelector('input') as HTMLInputElement;
      performSearch(input?.value ?? '');
    },
    [performSearch],
  );

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        performSearch((e.target as HTMLInputElement).value);
      }
    },
    [performSearch],
  );

  const selectedValue = useMemo(() => {
    if (!isSearchParams || !searchInputValue) return undefined;
    // If search params are present, we will persist the search input value between instances of this component
    // ie the Search list view and the Search map view
    return [
      {
        name: searchInputValue,
      } as CitySuggestion,
    ];
  }, [isSearchParams, searchInputValue]);

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

          setSearchInputValue(CURRENT_LOCATION_TITLE);
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
          name: `Suggestion selected: ${suggestion.name}`,
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
        setSearchInputValue(suggestion.name);
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
          selected={selectedValue}
          defaultValue={defaultSearchInputValue}
          suggestions={suggestions as RecreationSuggestion[]}
          onSearch={(text) => setSearchInputValue(text)}
          onInputChange={(text) => setSearchInputValue(text)}
          renderMenu={renderMenu}
          minLength={0}
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
