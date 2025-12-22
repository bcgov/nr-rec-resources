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
      <Container className="d-flex justify-content-left title-container d-none d-md-block">
        <img src={icon} alt="Topic icon" height={50} width={50} />{' '}
        <span className="indicators">{title}</span>
      </Container>
      <span className="description d-none d-md-block">{description}</span>
      <a href={`${ROUTE_PATHS.HOME}${'search?type='}${type}`}>
        <Container className="d-flex align-items-center justify-content-left link">
          <img
            className="d-block d-md-none mobile-icon"
            src={mobileIcon}
            alt="Topic icon"
            height={30}
            width={30}
          />{' '}
          {linkText}&nbsp;
          <span className="btn-icon">
            <FontAwesomeIcon icon={faAngleRight} />
          </span>
        </Container>
      </a>
    </Col>
  );
};
