import { FC } from 'react';
import { Topic } from './interfaces';
import { Col, Container } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { ROUTE_PATHS } from '@/constants/routes';

export const OutdoorRecreationTopic: FC<Topic> = ({
  icon,
  mobileIcon,
  title,
  description,
  linkText,
  type,
}) => {
  return (
    <Col
      md={4}
      lg={4}
      className={`d-flex topic-container`}
      data-testid="content-column"
    >
      <Container className="d-flex justify-content-start title-container d-none d-md-block">
        <img src={icon} alt="Topic icon" height={50} width={50} />{' '}
        <span className="indicators">{title}</span>
      </Container>
      <span className="description d-none d-md-block">{description}</span>
      <a href={`${ROUTE_PATHS.HOME}${'search?type='}${type}`}>
        <Container className="d-flex align-items-center link">
          <Col className="d-flex align-items-center flex-nowrap text-nowrap">
            <img
              className="d-block d-md-none mobile-icon"
              src={mobileIcon}
              alt="Topic icon"
              height={30}
              width={30}
            />{' '}
            {linkText}&nbsp;
            <div className="d-none d-md-block">
              <span className="btn-icon">
                <FontAwesomeIcon icon={faAngleRight} />
              </span>
            </div>
          </Col>
          <Col sm={3} className="d-block d-md-none">
            <span className="btn-icon">
              <FontAwesomeIcon icon={faAngleRight} />
            </span>
          </Col>
        </Container>
      </a>
    </Col>
  );
};
