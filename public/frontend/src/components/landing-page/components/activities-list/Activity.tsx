import { FC } from 'react';
import { LandingPageActivity } from './interfaces';
import { Col, Container, Row } from 'react-bootstrap';
import { ROUTE_PATHS } from '@/constants/routes';

export const Activity: FC<LandingPageActivity> = ({
  title,
  description,
  imageUrl,
  mobileImageUrl,
  activityFilter,
}) => {
  return (
    <>
      <Col
        md={4}
        lg={4}
        className={`d-flex activity-container d-none d-md-block`}
        data-testid="content-column"
      >
        <a
          href={`${ROUTE_PATHS.HOME}${'search?activities='}${activityFilter}`}
          data-testid="desktop-link"
        >
          <div className="w-100 h-100">
            <img
              src={imageUrl}
              alt={description}
              width={349}
              height={203}
              className="activity-image"
              data-testid="desktop-image"
            />
            <div className="activity-title">{title}</div>
            <div className="activity-description">{description}</div>
          </div>
        </a>
      </Col>
      <Container className="activity-container d-block d-md-none">
        <Row className="d-flex align-items-center">
          <Col xs={4} className="p-0 test">
            <a
              href={`${ROUTE_PATHS.HOME}${'search?activities='}${activityFilter}`}
              data-testid="mobile-link"
            >
              <img
                src={mobileImageUrl}
                alt={description}
                width={100}
                height={78}
                className="activity-image"
                data-testid="mobile-image"
              />
            </a>
          </Col>
          <Col xs={8} className="align-items-center justify-content-left">
            <a
              href={`${ROUTE_PATHS.HOME}${'search?activities='}${activityFilter}`}
            >
              <div className="activity-title">{title}</div>
            </a>
          </Col>
        </Row>
      </Container>
    </>
  );
};
