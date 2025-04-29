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
import { useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import './RecreationSearchForm.scss';
import { useSearchInput } from '@/components/recreation-search-form/useSearchInput';

interface RecreationSearchFormProps {
  initialValue?: string;
  buttonText?: string;
  placeholder?: string;
  searchButtonProps?: ButtonProps;
  showSearchIcon?: boolean;
}

export const RecreationSearchForm: FC<RecreationSearchFormProps> = ({
  initialValue,
  buttonText = 'Search',
  placeholder = 'Search by name or community',
  searchButtonProps,
  showSearchIcon = false,
}) => {
  const [searchParams] = useSearchParams();
  const filter = searchParams.get('filter');
  const { inputValue, setInputValue, handleSearch, handleClear } =
    useSearchInput({ initialValue });

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  useEffect(() => {
    if (!filter) {
      setInputValue('');
    }
  }, [filter, setInputValue]);

  return (
    <Form
      onSubmit={handleFormSubmit}
      className="search-form"
      data-testid="search-form"
    >
      <Row className="gy-3 gx-0 gx-lg-3">
        <Col md={12} lg="auto" className="flex-grow-0 flex-lg-grow-1">
          <InputGroup className="search-input-group" role="group" aria-labelledby={placeholder}>
            <FormControl
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={placeholder}
              className={`search-input rounded-2 ${showSearchIcon ? 'has-search-icon' : ''}`}
              data-testid="search-input"
            />
            {showSearchIcon && (
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
            )}
            {inputValue && (
              <Button
                variant="link"
                onClick={handleClear}
                className="clear-button"
                aria-label="Clear search"
              >
                <FontAwesomeIcon icon={faTimes} />
              </Button>
            )}
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
