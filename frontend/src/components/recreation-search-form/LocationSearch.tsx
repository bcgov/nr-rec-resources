import { useMemo, useRef } from 'react';
import { Typeahead, ClearButton } from 'react-bootstrap-typeahead';
import { Form, FormControl } from 'react-bootstrap';
import { City } from '@/components/recreation-search-form/types';
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

  const { data } = useSearchCitiesApi();
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

  const handleOnChange = (selected: any[]) => {
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

  const classes = [
    'community-search-typeahead',
    cityInputValue ? 'has-text--true' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Typeahead
      ref={typeaheadRef}
      minLength={1}
      labelKey="cityName"
      filterBy={() => true}
      options={cityOptions}
      selected={selectedCity as City[]}
      onChange={handleOnChange}
      onInputChange={handleInputChange}
      placeholder=" "
      emptyLabel="No suggestions, please check your spelling or try a larger city in B.C."
      className={classes}
      onFocus={handleFocus}
      renderInput={({ inputRef, referenceElementRef, ...inputProps }) => (
        <Form.Group controlId="community-search-typeahead">
          <FormControl
            {...inputProps}
            ref={(node) => {
              inputRef(node);
              referenceElementRef(node);
            }}
            value={cityInputValue}
            className="form-control"
            enterKeyHint="search"
          />
          <label htmlFor="community-search-typeahead">Near a community</label>
        </Form.Group>
      )}
    >
      {({ onClear }) =>
        (!!selectedCity?.length || cityInputValue) && (
          <ClearButton
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
