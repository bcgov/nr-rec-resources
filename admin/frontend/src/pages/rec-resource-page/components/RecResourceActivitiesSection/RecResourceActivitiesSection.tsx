import { ROUTE_PATHS } from '@/constants/routes';
import { FeatureFlagGuard } from '@/contexts/feature-flags';
import { EditAction } from '@/components/buttons';
import { RecreationActivityDto } from '@/services/recreation-resource-admin/models';
import { useParams } from '@tanstack/react-router';
import { Stack } from 'react-bootstrap';
import { ActivityList } from './ActivityList';
import { useAuthorizations } from '@/hooks/useAuthorizations';

type RecResourceActivitiesSectionProps = {
  recreationActivities: RecreationActivityDto[];
};

export const RecResourceActivitiesSection = ({
  recreationActivities,
}: RecResourceActivitiesSectionProps) => {
  const { id: rec_resource_id } = useParams({ from: '/rec-resource/$id' });
  const { canEdit } = useAuthorizations();

  return (
    <Stack direction="vertical" gap={4}>
      <div className="d-flex justify-content-between align-items-center">
        <h2>Activities</h2>

        <FeatureFlagGuard requiredFlags={['enable_full_features']}>
          <EditAction
            to={ROUTE_PATHS.REC_RESOURCE_ACTIVITIES_FEATURES_EDIT.replace(
              '$id',
              rec_resource_id,
            )}
            disabled={!canEdit}
          />
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
