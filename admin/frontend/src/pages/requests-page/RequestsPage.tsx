import { PageLayout, Table as DataTable } from '@/components';
import { ROUTE_PATHS } from '@/constants/routes';
import { useGetPendingMapFeatureRequests } from '@/services/hooks/recreation-resource-admin/useGetPendingMapFeatureRequests';
import { PendingMapFeatureRequestRowDto } from '@/services/recreation-resource-admin';
import { Breadcrumbs } from '@shared/index';
import { Alert, Spinner } from 'react-bootstrap';
import { Link } from '@tanstack/react-router';

export const RequestsPage = () => {
  const { data, isLoading, isError } = useGetPendingMapFeatureRequests();

  return (
    <PageLayout>
      <div className="d-flex flex-column gap-4">
        <Breadcrumbs />

        <div>
          <h1 className="mb-1">Requests</h1>
          <p className="text-muted mb-0">
            Pending spatial submission requests awaiting processing.
          </p>
        </div>

        {isLoading ? (
          <Alert
            variant="light"
            className="mb-0 d-flex align-items-center gap-2"
          >
            <Spinner animation="border" size="sm" aria-hidden="true" />
            <span>Loading pending requests...</span>
          </Alert>
        ) : null}

        {isError ? (
          <Alert variant="danger" className="mb-0">
            Unable to load pending requests. Please refresh and try again.
          </Alert>
        ) : null}

        <DataTable<PendingMapFeatureRequestRowDto>
          className="mb-0"
          columns={[
            {
              header: 'Rec #',
              render: (row) => (
                <Link
                  to={ROUTE_PATHS.REC_RESOURCE_GEOSPATIAL}
                  params={{ id: row.rec_resource_id }}
                >
                  {row.rec_resource_id}
                </Link>
              ),
            },
            {
              header: 'Name',
              render: (row) => row.name || '-',
            },
            {
              header: 'Recreation District',
              render: (row) =>
                row.recreation_district || row.district_description || '-',
            },
            {
              header: 'Natural Resource District',
              render: (row) => row.natural_resource_district || '-',
            },
            {
              header: 'Recreation type',
              render: (row) => row.recreation_type || '-',
            },
            {
              header: 'Status',
              render: (row) => row.amend_status_code,
            },
            {
              header: 'Geometry Type',
              render: (row) =>
                row.geometry_types.length ? row.geometry_types.join(', ') : '-',
            },
            {
              header: 'Features',
              render: (row) => row.feature_count,
            },
            {
              header: 'Requested At',
              render: (row) =>
                row.requested_at
                  ? new Date(row.requested_at).toLocaleString('en-CA', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '-',
            },
          ]}
          rows={data?.data ?? []}
          emptyMessage="No pending requests found."
          getRowKey={(row) => row.rec_resource_id}
        />
      </div>
    </PageLayout>
  );
};
