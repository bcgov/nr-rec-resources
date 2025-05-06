import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Typeahead,
  ClearButton,
  Menu,
  MenuItem,
} from 'react-bootstrap-typeahead';
import { Form } from 'react-bootstrap';
import { City } from '@/components/recreation-search-form/types';
import { useSearchCitiesApi } from '@/components/recreation-search-form/hooks/useSearchCitiesApi';
import { useSearchInput } from '@/components/recreation-search-form/hooks/useSearchInput';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import '@/components/recreation-search-form/LocationSearch.scss';

const optionLimit = 7;

const HighlightText = ({ city, input }: { city: string; input: string }) => {
  const regex = new RegExp(input, 'gi');
  const highlightedText = city.replace(regex, (match) => `<b>${match}</b>`);
  return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
};

interface LocationSearchProps {
  currentLocation: City;
}

const LocationSearch: React.FC<LocationSearchProps> = ({ currentLocation }) => {
  const {
    cityInputValue,
    setCityInputValue,
    selectedCity,
    setSelectedCity,
    handleSearch,
  } = useSearchInput();
  const { data } = useSearchCitiesApi();
  const cities = useMemo(() => data ?? [], [data]);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const typeaheadRef = useRef<any>(null);

  const cityOptions = (limit: number): City[] => {
    const searchText = cityInputValue?.toLowerCase() ?? '';
    const filtered = cities?.filter(
      (city) =>
        city.cityName.toLowerCase().startsWith(searchText) ||
        city.cityName.toLowerCase().includes(` ${searchText}`),
    );

    const sorted = filtered?.sort((a, b) => {
      const aStarts = a.cityName.toLowerCase().startsWith(searchText);
      const bStarts = b.cityName.toLowerCase().startsWith(searchText);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      if ((b.rank || 0) !== (a.rank || 0)) return (b.rank || 0) - (a.rank || 0);
      return a.cityName.localeCompare(b.cityName);
    });

    return [...(cityInputValue ? sorted.slice(0, limit) : []), currentLocation];
  };

  const handleOnChange = (selected: any[]) => {
    const selectedCities = selected as City[];
    setSelectedCity(selectedCities);
    // make sure this is working
    handleSearch(selectedCities[0]);
  };

  const handleInputChange = (text: string) => {
    setCityInputValue(text);
  };

  const handleClear = () => {
    setCityInputValue('');
    setSelectedCity([]);
  };

  const handleKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const optionsLength = typeaheadRef.current.items.length;
    let activeIndex = typeaheadRef.current.state.activeIndex;
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (e.key === 'ArrowUp') {
        activeIndex = activeIndex - 1;
      } else if (e.key === 'ArrowDown') {
        activeIndex = activeIndex + 1;
      }
      if (activeIndex > optionsLength) {
        activeIndex = -1; // go to the text input
      }
      if (activeIndex < -1) {
        activeIndex = optionsLength - 1; // go to the last item
      }
      typeaheadRef.current.setState({ activeIndex });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const activeOption = cityOptions(optionLimit)[activeIndex];
      if (activeOption !== undefined) {
        handleOnChange([activeOption]);
      } else {
        handleSearch(activeOption);
      }
      setIsDropdownOpen(false);
    } else if (e.key === 'Tab') {
      setIsDropdownOpen(false);
    } else if (
      e.key === 'Backspace' &&
      cityInputValue &&
      cityInputValue.length <= 1
    ) {
      handleClear();
    }
  };

  const hasResult = useCallback(
    (text: string) => {
      const lower = text.toLowerCase();
      return cities.some(
        (city) =>
          city.cityName.toLowerCase().startsWith(lower) ||
          city.cityName.toLowerCase().includes(` ${lower}`),
      );
    },
    [cities],
  );

  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (
        typeaheadRef.current &&
        typeaheadRef.current.inputNode &&
        !typeaheadRef.current.inputNode.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.body.addEventListener('click', clickOutside);
    return () => document.body.removeEventListener('click', clickOutside);
  }, []);

  useEffect(() => {
    if (!isDropdownOpen && cityInputValue && !hasResult(cityInputValue)) {
      setCityInputValue('');
    }
  }, [isDropdownOpen, cityInputValue, setCityInputValue, hasResult]);

  useEffect(() => {
    if (cityInputValue && selectedCity?.length === 0) {
      setIsDropdownOpen(true);
    }
  }, [cityInputValue, selectedCity]);

  useEffect(() => {
    if (
      selectedCity?.length &&
      selectedCity[0].id !== 0 &&
      cityInputValue !== selectedCity[0].cityName
    ) {
      setCityInputValue(selectedCity[0].cityName);
    }
  }, [selectedCity, cityInputValue, setCityInputValue]);

  const classes = [
    'city-search-typeahead',
    cityInputValue ? 'has-text--true' : '',
    isDropdownOpen ? 'is-dropdown-open--true' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Typeahead
      ref={typeaheadRef}
      id="city-search-typeahead"
      minLength={1}
      labelKey="cityName"
      filterBy={() => true}
      options={cityOptions(7) as City[]}
      selected={selectedCity as City[]}
      onChange={handleOnChange}
      onInputChange={handleInputChange}
      onKeyDown={handleKeyDownInput}
      // onFocus={() => setIsDropdownOpen(true)}
      open={isDropdownOpen}
      placeholder=" "
      className={classes}
      renderInput={({ inputRef, referenceElementRef, ...inputProps }) => (
        <Form.Group controlId="city-search-typeahead">
          <Form.Control
            {...inputProps}
            value={selectedCity?.[0]?.cityName ?? cityInputValue}
            ref={(node) => {
              inputRef(node);
              referenceElementRef(node);
            }}
            onKeyDown={handleKeyDownInput}
            enterKeyHint="search"
          />
          <label htmlFor="city-search-typeahead">Near a community</label>
        </Form.Group>
      )}
      renderMenu={(results: unknown[]) => {
        const filteredCities = results.filter(
          (r): r is City => !!r && typeof r === 'object' && 'id' in r,
        );
        if (!cityInputValue) return null;

        const activeIndex = typeaheadRef.current?.state?.activeIndex;

        return (
          <Menu id="city-search-typeahead">
            {filteredCities.length === 0 && cityInputValue && (
              <MenuItem
                tabIndex={-1}
                key="no-suggestions"
                className="no-suggestion-text"
                option=""
                position={0}
              >
                No suggestions, please check your spelling or try a larger city
                in B.C.
              </MenuItem>
            )}
            {filteredCities.map((city, index) =>
              city.id !== 0 ? (
                <MenuItem
                  option={city}
                  position={index}
                  key={city.cityName}
                  className={
                    index === activeIndex
                      ? 'active dropdown-item'
                      : 'dropdown-item'
                  }
                >
                  <HighlightText city={city.cityName} input={cityInputValue} />
                </MenuItem>
              ) : null,
            )}
          </Menu>
        );
      }}
    >
      {({ onClear }) =>
        (!!selectedCity?.length || cityInputValue) && (
          <div className="rbt-aux">
            <ClearButton
              onClick={() => {
                onClear();
                handleClear();
                setIsDropdownOpen(false);
              }}
            />
          </div>
        )
      }
    </Typeahead>
  );
};

export default LocationSearch;
