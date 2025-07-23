import { useCallback, useMemo, useState } from 'react';
import Form from 'react-bootstrap/Form';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { useRecreationSuggestions } from '@/service/queries/recreation-resource';
import { SuggestionMenu } from '@/components/recreation-search-form/SuggestionMenu';
import { SuggestionTypeahead } from '@shared/components/suggestion-typeahead/SuggestionTypeahead';
import { useSearchCitiesApi } from '@/components/recreation-search-form/hooks/useSearchCitiesApi';
import { useCurrentLocation } from '@/components/recreation-search-form/hooks/useCurrentLocation';
import NotificationToast from '@/components/notifications/NotificationToast';
import { RecreationResourceSuggestion } from '@shared/components/suggestion-typeahead/types';
import { City as CitySuggestion } from '@/components/recreation-search-form/types';
import { useNavigate } from 'react-router';
import './RecreationResourceSuggestionForm.scss';
import { ROUTE_PATHS } from '@/routes/constants';
import {
  RenderMenuProps,
  TypeaheadComponentProps,
} from 'react-bootstrap-typeahead';
import { Option } from 'react-bootstrap-typeahead/types/types';

const MAX_LOCATION_OPTIONS = 4;
const CURRENT_LOCATION_TITLE = 'Current location';

/**
 * RecreationResourceSuggestionForm provides a search form for recreation resources.
 */
export const RecreationResourceSuggestionForm = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { data: citiesList } = useSearchCitiesApi();
  const { getLocation, latitude, longitude, permissionDeniedCount } =
    useCurrentLocation();
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
    const searchText = searchTerm?.toLowerCase() ?? '';

    const cities = (citiesList ?? [currentLocationOption])
      .filter(
        (city) =>
          city.name.toLowerCase().startsWith(searchText) ||
          city.name.toLowerCase().includes(` ${searchText}`),
      )
      .slice(0, MAX_LOCATION_OPTIONS);

    cities.push(currentLocationOption);

    return cities;
  }, [searchTerm, currentLocationOption, citiesList]);

  /**
   * Custom menu renderer for resource suggestions.
   */
  const renderMenu: TypeaheadComponentProps['renderMenu'] = useCallback(
    (results: Option[], menuProps: RenderMenuProps) => (
      <SuggestionMenu
        results={results as RecreationResourceSuggestion[]}
        searchTerm={searchTerm}
        menuProps={menuProps}
        cityOptions={cityOptions}
      />
    ),
    [searchTerm, cityOptions],
  );

  const {
    data: suggestions,
    error,
    isFetching,
  } = useRecreationSuggestions({
    query: searchTerm,
  });

  const handleSuggestionChange = (
    suggestion: RecreationResourceSuggestion | CitySuggestion,
  ) => {
    const suggestionType = suggestion.option_type;

    switch (suggestionType) {
      case 'current_location':
        getLocation();
        return;

      case 'recreation_resource':
        navigate(
          ROUTE_PATHS.REC_RESOURCE.replace(':id', suggestion.rec_resource_id),
        );
        return;

      case 'city':
        // Optional: handle 'city' suggestions
        console.log('City selected:', suggestion.name);
        return;

      default:
        console.warn('Unhandled suggestion type:', suggestionType);
    }
  };

  const getEmptyLabel = () => {
    // if (error?.response.status === 400) {
    //   return (
    //     <Form.Control.Feedback type="invalid" className="d-block">
    //       Invalid search term. Only letters, numbers, spaces, and these
    //       characters are allowed: &quot; &#39; ( ) # . &amp; /
    //       <br />
    //       Minimum 3 characters.
    //     </Form.Control.Feedback>
    //   );
    // }
    // if (!isValidRecreationResourceSearchTerm(searchTerm)) {
    //   return 'Please enter at least 3 characters to search';
    // }
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
            onSearch={setSearchTerm}
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
