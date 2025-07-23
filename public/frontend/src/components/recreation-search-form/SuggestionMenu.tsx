import { Menu, MenuItem, RenderMenuProps } from 'react-bootstrap-typeahead';
import { SuggestionListCity } from '@/components/recreation-search-form/SuggestionListCity';
import { SuggestionListItem } from '@/components/recreation-search-form/SuggestionListItem';
import { RecreationResourceSuggestion } from '@shared/components/suggestion-typeahead/types';
import { Image } from 'react-bootstrap';
import { City } from '@/components/recreation-search-form/types';
import { RESOURCE_TYPE_ICONS } from '@shared/components/suggestion-typeahead/constants';
import '@/components/recreation-search-form/SuggestionMenu.scss';

/**
 * Props for the SuggestionMenu component.
 */
interface SuggestionMenuProps {
  /** Array of recreation resource suggestions to display. */
  results: RecreationResourceSuggestion[];
  /** The current search term to highlight in suggestions. */
  searchTerm: string;
  /**
   * Props that will be passed to the Menu component within the Typeahead.
   * These are important for rendering the menu correctly and handling interactions.
   */
  menuProps: RenderMenuProps;
  /** Array of city options for location-based suggestions. */
  cityOptions: City[];
}

/**
 * Renders a custom menu for the typeahead dropdown, displaying a list of
 * recreation resource suggestions.
 */
export const SuggestionMenu = ({
  cityOptions,
  menuProps,
  results,
  searchTerm,
}: SuggestionMenuProps) => {
  const isResults = results && results.length > 0;
  const isCityOptions = cityOptions && cityOptions.length > 0;

  return (
    <Menu {...menuProps}>
      {isResults && (
        <div className="suggestion-menu-label">Sites and trails</div>
      )}
      {results.map((option: RecreationResourceSuggestion, index: number) => {
        const {
          rec_resource_id,
          recreation_resource_type_code,
          recreation_resource_type,
          district_description,
          name,
        } = option;
        return (
          <MenuItem
            key={rec_resource_id}
            option={option}
            position={index}
            className="dropdown-menu-item"
          >
            <SuggestionListItem
              searchTerm={searchTerm}
              district={district_description}
              icon={
                <Image
                  src={RESOURCE_TYPE_ICONS[recreation_resource_type_code]}
                />
              }
              resourceType={recreation_resource_type}
              title={name}
            />
          </MenuItem>
        );
      })}
      {isCityOptions && <div className="suggestion-menu-label">Location</div>}
      {cityOptions.map((option: City, index: number) => {
        return (
          <MenuItem
            key={option.name}
            option={option}
            position={index + results.length} // Offset by the number of results
            className="dropdown-menu-item"
          >
            <SuggestionListCity searchTerm={searchTerm} city={option.name} />
          </MenuItem>
        );
      })}
    </Menu>
  );
};
