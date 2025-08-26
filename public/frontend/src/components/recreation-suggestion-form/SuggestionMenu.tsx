import { Menu, MenuItem } from 'react-bootstrap-typeahead';
import { SuggestionListCity } from '@/components/recreation-suggestion-form/SuggestionListCity';
import { SuggestionListItem } from '@/components/recreation-suggestion-form/SuggestionListItem';
import { Image } from 'react-bootstrap';
import {
  City,
  RecreationSuggestion,
} from '@/components/recreation-suggestion-form/types';
import { RESOURCE_TYPE_ICONS } from '@shared/components/suggestion-typeahead/constants';
import '@/components/recreation-suggestion-form/SuggestionMenu.scss';

/**
 * Props for the SuggestionMenu component.
 */
interface SuggestionMenuProps {
  /** Array of recreation resource suggestions to display. */
  results: RecreationSuggestion[];
  /** The current search term to highlight in suggestions. */
  searchTerm: string;
  /** Array of city options for location-based suggestions. */
  cityOptions: City[];
}

/**
 * Renders a custom menu for the typeahead dropdown, displaying a list of
 * recreation resource suggestions.
 */
export const SuggestionMenu = ({
  cityOptions,
  results,
  searchTerm,
}: SuggestionMenuProps) => {
  const showResultsLabel = results.length > 0;

  return (
    <Menu className="suggestion-menu">
      <div className="suggestion-menu-scroll">
        <div className="suggestion-menu-label">Location</div>
        {cityOptions.map((option, index) => (
          <MenuItem
            key={`city-${option.name}`}
            option={option}
            position={index}
            className="dropdown-menu-item"
          >
            <SuggestionListCity searchTerm={searchTerm} city={option.name} />
          </MenuItem>
        ))}

        {showResultsLabel && (
          <div className="suggestion-menu-label">Sites and trails</div>
        )}
        {results.map((option: RecreationSuggestion, index: number) => {
          const {
            rec_resource_id,
            recreation_resource_type_code,
            recreation_resource_type,
            closest_community,
            name,
          } = option;
          return (
            <MenuItem
              key={rec_resource_id}
              option={option}
              position={index + cityOptions.length}
              className="dropdown-menu-item"
            >
              <SuggestionListItem
                searchTerm={searchTerm}
                community={closest_community}
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
      </div>
    </Menu>
  );
};
