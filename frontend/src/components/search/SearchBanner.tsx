import '@/components/search/Search.scss';
import { Col, Row, Stack } from 'react-bootstrap';
import { RecreationSearchForm } from '@/components/recreation-search-form';

const SearchBanner = () => {
  return (
    <Stack
      direction="horizontal"
      className="page-nav-container search justify-content-center"
    >
      <div aria-label="Search banner" className="page">
        <Row className="w-100 align-items-center">
          <Col md={12} lg={4}>
            <h1 className="fs-3 mb-lg-0">Find a site or trail</h1>
          </Col>
          <Col md={12} lg={8} className="mb-3 mb-md-0">
            <RecreationSearchForm searchButtonProps={{ variant: 'primary' }} />
          </Col>
        </Row>
      </div>
    </Stack>
  );
};

export default SearchBanner;
