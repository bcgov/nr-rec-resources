import { ROUTE_PATHS } from '@/constants/routes';
import { HelpIcon } from '@/components';
import { EditableGuard } from '@/components/auth';
import { ACTIVITIES_HELP_TEXT } from '@/utils/helpText';
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
        <div className="d-flex align-items-center gap-2">
          <h2 className="mb-0">Activities</h2>
          <HelpIcon id="activities-help" text={ACTIVITIES_HELP_TEXT} />
        </div>

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
