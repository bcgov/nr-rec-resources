import { ROUTE_PATHS } from '@/constants/routes';
import { FeatureFlagGuard } from '@/contexts/feature-flags';
import { RecreationResourceReservationInfoDto } from '@/services';
import { LinkWithQueryParams } from '@shared/components/link-with-query-params';
import { Col, Row, Stack } from 'react-bootstrap';
import { Route } from '@/routes/rec-resource/$id/reservation';
import { RESERVATION_METHOD_LABEL_MAP } from '@/pages/rec-resource-page/components/RecResourceReservationSection/EditSection/constants';
import {
  getReservationContact,
  getReservationMethod,
} from '@/pages/rec-resource-page/components/RecResourceReservationSection/helpers';
import './RecResourceReservationSection.scss';

type RecResourceReservationSectionProps = {
  reservationInfo: RecreationResourceReservationInfoDto | null;
};

export const RecResourceReservationSection = (
  props: RecResourceReservationSectionProps,
) => {
  const params = Route.useParams();
  const recResourceId = params?.id;
  const { reservationInfo } = props;
  const reservationMethodKey = getReservationMethod(reservationInfo);
  const reservationMethod = reservationMethodKey
    ? RESERVATION_METHOD_LABEL_MAP[reservationMethodKey]
    : undefined;
  const reservationContact = getReservationContact(
    reservationInfo,
    reservationMethodKey,
  );
  const isReservable = !reservationInfo
    ? false
    : reservationInfo.reservation_email ||
        reservationInfo.reservation_phone_number ||
        reservationInfo.reservation_website
      ? true
      : false;
  const reservationItems = [
    {
      key: 'reservable',
      label: 'Reservable',
      value: isReservable ? 'Yes' : 'No',
    },
    {
      key: 'reservation-method',
      label: 'Reservation method',
      value: reservationMethod,
    },
    {
      key: 'reservation-contact',
      label: 'Reservation contact',
      value: reservationContact,
    },
  ];

  return (
    <Stack direction="vertical" gap={4}>
      <div className="reservation-section__header d-flex justify-content-between align-items-center">
        <h2 className="mb-0">Reservations</h2>

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

      <div className="reservation-panel">
        <Row className="gy-4">
          {reservationItems.map((item) => (
            <Col key={item.key} lg={12}>
              <div className="reservation-section__item">
                <div className="reservation-section__label reservation-body-text">
                  {item.label}
                </div>
                <div className="reservation-section__value reservation-body-text">
                  {item.value || '-'}
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </Stack>
  );
};
