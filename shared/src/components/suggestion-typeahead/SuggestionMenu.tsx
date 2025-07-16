import { Menu, MenuItem, RenderMenuProps } from "react-bootstrap-typeahead";
import { SuggestionListItem } from "@shared/components/suggestion-typeahead/SuggestionListItem";
import { RecreationResourceSuggestion } from "@shared/components/suggestion-typeahead/types";
import { Image } from "react-bootstrap";
import { RESOURCE_TYPE_ICONS } from "@shared/components/suggestion-typeahead/constants";

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
}

/**
 * Renders a custom menu for the typeahead dropdown, displaying a list of
 * recreation resource suggestions.
 */
export const SuggestionMenu = ({
  results,
  searchTerm,
  menuProps,
}: SuggestionMenuProps) => (
  <Menu {...menuProps}>
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
              <Image src={RESOURCE_TYPE_ICONS[recreation_resource_type_code]} />
            }
            rec_resource_id={rec_resource_id}
            resourceType={recreation_resource_type}
            title={name}
          />
        </MenuItem>
      );
    })}
  </Menu>
);
