import { FC, ReactNode, useCallback } from "react";
import {
  AsyncTypeahead,
  RenderMenuProps,
  TypeaheadComponentProps,
} from "react-bootstrap-typeahead";
import { SuggestionSearchInput } from "@/components/recreation-resource-suggestion-typeahead/SuggestionSearchInput";
import { SuggestionMenu } from "@/components/recreation-resource-suggestion-typeahead/SuggestionMenu";
import { RecreationResourceSuggestion } from "@/components/recreation-resource-suggestion-typeahead/types";
import "react-bootstrap-typeahead/css/Typeahead.css";
import "./RecreationResourceSuggestionTypeahead.scss";
import {
  FilterByCallback,
  Option,
  TypeaheadInputProps,
  TypeaheadPropsAndState,
} from "react-bootstrap-typeahead/types/types";

/**
 * Props for {@link RecreationResourceSuggestionTypeahead}.
 */
interface RecreationResourceSuggestionTypeaheadProps {
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
 * @param props {@link RecreationResourceSuggestionTypeaheadProps}
 */
export const RecreationResourceSuggestionTypeahead: FC<
  RecreationResourceSuggestionTypeaheadProps
> = ({
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
   * Custom filter function for resource suggestions.
   *
   * Determines whether a suggestion should be shown in the dropdown
   * based on the user's search term. It matches the search term against both the
   * resource's name and its resource ID (case-insensitive).
   *
   * This allows users to search by either name or resource ID.
   */
  const filterBy: FilterByCallback = useCallback(
    (option: Option, props: TypeaheadPropsAndState) => {
      const customOption = option as RecreationResourceSuggestion;
      const searchTerm = props.text.toLowerCase();

      // Match by name or resource ID (case-insensitive)
      return (
        (Boolean(customOption.name) &&
          customOption.name.toLowerCase().includes(searchTerm)) ||
        (Boolean(customOption.rec_resource_id) &&
          customOption.rec_resource_id.toLowerCase().includes(searchTerm))
      );
    },
    [],
  );

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
      labelKey="name" // RecreationResourceSuggestion["name"]
      isInvalid={Boolean(error)}
      filterBy={filterBy}
      renderMenu={renderMenu}
    />
  );
};
