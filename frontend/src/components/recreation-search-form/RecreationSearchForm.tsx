import { FC, FormEvent, useEffect } from 'react';
import {
  Button,
  ButtonProps,
  Col,
  Form,
  FormControl,
  InputGroup,
  Row,
} from 'react-bootstrap';
import LocationSearch from '@/components/recreation-search-form/LocationSearch';
import { useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import './RecreationSearchForm.scss';
import { useSearchInput } from '@/components/recreation-search-form/hooks/useSearchInput';
import { trackSiteSearch } from '@/utils/matomo';

interface RecreationSearchFormProps {
  initialNameInputValue?: string;
  buttonText?: string;
  placeholder?: string;
  searchButtonProps?: ButtonProps;
  showSearchIcon?: boolean;
  location?: string;
}

export const RecreationSearchForm: FC<RecreationSearchFormProps> = ({
  initialNameInputValue,
  buttonText = 'Search',
  placeholder = 'Search by name',
  searchButtonProps,
  showSearchIcon = false,
  location = 'Search page',
}) => {
  const [searchParams] = useSearchParams();
  const filter = searchParams.get('filter');
  const { nameInputValue, setNameInputValue, handleSearch, handleClear } =
    useSearchInput({ initialNameInputValue });

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSearch();
    trackSiteSearch({
      category: `${location} search form`,
      keyword: nameInputValue,
    });
  };

  useEffect(() => {
    if (!filter) {
      setNameInputValue('');
    }
  }, [filter, setNameInputValue]);

  return (
    <Form
      onSubmit={handleFormSubmit}
      className="search-form"
      data-testid="search-form"
    >
      <Row className="gy-3 gx-0 gx-lg-3">
        <Col md={12} lg="auto" className="flex-grow-0 flex-lg-grow-1">
          <InputGroup className="search-input-group">
            <div className="search-input-container">
              <FormControl
                aria-label={placeholder}
                type="text"
                value={nameInputValue}
                onChange={(e) => setNameInputValue(e.target.value)}
                placeholder={placeholder}
                className={`search-input rounded-2 ${showSearchIcon ? 'has-search-icon' : ''}`}
                data-testid="search-input"
              />
              {showSearchIcon && (
                <FontAwesomeIcon icon={faSearch} className="search-icon" />
              )}
              {nameInputValue && (
                <Button
                  variant="link"
                  onClick={handleClear}
                  className="clear-button"
                  aria-label="Clear search"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </Button>
              )}
            </div>
            <div className="search-spacer">or</div>
            <LocationSearch />
          </InputGroup>
        </Col>
        <Col md={12} lg="auto">
          <Button
            onClick={handleSearch}
            {...searchButtonProps}
            className={`search-button w-100 ${searchButtonProps?.className}`}
          >
            {buttonText}
          </Button>
        </Col>
      </Row>
    </Form>
  );
};
