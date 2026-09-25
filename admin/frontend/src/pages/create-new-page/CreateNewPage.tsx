import { PageLayout } from '@/components';
import { SpatialSubmissionSection } from '@/pages/rec-resource-page/components/RecResourceSpatial/SpatialSubmissionSection';
import { useGetNextRecResourceId } from '@/services/hooks/recreation-resource-admin/useGetNextRecResourceId';
import { Breadcrumbs } from '@shared/index';
import { Alert, Spinner } from 'react-bootstrap';

export const CreateNewPage = () => {
  const { data, isLoading, isError } = useGetNextRecResourceId();

  const recResourceId = data?.rec_resource_id;

  return (
    <PageLayout>
      <div className="d-flex flex-column gap-4">
        <Breadcrumbs />
        <h1 className="mb-0">Create new</h1>
        {isLoading ? (
          <Alert
            variant="light"
            className="mb-0 d-flex align-items-center gap-2"
          >
            <Spinner animation="border" size="sm" aria-hidden="true" />
            <span>Generating next Rec #...</span>
          </Alert>
        ) : null}
        {isError ? (
          <Alert variant="danger" className="mb-0">
            Unable to generate the next Rec #. Please refresh and try again.
          </Alert>
        ) : null}
        {recResourceId ? (
          <SpatialSubmissionSection recResourceId={recResourceId} />
        ) : null}
      </div>
    </PageLayout>
  );
};
