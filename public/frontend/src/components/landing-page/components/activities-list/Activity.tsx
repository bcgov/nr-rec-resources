import { FC } from 'react';
import { LandingPageActivity } from './interfaces';
import { Col } from 'react-bootstrap';
import { ROUTE_PATHS } from '@/constants/routes';

export const Activity: FC<LandingPageActivity> = ({
  title,
  description,
  imageUrl,
  activityFilter,
}) => {
  return (
    <Col
      md={4}
      lg={4}
      className={`d-flex activity-container`}
      data-testid="content-column"
    >
      <a href={`${ROUTE_PATHS.HOME}${'search?activities='}${activityFilter}`}>
        <div className="w-100 h-100">
          <img
            src={imageUrl}
            alt={description}
            width={349}
            height={203}
            className="activity-image"
          />
          <div className="activity-title">{title}</div>
          <div className="activity-description">{description}</div>
        </div>
      </a>
    </Col>
  );
};
