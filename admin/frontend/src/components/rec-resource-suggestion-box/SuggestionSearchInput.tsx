import { FC } from "react";
import { TypeaheadInputProps } from "~/react-bootstrap-typeahead/types/types";
import { Form, InputGroup } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import "./SuggestionSearchInput.scss";

export const SuggestionSearchInput: FC<TypeaheadInputProps> = ({
  inputRef,
  referenceElementRef,
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
    </InputGroup>
  );
};
