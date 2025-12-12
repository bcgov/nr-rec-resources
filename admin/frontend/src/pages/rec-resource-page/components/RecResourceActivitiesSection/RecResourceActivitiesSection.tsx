import { ROUTE_PATHS } from '@/constants/routes';
import { FeatureFlagGuard } from '@/contexts/feature-flags';
import { RecreationActivityDto } from '@/services/recreation-resource-admin/models';
import { LinkWithQueryParams } from '@shared/components/link-with-query-params';
import { useParams } from '@tanstack/react-router';
import { Stack } from 'react-bootstrap';
import { ActivityList } from './ActivityList';

type RecResourceActivitiesSectionProps = {
  recreationActivities: RecreationActivityDto[];
};

export const RecResourceActivitiesSection = ({
  recreationActivities,
}: RecResourceActivitiesSectionProps) => {
  const { id: rec_resource_id } = useParams({ from: '/rec-resource/$id' });

  return (
    <Stack direction="vertical" gap={4}>
      <div className="d-flex justify-content-between align-items-center">
        <h2>Activities</h2>

        <FeatureFlagGuard requiredFlags={['enable_full_features']}>
          <LinkWithQueryParams
            to={ROUTE_PATHS.REC_RESOURCE_ACTIVITIES_EDIT}
            params={{ id: rec_resource_id }}
            className="btn btn-outline-primary"
          >
            Edit
          </LinkWithQueryParams>
        </FeatureFlagGuard>
      </div>

      {!recreationActivities || recreationActivities.length === 0 ? (
        <div className="text-secondary">No activities assigned.</div>
      ) : (
        <ActivityList recreationActivities={recreationActivities} />
      )}
    </Stack>
  );
};
