import '@/components/search/Search.scss';
import { Col, Row, Stack } from 'react-bootstrap';
import RecreationSuggestionForm from '@/components/recreation-suggestion-form/RecreationSuggestionForm';
import { MATOMO_SEARCH_CONTEXT_LIST } from '@/constants/analytics';

const SearchBanner = () => {
  return (
    <Stack
      direction="horizontal"
      className="page-nav-container search justify-content-center"
    >
      <Row
        aria-label="Search banner"
        className="page align-items-center search-page-row py-2"
      >
        <Col md={12} lg={3}>
          <h1 className="fs-3 mb-lg-0">Find a site or trail</h1>
        </Col>
        <Col md={12} lg={9} className="mb-1 mb-md-0">
          <RecreationSuggestionForm
            trackingContext={MATOMO_SEARCH_CONTEXT_LIST}
          />
        </Col>
      </Row>
    </Stack>
  );
};

export default SearchBanner;
