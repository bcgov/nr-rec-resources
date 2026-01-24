import { ROUTE_PATHS } from '@/constants/routes';
import { FeatureFlagGuard } from '@/contexts/feature-flags';
import { RecreationResourceReservationInfoDto } from '@/services';
import { LinkWithQueryParams } from '@shared/components/link-with-query-params';
import { Col, Row, Stack } from 'react-bootstrap';
import { HasReservation, RecResourceReservationItem } from './components';
import { Route } from '@/routes/rec-resource/$id/reservation';

type RecResourceReservationSectionProps = {
  reservationInfo: RecreationResourceReservationInfoDto | null;
};

export const RecResourceReservationSection = (
  props: RecResourceReservationSectionProps,
) => {
  const params = Route.useParams();
  const recResourceId = params?.id;
  const { reservationInfo } = props;
  const reservationItems = [
    {
      key: 'email',
      label: 'Email',
      value: reservationInfo?.reservation_email,
    },
    {
      key: 'phone-number',
      label: 'Phone Number',
      value: reservationInfo?.reservation_phone_number,
    },
    {
      key: 'website',
      label: 'Website',
      value: reservationInfo?.reservation_website,
    },
  ];
  const isReservable = !reservationInfo
    ? false
    : reservationInfo.reservation_email ||
        reservationInfo.reservation_phone_number ||
        reservationInfo.reservation_website
      ? true
      : false;

  return (
    <Stack direction="vertical" gap={4}>
      <div className="d-flex justify-content-between align-items-center">
        <h2>Reservation</h2>

        <FeatureFlagGuard requiredFlags={['enable_full_features']}>
          <LinkWithQueryParams
            to={ROUTE_PATHS.REC_RESOURCE_RESERVATION_EDIT}
            params={{ id: recResourceId }}
            className="btn btn-outline-primary"
          >
            Edit
          </LinkWithQueryParams>
        </FeatureFlagGuard>
      </div>

      <Row>
        <Col xs={12}>
          <HasReservation value={isReservable} />
        </Col>
      </Row>

      <Row className="gy-3">
        {reservationItems.map((item) => (
          <Col key={item.key} lg={12}>
            <RecResourceReservationItem label={item.label} value={item.value} />
          </Col>
        ))}
      </Row>
    </Stack>
  );
};
