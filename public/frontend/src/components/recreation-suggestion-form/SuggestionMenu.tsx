import { useEffect, useRef } from 'react';
import { Menu, MenuItem, RenderMenuProps } from 'react-bootstrap-typeahead';
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
  const resultsLength = results?.length ?? 0;

  const lastYRef = useRef(0);
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;
    const clientHeight = target.clientHeight;
    const isAtTop = scrollTop <= 0;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight;

    const touch = e.touches[0];
    const deltaY = lastYRef.current - touch.clientY;
    lastYRef.current = touch.clientY;

    if ((isAtTop && deltaY < 0) || (isAtBottom && deltaY > 0)) {
      e.preventDefault();
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    lastYRef.current = e.touches[0].clientY;
  };

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;

    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
      document.documentElement.style.overflow = '';
    };
  }, []);

  return (
    <Menu
      {...menuProps}
      className="suggestion-menu"
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
    >
      {isCityOptions && (
        <div className="suggestion-menu-label" onTouchMove={handleTouchMove}>
          Location
        </div>
      )}
      {cityOptions.map((option, index) => (
        <MenuItem
          key={option.name}
          option={option}
          position={index + resultsLength}
          className="dropdown-menu-item"
        >
          <SuggestionListCity searchTerm={searchTerm} city={option.name} />
        </MenuItem>
      ))}

      {isResults && (
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
            position={index}
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
    </Menu>
  );
};
