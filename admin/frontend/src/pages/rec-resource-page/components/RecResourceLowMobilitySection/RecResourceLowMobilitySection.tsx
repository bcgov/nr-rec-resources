import { NotVisibleOnPublicSiteBadge } from '@/pages/rec-resource-page/components/shared/NotVisibleOnPublicSiteBadge';
import { RecreationActivityDto } from '@/services/recreation-resource-admin/models';
import { Stack } from 'react-bootstrap';

type RecResourceLowMobilitySectionProps = {
  recreationActivities: RecreationActivityDto[];
};

export const RecResourceLowMobilitySection = ({
  recreationActivities,
}: RecResourceLowMobilitySectionProps) => {
  return (
    <Stack direction="vertical" gap={4}>
      <div className="d-flex align-items-center gap-2">
        <h2 className="mb-0">Low mobility access</h2>
        <NotVisibleOnPublicSiteBadge />
      </div>

      {recreationActivities.length === 0 ? (
        <div>No low mobility access assigned.</div>
      ) : (
        <div>
          <ul className="list-unstyled">
            {recreationActivities.map((activity) => (
              <li className="fw-bold" key={activity.recreation_activity_code}>
                {activity.description}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Stack>
  );
};
