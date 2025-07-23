import { useCallback, useState } from 'react';
import Form from 'react-bootstrap/Form';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { useRecreationSuggestions } from '@/service/queries/recreation-resource';
import { SuggestionMenu } from '@/components/recreation-search-form/SuggestionMenu';
import { SuggestionTypeahead } from '@shared/components/suggestion-typeahead/SuggestionTypeahead';
import { RecreationResourceSuggestion } from '@shared/components/suggestion-typeahead/types';
import { useNavigate } from 'react-router';
import './RecreationResourceSuggestionForm.scss';
import { ROUTE_PATHS } from '@/routes/constants';
import {
  RenderMenuProps,
  TypeaheadComponentProps,
} from 'react-bootstrap-typeahead';
import { Option } from 'react-bootstrap-typeahead/types/types';

/**
 * RecreationResourceSuggestionForm provides a search form for recreation resources.
 */
export const RecreationResourceSuggestionForm = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();

  /**
   * Custom menu renderer for resource suggestions.
   */
  const renderMenu: TypeaheadComponentProps['renderMenu'] = useCallback(
    (results: Option[], menuProps: RenderMenuProps) => (
      <SuggestionMenu
        results={results as RecreationResourceSuggestion[]}
        searchTerm={searchTerm}
        menuProps={menuProps}
      />
    ),
    [searchTerm],
  );

  const {
    data: suggestions,
    error,
    isFetching,
  } = useRecreationSuggestions({
    query: searchTerm,
  });

  console.log('RecreationResourceSuggestionForm suggestions:', suggestions);

  const handleSuggestionChange = (suggestion: RecreationResourceSuggestion) => {
    navigate(
      ROUTE_PATHS.REC_RESOURCE.replace(':id', suggestion.rec_resource_id),
    );
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
  );
};
