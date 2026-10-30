import { RecreationActivityDto } from '@/services/recreation-resource-admin/models';
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
  return (
    <Stack direction="vertical" gap={4}>
      <h2>Accessible activities</h2>

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
