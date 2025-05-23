import { useMemo, useRef } from 'react';
import { Typeahead, ClearButton, Menu } from 'react-bootstrap-typeahead';
import { Form, FormControl } from 'react-bootstrap';
import { City } from '@/components/recreation-search-form/types';
import { Option } from 'react-bootstrap-typeahead/types/types';
import { useSearchCitiesApi } from '@/components/recreation-search-form/hooks/useSearchCitiesApi';
import { useSearchInput } from '@/components/recreation-search-form/hooks/useSearchInput';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import '@/components/recreation-search-form/RecreationSearchForm.scss';

const LocationSearch: React.FC = () => {
  const {
    cityInputValue,
    setCityInputValue,
    selectedCity,
    setSelectedCity,
    handleCityInputSearch: handleSearch,
    handleClearCityInput,
  } = useSearchInput();

  const { data, isError, refetch } = useSearchCitiesApi();
  const cities = useMemo(() => data ?? [], [data]);

  const typeaheadRef = useRef<any>(null);

  const cityOptions = useMemo(() => {
    const searchText = cityInputValue?.toLowerCase() ?? '';
    const filtered = cities?.filter(
      (city) =>
        city.cityName.toLowerCase().startsWith(searchText) ||
        city.cityName.toLowerCase().includes(` ${searchText}`),
    );
    return filtered?.slice(0, 7) ?? [];
  }, [cityInputValue, cities]);

  const handleOnChange = (selected: Option[]) => {
    const selectedCities = selected as City[];
    setSelectedCity(selectedCities);
    handleSearch(selectedCities[0]);
    setCityInputValue(selectedCities[0]?.cityName ?? '');
  };

  const handleInputChange = (text: string) => {
    setCityInputValue(text);
  };

  const handleClear = () => {
    setSelectedCity([]);
    handleClearCityInput();
  };

  const handleFocus = () => {
    if (!cityInputValue) {
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
      selected={selectedCity ?? []}
      onChange={handleOnChange}
      onInputChange={handleInputChange}
      placeholder=" "
      emptyLabel={
        isError
          ? ''
          : 'No suggestions, please check your spelling or try a larger city in B.C.'
      }
      className={`${cityInputValue ? 'has-text' : ''}`}
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
      {...(isError && {
        renderMenu: () => (
          <Menu>
            <div className="error-state">
              Failed to load cities.
              <button className="btn btn-link" onClick={() => refetch()}>
                Retry
              </button>
            </div>
          </Menu>
        ),
      })}
    >
      {({ onClear }: { onClear: () => void }) =>
        (!!selectedCity?.length || cityInputValue) && (
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
