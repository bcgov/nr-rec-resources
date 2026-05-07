import { RecreationActivityDto } from '@/services/recreation-resource-admin/models';
import { activityIconMapFull } from '@shared/data/activityIconMap';
import { Col, Row } from 'react-bootstrap';

type AdaptiveActivityListProps = {
  recreationActivities: RecreationActivityDto[];
};

export const AdaptiveActivityList = ({
  recreationActivities,
}: AdaptiveActivityListProps) => {
  return (
    <Row className="gy-3">
      {recreationActivities.map((activity, index) => {
        const activityIcon =
          activityIconMapFull[activity.recreation_activity_code.toString()];

        return (
          <Col
            key={`adaptive-activity-${activity.recreation_activity_code}-${index}`}
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
        );
      })}
    </Row>
  );
};
