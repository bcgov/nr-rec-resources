import { FC, ReactNode, useCallback } from "react";
import {
  AsyncTypeahead,
  RenderMenuProps,
  TypeaheadComponentProps,
} from "react-bootstrap-typeahead";
import { SuggestionSearchInput } from "@shared/components/suggestion-typeahead/SuggestionSearchInput";
import { SuggestionMenu } from "@shared/components/suggestion-typeahead/SuggestionMenu";
import { RecreationResourceSuggestion } from "@shared/components/suggestion-typeahead/types";
import "react-bootstrap-typeahead/css/Typeahead.css";
import "./SuggestionTypeahead.scss";
import {
  Option,
  TypeaheadInputProps,
} from "react-bootstrap-typeahead/types/types";

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
   * The current search term.
   */
  searchTerm: string;
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
  onSearch,
  error,
  searchTerm,
  onChange,
  emptyLabel,
  placeholder,
}) => {
  /**
   * Custom menu renderer for resource suggestions.
   */
  const renderMenu: TypeaheadComponentProps["renderMenu"] = useCallback(
    (results: Option[], menuProps: RenderMenuProps) => (
      <SuggestionMenu
        results={results as RecreationResourceSuggestion[]}
        searchTerm={searchTerm}
        menuProps={menuProps}
      />
    ),
    [searchTerm],
  );

  return (
    <AsyncTypeahead
      id="recreation-resource-suggestion"
      useCache={false}
      onSearch={onSearch}
      onChange={(selected) => {
        onChange(selected[0] as RecreationResourceSuggestion);
      }}
      options={suggestions}
      isLoading={isLoading}
      renderInput={(inputProps: TypeaheadInputProps) => (
        <SuggestionSearchInput {...inputProps} isLoading={isLoading} />
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
