import { FC, FormEvent, useEffect } from 'react';
import {
  Button,
  ButtonProps,
  Col,
  Form,
  FormControl,
  FormGroup,
  InputGroup,
  Row,
} from 'react-bootstrap';
import { ClearButton } from 'react-bootstrap-typeahead';
import LocationSearch from '@/components/recreation-search-form/LocationSearch';
import { useSearchParams } from 'react-router-dom';
import '@/components/recreation-search-form/RecreationSearchForm.scss';
import { useSearchInput } from '@/components/recreation-search-form/hooks/useSearchInput';
import { trackSiteSearch } from '@/utils/matomo';

interface RecreationSearchFormProps {
  initialNameInputValue?: string;
  buttonText?: string;
  placeholder?: string;
  searchButtonProps?: ButtonProps;
  location?: string;
}

export const RecreationSearchForm: FC<RecreationSearchFormProps> = ({
  initialNameInputValue,
  buttonText = 'Search',
  placeholder = 'Search by name',
  searchButtonProps,
  location = 'Search page',
}) => {
  const [searchParams] = useSearchParams();
  const filter = searchParams.get('filter');
  const {
    nameInputValue,
    setNameInputValue,
    handleSearch,
    handleClearNameInput,
  } = useSearchInput({ initialNameInputValue });

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
          <InputGroup className="search-input-group limit-width">
            <Col className="p-0 flex-grow-1">
              <FormGroup
                controlId="name-search-input"
                className={`${nameInputValue ? 'has-text--true' : ''}`}
                style={{ position: 'relative' }}
              >
                <FormControl
                  aria-label={placeholder}
                  type="text"
                  placeholder=" "
                  value={nameInputValue}
                  onChange={(e) => setNameInputValue(e.target.value)}
                  className="form-control"
                  data-testid="search-input"
                />
                <label htmlFor="name-search-input">{placeholder}</label>
                {nameInputValue && (
                  <ClearButton
                    onClick={handleClearNameInput}
                    className="clear-button"
                    aria-label="Clear search"
                  />
                )}
              </FormGroup>
            </Col>

            <div className="search-spacer">or</div>

            <Col className="p-0 flex-grow-1">
              <LocationSearch />
            </Col>
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
