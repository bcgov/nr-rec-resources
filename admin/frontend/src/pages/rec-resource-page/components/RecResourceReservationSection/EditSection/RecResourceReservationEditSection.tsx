import { TextField } from '@/components/form';
import { Button, Col, Form, Row, Stack } from 'react-bootstrap';
import { Controller, useWatch } from 'react-hook-form';
import {
  EDIT_RESERVATION_FIELD_LABEL_MAP,
  EMAIL_MAX_LENGTH,
} from './constants';
import { useEditReservationForm } from './hooks';
import { EditReservationFormData } from './schemas';
import { HasReservation } from '../components';
import { RecreationResourceReservationInfoDto } from '@/services';
import { useRecResourceReservation } from '@/pages/rec-resource-page/hooks/useRecResourceReservation';
import { ROUTE_PATHS } from '@/constants/routes';
import { Route } from '@/routes/rec-resource/$id/reservation/edit';
import { FormErrorBanner } from '../../shared/FormErrorBanner';
import { Link } from '@tanstack/react-router';

/**
 * Edit section for recreation resource overview
 * Allows editing of resource details including name, description, location, and access information
 */
export const RecResourceReservationEditSection = () => {
  const params = Route.useParams();
  const recResourceId = params?.id;
  const { reservationInfo = {} as RecreationResourceReservationInfoDto } =
    useRecResourceReservation(recResourceId);
  const checkRequireReservation =
    Boolean(reservationInfo?.reservation_website) ||
    Boolean(reservationInfo?.reservation_phone_number) ||
    Boolean(reservationInfo?.reservation_email);
  const initialReservationInfo = reservationInfo;

  const {
    handleSubmit,
    control,
    register,
    errors,
    isDirty,
    updateMutation,
    onSubmit,
    setValue,
  } = useEditReservationForm(recResourceId, reservationInfo);

  const reservationEmail = useWatch({
    control,
    name: 'reservation_email',
  });

  const reservationWebsite = useWatch({
    control,
    name: 'reservation_website',
  });

  const reservationPhone = useWatch({
    control,
    name: 'reservation_phone_number',
  });

  const hasReservation = useWatch({
    control,
    name: 'has_reservation',
  });

  const requireReservation =
    hasReservation ||
    (reservationEmail ?? '') !== '' ||
    (reservationWebsite ?? '') !== '' ||
    (reservationPhone ?? '') !== '';

  const clearFields = () => {
    setValue('has_reservation', false, {
      shouldDirty: true,
    });
    setValue('reservation_email', '', {
      shouldDirty: true,
    });
    setValue('reservation_website', '', {
      shouldDirty: true,
    });
    setValue('reservation_phone_number', '', {
      shouldDirty: true,
    });
  };

  const restoreFields = () => {
    setValue('has_reservation', true, {
      shouldDirty: true,
    });
    setValue('reservation_email', initialReservationInfo?.reservation_email, {
      shouldDirty: true,
    });
    setValue(
      'reservation_website',
      initialReservationInfo?.reservation_website,
      {
        shouldDirty: true,
      },
    );
    setValue(
      'reservation_phone_number',
      initialReservationInfo?.reservation_phone_number,
      {
        shouldDirty: true,
      },
    );
  };

  const handleRequireReservation = (
    next: boolean,
    onChange: (...event: any[]) => void,
  ) => {
    onChange(next);

    if (!next) {
      clearFields();
      return;
    }

    if (checkRequireReservation) {
      restoreFields();
    }
  };

  return (
    <Stack direction="vertical" gap={4}>
      <div className="d-flex justify-content-between align-items-center">
        <h2>Edit Reservation</h2>
        <Stack direction="horizontal" gap={2}>
          <Link
            to={ROUTE_PATHS.REC_RESOURCE_RESERVATION.replace(
              '$id',
              recResourceId,
            )}
            className="btn btn-outline-primary"
          >
            Cancel
          </Link>
          <Button
            variant="primary"
            onClick={handleSubmit(onSubmit as any)}
            disabled={!isDirty || updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </Stack>
      </div>

      <FormErrorBanner
        errors={errors}
        fieldLabelMap={EDIT_RESERVATION_FIELD_LABEL_MAP}
      />

      <Form onSubmit={handleSubmit(onSubmit as any)}>
        <Stack direction="vertical" gap={4}>
          <Row>
            <Col xs={12}>
              <Controller<EditReservationFormData>
                name="has_reservation"
                control={control}
                render={({ field }) => (
                  <HasReservation
                    isEditMode={true}
                    value={requireReservation}
                    onChange={(next) =>
                      handleRequireReservation(next, field.onChange)
                    }
                  />
                )}
              />
            </Col>
          </Row>

          <Row className="gy-3">
            <Col lg={12}>
              <TextField
                name="reservation_email"
                label={EDIT_RESERVATION_FIELD_LABEL_MAP.reservation_email}
                placeholder="Enter the email for the reservation info ..."
                register={register}
                errors={errors}
                maxLength={EMAIL_MAX_LENGTH}
              />
            </Col>
            <Col lg={12}>
              <TextField
                name="reservation_website"
                label={EDIT_RESERVATION_FIELD_LABEL_MAP.reservation_website}
                placeholder="Enter the website for the reservation info ..."
                register={register}
                errors={errors}
                maxLength={EMAIL_MAX_LENGTH}
              />
            </Col>
            <Col lg={12}>
              <TextField
                name="reservation_phone_number"
                label={
                  EDIT_RESERVATION_FIELD_LABEL_MAP.reservation_phone_number
                }
                placeholder="Enter the phone number for the reservation info ..."
                register={register}
                errors={errors}
                maxLength={EMAIL_MAX_LENGTH}
              />
            </Col>
          </Row>
        </Stack>
      </Form>
    </Stack>
  );
};
