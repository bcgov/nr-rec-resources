import { FC, ReactNode, useRef } from "react";
import {
  AsyncTypeahead,
  TypeaheadComponentProps,
} from "react-bootstrap-typeahead";
import { SuggestionSearchInput } from "@shared/components/suggestion-typeahead/SuggestionSearchInput";
import { RecreationResourceSuggestion } from "@shared/components/suggestion-typeahead/types";
import "react-bootstrap-typeahead/css/Typeahead.css";
import "./SuggestionTypeahead.scss";
import { TypeaheadInputProps } from "react-bootstrap-typeahead/types/types";

/**
 * Props for {@link SuggestionTypeahead}.
 */
interface SuggestionTypeaheadProps {
  /**
   * Whether the typeahead is loading suggestions.
   */
  isLoading: boolean;
  /**
   * Array of resource suggestions to display.
   */
  suggestions: RecreationResourceSuggestion[];
  /**
   * Callback fired when a search is performed.
   * @param searchTerm The search term entered by the user.
   */
  onSearch: (searchTerm: string) => void;
  /**
   * Error object, if any, to display validation feedback.
   */
  error?: Error | null;
  /**
   * Callback fired when a suggestion is selected.
   * @param selected The selected suggestion.
   */
  onChange: (selected: RecreationResourceSuggestion) => void;
  /**
   * The label to display when there are no results or an error.
   */
  emptyLabel?: ReactNode;
  /**
   * Placeholder text for the input.
   */
  placeholder?: string;
  /**
   * Custom render function for the menu.
   * Allows for custom rendering of the suggestion menu.
   */
  renderMenu?: TypeaheadComponentProps["renderMenu"];
  /**
   * Callback fired when the clear button is clicked.
   * Allows for custom handling of the clear action.
   */
  onClear?: () => void;
}

/**
 * A typeahead input component for searching and selecting recreation resources.
 * Integrates with react-bootstrap-typeahead and displays custom menu and input.
 *
 * @param props {@link SuggestionTypeaheadProps}
 */
export const SuggestionTypeahead: FC<SuggestionTypeaheadProps> = ({
  isLoading,
  suggestions,
  onClear,
  onSearch,
  error,
  onChange,
  emptyLabel,
  placeholder,
  renderMenu,
}) => {
  const typeaheadRef = useRef(null);
  return (
    <AsyncTypeahead
      ref={typeaheadRef}
      id="recreation-resource-suggestion"
      useCache={false}
      onSearch={onSearch}
      onChange={(selected) => {
        onChange(selected[0] as any);
      }}
      options={suggestions}
      isLoading={isLoading}
      renderInput={(inputProps: TypeaheadInputProps) => (
        <SuggestionSearchInput
          {...inputProps}
          isLoading={isLoading}
          onClear={() => {
            onClear?.();
            if (typeaheadRef.current) {
              (typeaheadRef.current as any).clear();
            }
          }}
        />
      )}
      minLength={1}
      emptyLabel={emptyLabel}
      placeholder={placeholder}
      labelKey="name" // Suggestion["name"]
      isInvalid={Boolean(error)}
      filterBy={Boolean} // show all the results
      renderMenu={renderMenu}
    />
  );
};
