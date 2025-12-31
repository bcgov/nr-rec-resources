import { RecreationActivityDto } from '@/services/recreation-resource-admin/models';
import { activityIconMapFull } from '@shared/data/activityIconMap';
import { Col, Row } from 'react-bootstrap';

type ActivityListProps = {
  recreationActivities: RecreationActivityDto[];
};

export const ActivityList = ({ recreationActivities }: ActivityListProps) => {
  return (
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
              <div className="fw-bold">{activity.description}</div>
            </div>
          </Col>
        );
      })}
    </Row>
  );
};
