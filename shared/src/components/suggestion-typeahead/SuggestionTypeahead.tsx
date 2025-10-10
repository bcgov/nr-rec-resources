import { ReactNode, useMemo, useRef } from 'react';
import {
  AsyncTypeahead,
  TypeaheadComponentProps,
} from 'react-bootstrap-typeahead';
import { SuggestionSearchInput } from '@shared/components/suggestion-typeahead/SuggestionSearchInput';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import './SuggestionTypeahead.scss';
import { TypeaheadInputProps } from 'react-bootstrap-typeahead/types/types';

/**
 * Props for {@link SuggestionTypeahead}.
 */

export interface SuggestionTypeaheadProps<T> {
  /**
   * Whether the typeahead is loading suggestions.
   */
  isLoading: boolean;
  /**
   * Array of resource suggestions to display.
   */
  suggestions: T[];
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
  onChange: (selected: T) => void;
  /**
   * Callback fired when the input value changes.
   * @param event The change event from the input.
   */
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
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
  renderMenu?: TypeaheadComponentProps['renderMenu'];
  /**
   * Callback fired when the clear button is clicked.
   * Allows for custom handling of the clear action.
   */
  onClear?: () => void;
  /**
   * Default value for the input when it is first rendered.
   */
  defaultValue?: string;
  /**
   * The key used to extract the label from a suggestion, or a function to generate one.
   */

  labelKey?: string;
  /**
   * Minimum length of input before suggestions are fetched.
   * Defaults to 1.
   */
  minLength?: number;
  /**
   * Callback fired when the input value changes.
   * Allows for custom handling of input changes.
   */
  onInputChange?: (input: string) => void;
  /**
   * The currently selected suggestion(s).
   */
  selected?: T[];
}

/**
 * A typeahead input component for searching and selecting generic suggestions.
 * Integrates with react-bootstrap-typeahead and displays custom menu and input.
 *
 * @param props {@link SuggestionTypeaheadProps}
 */
export const SuggestionTypeahead = <T extends object>({
  defaultValue,
  isLoading,
  suggestions,
  onChange,
  onClear,
  onKeyDown,
  onSearch,
  error,
  emptyLabel,
  placeholder,
  renderMenu,
  labelKey = 'name',
  minLength = 1,
  onInputChange,
  selected,
}: SuggestionTypeaheadProps<T>) => {
  const typeaheadRef = useRef(null);

  const renderInput = useMemo(
    () => (inputProps: TypeaheadInputProps) => (
      <SuggestionSearchInput
        {...inputProps}
        isLoading={isLoading}
        onBlur={() => {
          if (typeaheadRef.current) {
            (typeaheadRef.current as any).blur();
          }
        }}
        onKeyDown={(event) => {
          inputProps.onKeyDown?.(event); // Call internal onKeyDown handler
          onKeyDown?.(event); // Call the parent onKeyDown handler
          if (event.key === 'Enter' && typeaheadRef.current) {
            (typeaheadRef.current as any).blur();
          }
        }}
        onClear={() => {
          onClear?.();
          if (typeaheadRef.current) {
            (typeaheadRef.current as any).clear();
          }
        }}
      />
    ),
    [isLoading, onClear, onKeyDown],
  );

  return (
    <AsyncTypeahead
      ref={typeaheadRef}
      defaultInputValue={defaultValue}
      id="suggestion-typeahead"
      useCache={false}
      onSearch={onSearch}
      onChange={(selected) => {
        if (selected.length > 0) {
          onChange(selected[0] as T);
        }
      }}
      selected={selected}
      onInputChange={onInputChange}
      options={suggestions}
      isLoading={isLoading}
      renderInput={renderInput}
      minLength={minLength}
      emptyLabel={emptyLabel}
      placeholder={placeholder}
      labelKey={labelKey}
      isInvalid={Boolean(error)}
      filterBy={() => true} // show all the results
      renderMenu={renderMenu}
    />
  );
};
