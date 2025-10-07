import { RecreationActivityDto } from '@/services/recreation-resource-admin/models';
import { Col, Row, Stack } from 'react-bootstrap';
import { activityIconMapFull } from '@shared/data/activityIconMap';

type RecResourceActivitySectionProps = {
  recreationActivities: RecreationActivityDto[];
};

export const RecResourceActivitySection = ({
  recreationActivities,
}: RecResourceActivitySectionProps) => {
  if (!recreationActivities || recreationActivities.length === 0) {
    return null;
  }

  return (
    <Stack direction="vertical" gap={3}>
      <h2>Activities</h2>
      <Row className="gy-3">
        {recreationActivities.map((activity, index) => {
          const activityIcon =
            activityIconMapFull[activity.recreation_activity_code.toString()];

          return (
            <Col
              key={`activity-${activity.recreation_activity_code}-${index}`}
              xs={12}
            >
              <div className="icon-container">
                {activityIcon && (
                  <img
                    src={activityIcon}
                    alt={`${activity.description} icon`}
                    width={24}
                    height={24}
                  />
                )}
                <div className="text-primary fw-bold">
                  {activity.description}
                </div>
              </div>
            </Col>
          );
        })}
      </Row>
    </Stack>
  );
};
