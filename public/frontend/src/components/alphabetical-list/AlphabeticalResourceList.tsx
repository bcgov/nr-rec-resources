import { Alert, Card, Col, Row, Spinner, Stack } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/routes/constants';
import { AlphabeticalRecreationResourceModel } from '@/service/custom-models';
import './AlphabeticalResourceList.scss';

interface AlphabeticalResourceListProps {
  resources?: AlphabeticalRecreationResourceModel[];
  isLoading: boolean;
  error: Error | null;
  selectedLetter: string;
}

export const AlphabeticalResourceList = ({
  resources,
  isLoading,
  error,
  selectedLetter,
}: AlphabeticalResourceListProps) => {
  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2 text-muted">Loading resources...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error loading resources</Alert.Heading>
        <p>
          Unable to load resources for letter "{selectedLetter}". Please try
          again.
        </p>
      </Alert>
    );
  }

  if (!resources || resources.length === 0) {
    return (
      <Alert variant="info">
        <Alert.Heading>No resources found</Alert.Heading>
        <p>
          No recreation resources found starting with "{selectedLetter}". Try
          selecting a different letter.
        </p>
      </Alert>
    );
  }

  return (
    <div className="alphabetical-resource-list">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="h5 mb-0">
          Resources starting with "{selectedLetter}" ({resources.length})
        </h2>
      </div>

      <Row className="g-3">
        {resources.map((resource) => (
          <Col key={resource.rec_resource_id} xs={12} sm={6} lg={4}>
            <Card className="h-100 alphabetical-resource-card">
              <Card.Body>
                <Stack gap={2}>
                  <div>
                    <h5 className="card-title">
                      <Link
                        to={ROUTE_PATHS.REC_RESOURCE.replace(
                          ':id',
                          resource.rec_resource_id,
                        )}
                        className="text-decoration-none"
                      >
                        {resource.name}
                      </Link>
                    </h5>
                  </div>

                  <div className="resource-meta">
                    <span className="badge bg-secondary me-2">
                      {resource.recreation_resource_type_code}
                    </span>
                    <small className="text-muted">
                      {resource.recreation_resource_type}
                    </small>
                  </div>
                </Stack>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};
