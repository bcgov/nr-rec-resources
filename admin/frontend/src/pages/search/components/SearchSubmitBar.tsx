import { useCallback, useEffect, useRef } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import {
  RenderMenuProps,
  TypeaheadComponentProps,
} from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { useNavigate } from '@tanstack/react-router';
import { SuggestionTypeahead } from '@shared/components/suggestion-typeahead/SuggestionTypeahead';
import { RecreationResourceSuggestion } from '@shared/components/suggestion-typeahead/types';
import { SuggestionMenu } from '@/components/rec-resource-suggestion-form/SuggestionMenu';
import { ROUTE_PATHS } from '@/constants/routes';
import { useAdminSearchTypeahead } from '@/pages/search/hooks/useAdminSearchTypeahead';
import { writeAdminSearchDraftQuery } from '@/pages/search/utils/storage';
import './SearchSubmitBar.scss';

type SearchSubmitBarTypeaheadProps = Pick<
  ReturnType<typeof useAdminSearchTypeahead>,
  'inputValue' | 'setInputValue' | 'suggestions' | 'isLoading' | 'error'
>;

interface SearchSubmitBarProps {
  committedQuery: string;
  typeahead: SearchSubmitBarTypeaheadProps;
  onSubmit: (value: string) => void;
}

export function SearchSubmitBar({
  committedQuery,
  typeahead: { inputValue, setInputValue, suggestions, isLoading, error },
  onSubmit,
}: SearchSubmitBarProps) {
  const navigate = useNavigate();
  const latestInputValueRef = useRef(inputValue);

  useEffect(() => {
    latestInputValueRef.current = inputValue;
  }, [inputValue]);

  const updateInputValue = (value: string) => {
    latestInputValueRef.current = value;
    setInputValue(value);
  };

  const submitValue = (value: string) => {
    writeAdminSearchDraftQuery(value);
    onSubmit(value);
  };

  const renderMenu: TypeaheadComponentProps['renderMenu'] = useCallback(
    (results: unknown[], menuProps: RenderMenuProps) => (
      <SuggestionMenu
        results={results as RecreationResourceSuggestion[]}
        searchTerm={inputValue}
        menuProps={menuProps}
      />
    ),
    [inputValue],
  );

  return (
    <Form
      onKeyDownCapture={(event) => {
        if (
          event.key !== 'Enter' ||
          !(event.target instanceof HTMLInputElement)
        ) {
          return;
        }

        const hasActiveSuggestion = Boolean(
          event.target.getAttribute('aria-activedescendant'),
        );

        if (hasActiveSuggestion) {
          return;
        }

        event.preventDefault();
        latestInputValueRef.current = event.target.value;
        submitValue(event.target.value);
      }}
      onSubmit={(event) => {
        event.preventDefault();
        submitValue(latestInputValueRef.current);
      }}
      className="submit-bar"
    >
      <Row className="g-2 align-items-start">
        <Col lg={9}>
          <SuggestionTypeahead<RecreationResourceSuggestion>
            key={committedQuery}
            suggestions={suggestions}
            isLoading={isLoading}
            error={error}
            onSearch={updateInputValue}
            onInputChange={updateInputValue}
            onClear={() => {
              updateInputValue('');
            }}
            onChange={(suggestion) =>
              navigate({
                to: ROUTE_PATHS.REC_RESOURCE_PAGE,
                params: { id: suggestion.rec_resource_id },
              })
            }
            emptyLabel="Search by resource name or number"
            placeholder="By name or number"
            renderMenu={renderMenu}
            isMobileSearchBtn={false}
            defaultValue={inputValue || committedQuery}
          />
        </Col>
        <Col lg={3}>
          <Button type="submit" className="w-100">
            Search
          </Button>
        </Col>
      </Row>
    </Form>
  );
}
