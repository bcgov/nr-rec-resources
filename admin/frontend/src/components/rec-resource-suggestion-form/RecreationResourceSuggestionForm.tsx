import { useCallback, useState } from 'react';
import {
  RenderMenuProps,
  TypeaheadComponentProps,
} from 'react-bootstrap-typeahead';
import {
  isValidRecreationResourceSearchTerm,
  useGetRecreationResourceSuggestions,
} from '@/services/hooks/recreation-resource-admin/useGetRecreationResourceSuggestions';
import { SuggestionTypeahead } from '@shared/components/suggestion-typeahead/SuggestionTypeahead';
import { RecreationResourceSuggestion } from '@shared/components/suggestion-typeahead/types';
import { Stack } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import { useNavigate } from '@tanstack/react-router';
import { SuggestionMenu } from '@/components/rec-resource-suggestion-form/SuggestionMenu';
import { ROUTE_PATHS } from '@/constants/routes';
import { Option } from 'react-bootstrap-typeahead/types/types';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import './RecreationResourceSuggestionForm.scss';

/**
 * RecreationResourceSuggestionForm provides a search form for recreation resources.
 */
export const RecreationResourceSuggestionForm = () => {
  const [searchTerm, setSearchTerm] = useState('');

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

  const navigate = useNavigate();

  const {
    data: { suggestions },
    isFetching,
    error,
  } = useGetRecreationResourceSuggestions(searchTerm);

  const handleSuggestionChange = (suggestion: RecreationResourceSuggestion) => {
    navigate({
      to: ROUTE_PATHS.REC_RESOURCE_PAGE,
      params: { id: suggestion.rec_resource_id },
    });
  };

  const getEmptyLabel = () => {
    if (error?.response?.status === 400) {
      return (
        <Form.Control.Feedback type="invalid" className="d-block">
          Invalid search term. Only letters, numbers, spaces, and these
          characters are allowed: &quot; &#39; ( ) # . &amp; /
          <br />
          Minimum 3 characters.
        </Form.Control.Feedback>
      );
    }
    if (!isValidRecreationResourceSearchTerm(searchTerm)) {
      return 'Please enter at least 3 characters to search';
    }
    return 'No results found';
  };

  return (
    <Form className="w-100 p-4 recreation-resource-suggestion-form">
      <Form.Group controlId="recreation-resource-suggestion">
        <Stack direction="vertical" gap={2}>
          <Form.Label className="fw-bold form-label w-100">
            <span className="d-none d-sm-inline">
              Search by resource name or number
            </span>
            <span className="d-flex align-items-center justify-content-center d-sm-none fs-5">
              Search by name or number
            </span>
          </Form.Label>
          <SuggestionTypeahead<RecreationResourceSuggestion>
            onChange={handleSuggestionChange}
            isLoading={isFetching}
            error={error}
            suggestions={suggestions}
            onSearch={setSearchTerm}
            emptyLabel={getEmptyLabel()}
            placeholder="By name or number"
            renderMenu={renderMenu}
            isMobileSearchBtn={false}
          />
        </Stack>
      </Form.Group>
    </Form>
  );
};
