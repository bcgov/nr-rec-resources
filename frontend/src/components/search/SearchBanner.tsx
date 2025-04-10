import '@/components/search/Search.scss';
import { Col, Row, Stack } from 'react-bootstrap';
import { RecreationSearchForm } from '@/components/recreation-search-form';

const SearchBanner = () => {
  return (
    <Stack
      direction="horizontal"
      className="page-nav-container search justify-content-center"
    >
      <Row aria-label="Search banner" className="page align-items-center">
        <Col md={12} lg={3} className="ps-lg-0">
          <h1 className="fs-3 mb-lg-0">Find a site or trail</h1>
        </Col>
        <Col md={12} lg={9} className="mb-3 mb-md-0 pe-lg-0">
          <RecreationSearchForm searchButtonProps={{ variant: 'primary' }} />
        </Col>
      </Row>
    </Stack>
  );
};

export default SearchBanner;
