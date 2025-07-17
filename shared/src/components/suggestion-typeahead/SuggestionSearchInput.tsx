import { FC } from "react";
import { TypeaheadInputProps } from "react-bootstrap-typeahead/types/types";
import { Form, InputGroup, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

interface SuggestionSearchInputProps extends TypeaheadInputProps {
  isLoading?: boolean;
}

export const SuggestionSearchInput: FC<SuggestionSearchInputProps> = ({
  inputRef,
  referenceElementRef,
  isLoading,
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

      {isLoading && (
        <InputGroup.Text className="search-spinner-wrapper">
          <Spinner role="status" animation="border" size="sm" />
        </InputGroup.Text>
      )}
    </InputGroup>
  );
};
