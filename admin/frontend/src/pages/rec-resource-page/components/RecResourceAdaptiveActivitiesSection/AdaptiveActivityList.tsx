import { RoleGuard } from '@/components/auth';
import { ROLES } from '@/hooks/useAuthorizations';
import { useGetTrails } from '@/services';
import { RecreationActivityDto } from '@/services/recreation-resource-admin/models';
import { activityIconMapFull } from '@shared/data/activityIconMap';
import { useState } from 'react';
import { Button, Col, Row, Stack } from 'react-bootstrap';
import { TrailFormModal } from './TrailFormModal';
import { TrailsTable } from './TrailsTable';

type AdaptiveActivityListProps = {
  recResourceId: string;
  recreationActivities: RecreationActivityDto[];
};

export const AdaptiveActivityList = ({
  recResourceId,
  recreationActivities,
}: AdaptiveActivityListProps) => {
  const [addingForActivity, setAddingForActivity] = useState<number | null>(
    null,
  );
  const { data: trails = [] } = useGetTrails(recResourceId);

  return (
    <Stack direction="vertical" gap={5}>
      {recreationActivities.map((activity, index) => {
        const activityIcon =
          activityIconMapFull[activity.recreation_activity_code.toString()];
        const activityTrails = trails.filter(
          (t) =>
            t.recreation_activity_code === activity.recreation_activity_code,
        );

        return (
          <Stack
            key={`adaptive-activity-${activity.recreation_activity_code}-${index}`}
            direction="vertical"
            gap={3}
          >
            <Row>
              <Col xs={12}>
                <div className="icon-container">
                  {activityIcon && (
                    <img
                      src={activityIcon}
                      alt={`${activity.description} icon`}
                      width={24}
                      height={24}
                    />
                  )}
                  <div>
                    <div className="fw-bold">{activity.description}</div>
                    {activity.details && (
                      <div className="text-secondary small mt-1">
                        {activity.details}
                      </div>
                    )}
                  </div>
                </div>
              </Col>
            </Row>

            <TrailsTable
              recResourceId={recResourceId}
              activityCode={activity.recreation_activity_code}
              trails={activityTrails}
            />

            <RoleGuard requireAll={[ROLES.ADMIN]}>
              <div>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() =>
                    setAddingForActivity(activity.recreation_activity_code)
                  }
                >
                  + Add trail
                </Button>
              </div>
            </RoleGuard>
          </Stack>
        );
      })}

      {addingForActivity !== null && (
        <TrailFormModal
          recResourceId={recResourceId}
          activityCode={addingForActivity}
          mode="create"
          onClose={() => setAddingForActivity(null)}
        />
      )}
    </Stack>
  );
};
