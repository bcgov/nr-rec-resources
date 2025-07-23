import { FC } from "react";
import { ClearButton } from "react-bootstrap-typeahead";
import { TypeaheadInputProps } from "react-bootstrap-typeahead/types/types";
import { Form, InputGroup, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

interface SuggestionSearchInputProps extends TypeaheadInputProps {
  isLoading?: boolean;
  onClear?: () => void;
}

export const SuggestionSearchInput: FC<SuggestionSearchInputProps> = ({
  inputRef,
  referenceElementRef,
  isLoading,
  onClear,
  ...inputProps
}) => {
  return (
    <InputGroup
      className="suggestion-search-input-container"
      ref={(node: HTMLInputElement) => {
        inputRef(node);
        referenceElementRef(node);
      }}
    >
      <InputGroup.Text className="search-icon-wrapper">
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
      {!!inputProps.value && (
        <ClearButton
          label="Clear search"
          className="clear-button"
          onClick={onClear}
        />
      )}

      {/* Show spinner when loading */}
      {isLoading && (
        <InputGroup.Text className="search-spinner-wrapper">
          <Spinner role="status" animation="border" size="sm" />
        </InputGroup.Text>
      )}
    </InputGroup>
  );
};
