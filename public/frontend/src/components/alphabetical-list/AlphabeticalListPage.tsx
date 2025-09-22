import { useEffect } from 'react';
import { Col, Row, Stack } from 'react-bootstrap';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PageTitle from '@/components/layout/PageTitle';
import { ROUTE_TITLES, ROUTE_PATHS } from '@/routes/constants';
import { AlphabeticalResourceList } from './AlphabeticalResourceList';
import { AlphabeticalNavigation } from './AlphabeticalNavigation';
import { useAlphabeticalResources } from '@/service/queries/alphabetical-resources';

const AlphabeticalListPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedLetter = searchParams.get('letter') || 'A';

  // Redirect to 'A' if no letter is specified
  useEffect(() => {
    if (!searchParams.get('letter')) {
      navigate(`${ROUTE_PATHS.ALPHABETICAL}?letter=A`, { replace: true });
    }
  }, [searchParams, navigate]);

  const {
    data: resources,
    isLoading,
    error,
  } = useAlphabeticalResources(selectedLetter);

  const handleLetterSelect = (newLetter: string) => {
    navigate(`${ROUTE_PATHS.ALPHABETICAL}?letter=${newLetter}`);
  };

  return (
    <>
      <PageTitle title={ROUTE_TITLES.ALPHABETICAL} />
      <div className="page">
        <Row>
          <Col>
            <Stack gap={4}>
              <div>
                <h1>Browse by Letter</h1>
                <p className="text-muted">
                  Explore recreation resources alphabetically by selecting a
                  letter below.
                </p>
              </div>

              <AlphabeticalNavigation
                selectedLetter={selectedLetter}
                onLetterSelect={handleLetterSelect}
              />

              <AlphabeticalResourceList
                resources={resources}
                isLoading={isLoading}
                error={error}
                selectedLetter={selectedLetter}
              />
            </Stack>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default AlphabeticalListPage;
