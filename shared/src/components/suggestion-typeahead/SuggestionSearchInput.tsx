import { FC } from 'react';
import { ClearButton } from 'react-bootstrap-typeahead';
import { TypeaheadInputProps } from 'react-bootstrap-typeahead/types/types';
import { Form, InputGroup, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import './SuggestionTypeahead.scss';

interface SuggestionSearchInputProps extends TypeaheadInputProps {
  isLoading?: boolean;
  onClear?: () => void;
  isMobileSearchBtn?: boolean;
}

export const SuggestionSearchInput: FC<SuggestionSearchInputProps> = ({
  inputRef,
  referenceElementRef,
  isLoading,
  onClear,
  isMobileSearchBtn = true,
  ...inputProps
}) => {
  const isClearButtonVisible = !!inputProps.value && !isLoading;

  return (
    <InputGroup
      className={`suggestion-search-input-container ${isMobileSearchBtn ? 'has-mobile-search-btn' : ''}`}
      ref={(node: HTMLInputElement) => {
        inputRef(node);
        referenceElementRef(node);
      }}
    >
      <InputGroup.Text className="search-icon-wrapper d-none d-sm-block">
        <FontAwesomeIcon icon={faSearch} />
      </InputGroup.Text>

      {/* @ts-ignore */}
      <Form.Control
        {...inputProps}
        ref={(node) => {
          inputRef(node);
          referenceElementRef(node);
        }}
      />
      {isClearButtonVisible && (
        <ClearButton
          label="Clear search"
          className="clear-button"
          onClick={onClear}
        />
      )}

      {/* Show spinner when loading */}
      {isLoading && (
        <InputGroup.Text className="suggestion-spinner m-0 p-0">
          <Spinner role="status" animation="border" size="sm" />
        </InputGroup.Text>
      )}

      {/* Mobile search submit button */}
      {isMobileSearchBtn && (
        <button
          className="mobile-search-button d-block d-sm-none"
          type="submit"
          aria-label="Search"
        >
          <FontAwesomeIcon icon={faSearch} />
        </button>
      )}
    </InputGroup>
  );
};
