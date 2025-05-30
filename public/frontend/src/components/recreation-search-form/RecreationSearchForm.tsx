import { FC, FormEvent } from 'react';
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
import LocationSearch from '@/components/recreation-search-form/location-search/LocationSearch';
import '@/components/recreation-search-form/RecreationSearchForm.scss';
import { useSearchInput } from '@/components/recreation-search-form/hooks/useSearchInput';
import { trackSiteSearch } from '@/utils/matomo';

interface RecreationSearchFormProps {
  buttonText?: string;
  placeholder?: string;
  searchButtonProps?: ButtonProps;
  location?: string;
}

export const RecreationSearchForm: FC<RecreationSearchFormProps> = ({
  buttonText = 'Search',
  placeholder = 'Search by name',
  searchButtonProps,
  location = 'Search page',
}) => {
  const {
    nameInputValue,
    setNameInputValue,
    handleSearch,
    handleClearNameInput,
  } = useSearchInput();

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSearch();
    trackSiteSearch({
      category: `${location} search form`,
      keyword: nameInputValue,
    });
  };

  return (
    <Form
      onSubmit={handleFormSubmit}
      className="search-form"
      data-testid="search-form"
    >
      <Row className="gy-3 gx-0 gx-lg-3">
        <Col md={10} className="pe-md-3 pe-lg-2">
          <InputGroup className="search-input-group">
            <Col className="position-relative">
              <FormGroup
                controlId="name-search-input"
                className={`${nameInputValue ? 'has-text--true' : ''}`}
              >
                <FormControl
                  aria-label={placeholder}
                  type="text"
                  placeholder=" "
                  value={nameInputValue}
                  onChange={(e) => setNameInputValue(e.target.value)}
                  className="form-control"
                  data-testid="name-search-input"
                />
                <label htmlFor="name-search-input">{placeholder}</label>
                {nameInputValue && (
                  <ClearButton
                    onClick={handleClearNameInput}
                    className="clear-button"
                    label="Clear search"
                  />
                )}
              </FormGroup>
            </Col>

            <div className="search-spacer">or</div>

            <Col>
              <LocationSearch />
            </Col>
          </InputGroup>
        </Col>
        <Col md={2}>
          <Button
            type="submit"
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
