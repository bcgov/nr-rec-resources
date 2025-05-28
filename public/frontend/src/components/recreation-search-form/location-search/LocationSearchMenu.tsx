import { memo } from 'react';
import { Menu, MenuItem } from 'react-bootstrap-typeahead';
import { CURRENT_LOCATION_TITLE } from '@/components/recreation-search-form/location-search/LocationSearch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationArrow } from '@fortawesome/free-solid-svg-icons';
import { City } from '@/components/recreation-search-form/types';
import '@/components/recreation-search-form/location-search/LocationSearch.scss';

interface LocationSearchMenuProps {
  results: City[];
  isError: boolean;
  refetch: () => void;
  latitude: number | null;
  longitude: number | null;
  onGetLocation: () => void;
}

const LocationSearchMenu = ({
  results,
  isError,
  refetch,
  onGetLocation,
}: LocationSearchMenuProps) => {
  if (isError) {
    return (
      <Menu>
        <div className="error-state">
          Failed to load cities.
          <button className="btn btn-link" onClick={refetch}>
            Retry
          </button>
        </div>
      </Menu>
    );
  }

  return (
    <Menu>
      {results.map((city, index) => {
        const isCurrentLocation = city.cityName === CURRENT_LOCATION_TITLE;
        return (
          <MenuItem
            key={index}
            option={city}
            position={index}
            className="location-search-item"
            onClick={isCurrentLocation ? onGetLocation : undefined}
          >
            {isCurrentLocation && (
              <FontAwesomeIcon
                icon={faLocationArrow}
                className="current-location-icon"
              />
            )}
            {city.cityName}
          </MenuItem>
        );
      })}
    </Menu>
  );
};

export default memo(LocationSearchMenu);
