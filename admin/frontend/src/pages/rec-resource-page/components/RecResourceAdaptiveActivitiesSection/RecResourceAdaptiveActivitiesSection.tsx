import { ROUTE_PATHS } from '@/constants/routes';
import { RoleGuard } from '@/components/auth';
import { ROLES } from '@/hooks/useAuthorizations';
import { RecreationActivityDto } from '@/services/recreation-resource-admin/models';
import { Link, useParams } from '@tanstack/react-router';
import { Stack } from 'react-bootstrap';
import { AdaptiveActivityList } from './AdaptiveActivityList';

type RecResourceAdaptiveActivitiesSectionProps = {
  recResourceId: string;
  recreationActivities: RecreationActivityDto[];
};

export const RecResourceAdaptiveActivitiesSection = ({
  recResourceId,
  recreationActivities,
}: RecResourceAdaptiveActivitiesSectionProps) => {
  const { id: rec_resource_id } = useParams({ from: '/rec-resource/$id' });

  return (
    <Stack direction="vertical" gap={4}>
      <div className="d-flex justify-content-between align-items-center">
        <h2>Accessible activities</h2>

        <RoleGuard requireAll={[ROLES.ADMIN]}>
          <Link
            to={ROUTE_PATHS.REC_RESOURCE_ACTIVITIES_FEATURES_EDIT.replace(
              '$id',
              rec_resource_id,
            )}
            className="btn btn-outline-primary"
          >
            Edit
          </Link>
        </RoleGuard>
      </div>

      {!recreationActivities || recreationActivities.length === 0 ? (
        <div className="text-secondary">No accessible activities assigned.</div>
      ) : (
        <AdaptiveActivityList
          recResourceId={recResourceId}
          recreationActivities={recreationActivities}
        />
      )}
    </Stack>
  );
};
