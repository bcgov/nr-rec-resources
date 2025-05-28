import { useState, useMemo, useRef, useEffect } from 'react';
import { Typeahead, ClearButton } from 'react-bootstrap-typeahead';
import { Form, FormControl } from 'react-bootstrap';
import LocationSearchMenu from '@/components/recreation-search-form/location-search/LocationSearchMenu';
import { Option } from 'react-bootstrap-typeahead/types/types';
import { City } from '@/components/recreation-search-form/types';
import { useSearchCitiesApi } from '@/components/recreation-search-form/hooks/useSearchCitiesApi';
import { useSearchInput } from '@/components/recreation-search-form/hooks/useSearchInput';
import { useCurrentLocation } from '@/components/recreation-search-form/hooks/useCurrentLocation';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import '@/components/recreation-search-form/location-search/LocationSearch.scss';

export const MAX_LOCATION_OPTIONS = 6;
export const CURRENT_LOCATION_TITLE = 'Current location';

const LocationSearch: React.FC = () => {
  const {
    cityInputValue,
    setCityInputValue,
    selectedCity,
    setSelectedCity,
    handleCityInputSearch,
    handleClearCityInput,
  } = useSearchInput();
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const { data, isError, refetch } = useSearchCitiesApi();
  const { latitude, longitude, getLocation } = useCurrentLocation();

  const currentLocationOption = useMemo<City>(
    () => ({
      id: 0,
      cityName: CURRENT_LOCATION_TITLE,
      latitude: latitude ?? 0,
      longitude: longitude ?? 0,
      rank: 0,
    }),
    [latitude, longitude],
  );

  const typeaheadRef = useRef<any>(null);

  const cityOptions = useMemo(() => {
    const searchText = cityInputValue?.toLowerCase() ?? '';

    const cities = (data ?? [currentLocationOption])
      .filter(
        (city) =>
          city.cityName.toLowerCase().startsWith(searchText) ||
          city.cityName.toLowerCase().includes(` ${searchText}`),
      )
      .slice(0, searchText ? MAX_LOCATION_OPTIONS : 0);

    cities.push(currentLocationOption);

    return cities;
  }, [cityInputValue, currentLocationOption, data]);

  const selectedCityMemo = useMemo(() => selectedCity ?? [], [selectedCity]);

  const handleGetLocation = () => {
    setIsGettingLocation(true);
    getLocation();
  };

  const handleOnChange = (selected: Option[]) => {
    const newSelectedCity = selected as City[];
    const newCityName = newSelectedCity[0]?.cityName ?? '';
    const currentCityName = selectedCity?.[0]?.cityName ?? '';

    if (newCityName === CURRENT_LOCATION_TITLE) {
      handleGetLocation();
      return;
    }

    if (isGettingLocation) {
      return;
    }

    if (newCityName && newCityName !== currentCityName) {
      setSelectedCity(newSelectedCity);
      handleCityInputSearch(newSelectedCity[0]);
      setCityInputValue(newCityName);
    }
  };

  const handleInputChange = (text: string) => {
    if (!isGettingLocation && text !== cityInputValue) {
      setCityInputValue(text);
    }
  };

  useEffect(() => {
    if (isGettingLocation && latitude !== null && longitude !== null) {
      setSelectedCity([currentLocationOption]);
      handleCityInputSearch(currentLocationOption);
      setCityInputValue(CURRENT_LOCATION_TITLE);
      setIsGettingLocation(false);
      typeaheadRef.current?.blur();
    }
  }, [
    latitude,
    longitude,
    isGettingLocation,
    currentLocationOption,
    handleCityInputSearch,
    setCityInputValue,
    setSelectedCity,
  ]);

  const handleClear = () => {
    setSelectedCity([]);
    handleClearCityInput();
  };

  const handleFocus = () => {
    if (!cityInputValue && selectedCity?.length) {
      setSelectedCity([]);
    }
  };

  return (
    <Typeahead
      ref={typeaheadRef}
      minLength={1}
      labelKey="cityName"
      filterBy={() => true}
      options={cityOptions}
      selected={selectedCityMemo}
      onChange={handleOnChange}
      onInputChange={handleInputChange}
      placeholder=" "
      emptyLabel={
        isError
          ? ''
          : 'No suggestions, please check your spelling or try a larger city in B.C.'
      }
      className={`location-search ${cityInputValue ? 'has-text' : ''}`}
      onFocus={handleFocus}
      renderInput={({ inputRef, referenceElementRef, ...inputProps }) => (
        <Form.Group controlId="city-search-typeahead">
          <FormControl
            {...inputProps}
            ref={(node) => {
              inputRef(node);
              referenceElementRef(node);
            }}
            value={cityInputValue}
            data-testid="location-search-input"
            className="form-control"
            enterKeyHint="search"
          />
          <label htmlFor="city-search-typeahead">Near a city</label>
        </Form.Group>
      )}
      renderMenu={(results) => (
        <LocationSearchMenu
          results={results as City[]}
          isError={isError}
          refetch={refetch}
          latitude={latitude}
          longitude={longitude}
          onGetLocation={handleGetLocation}
        />
      )}
    >
      {({ onClear }: { onClear: () => void }) =>
        (!!selectedCityMemo.length || cityInputValue) && (
          <ClearButton
            label="Clear search"
            className="clear-button"
            onClick={() => {
              onClear();
              handleClear();
            }}
          />
        )
      }
    </Typeahead>
  );
};

export default LocationSearch;
