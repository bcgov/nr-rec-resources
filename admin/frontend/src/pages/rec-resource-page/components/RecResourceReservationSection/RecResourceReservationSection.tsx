import { ROUTE_PATHS } from '@/constants/routes';
import { FeatureFlagGuard } from '@/contexts/feature-flags';
import { EditAction } from '@/components/buttons';
import { RecreationResourceReservationInfoDto } from '@/services';
import { Col, Row, Stack } from 'react-bootstrap';
import { HasReservation } from './components';
import { FieldItem } from '../shared/FieldItem';
import { Route } from '@/routes/rec-resource/$id/reservation';
import { useAuthorizations } from '@/hooks/useAuthorizations';

type RecResourceReservationSectionProps = {
  reservationInfo: RecreationResourceReservationInfoDto | null;
};

export const RecResourceReservationSection = (
  props: RecResourceReservationSectionProps,
) => {
  const params = Route.useParams();
  const recResourceId = params?.id;
  const { canEdit } = useAuthorizations();
  const { reservationInfo } = props;
  const reservationItems = [
    {
      key: 'email',
      label: 'Email',
      value: reservationInfo?.reservation_email,
    },
    {
      key: 'website',
      label: 'Website',
      value: reservationInfo?.reservation_website,
    },
    {
      key: 'phone-number',
      label: 'Phone Number',
      value: reservationInfo?.reservation_phone_number,
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
          <EditAction
            to={ROUTE_PATHS.REC_RESOURCE_RESERVATION_EDIT.replace(
              '$id',
              recResourceId,
            )}
            disabled={!canEdit}
          />
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
            <FieldItem label={item.label} value={item.value} />
          </Col>
        ))}
      </Row>
    </Stack>
  );
};
