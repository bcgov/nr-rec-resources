import { ROUTE_PATHS } from '@/constants/routes';
import { EditableGuard } from '@/components/auth';
import { useRecResource } from '@/pages/rec-resource-page/hooks/useRecResource';
import { RecreationActivityDto } from '@/services/recreation-resource-admin/models';
import { Link, useParams } from '@tanstack/react-router';
import { Stack } from 'react-bootstrap';
import { ActivityList } from './ActivityList';

type RecResourceActivitiesSectionProps = {
  recreationActivities: RecreationActivityDto[];
};

export const RecResourceActivitiesSection = ({
  recreationActivities,
}: RecResourceActivitiesSectionProps) => {
  const { id: rec_resource_id } = useParams({ from: '/rec-resource/$id' });
  const { recResource } = useRecResource();
  const isArchived = recResource?.rec_status_code === 'AR';

  return (
    <Stack direction="vertical" gap={4}>
      <div className="d-flex justify-content-between align-items-center">
        <h2>Activities</h2>

        <EditableGuard isArchived={isArchived}>
          <Link
            to={ROUTE_PATHS.REC_RESOURCE_ACTIVITIES_FEATURES_EDIT.replace(
              '$id',
              rec_resource_id,
            )}
            className="btn btn-outline-primary"
          >
            Edit
          </Link>
        </EditableGuard>
      </div>

      {!recreationActivities || recreationActivities.length === 0 ? (
        <div className="text-secondary">No activities assigned.</div>
      ) : (
        <ActivityList recreationActivities={recreationActivities} />
      )}
    </Stack>
  );
};
