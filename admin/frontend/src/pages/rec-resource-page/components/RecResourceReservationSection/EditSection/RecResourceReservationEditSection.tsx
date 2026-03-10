import { Button, Col, Form, Row, Stack } from 'react-bootstrap';
import { Controller, useWatch } from 'react-hook-form';
import { FormLabel } from '@/components/form';
import {
  EDIT_RESERVATION_FIELD_LABEL_MAP,
  getReservationContactConfig,
  RESERVATION_METHOD_LABEL_MAP,
  RESERVATION_METHOD_OPTIONS,
  ReservationMethod,
} from './constants';
import { useEditReservationForm } from './hooks';
import { EditReservationFormData } from './schemas';
import { HasReservation } from '@/pages/rec-resource-page/components/RecResourceReservationSection/components';
import { RecreationResourceReservationInfoDto } from '@/services';
import { useRecResourceReservation } from '@/pages/rec-resource-page/hooks/useRecResourceReservation';
import { ROUTE_PATHS } from '@/constants/routes';
import { Route } from '@/routes/rec-resource/$id/reservation/edit';
import { FormErrorBanner } from '@/pages/rec-resource-page/components/shared/FormErrorBanner';
import '@/pages/rec-resource-page/components/RecResourceReservationSection/RecResourceReservationSection.scss';
import { Link } from '@tanstack/react-router';

export const RecResourceReservationEditSection = () => {
  const params = Route.useParams();
  const recResourceId = params?.id;
  const { reservationInfo = {} as RecreationResourceReservationInfoDto } =
    useRecResourceReservation(recResourceId);

  const {
    handleSubmit,
    control,
    register,
    errors,
    isDirty,
    updateMutation,
    onSubmit,
    handleHasReservationChange,
    handleReservationMethodChange,
  } = useEditReservationForm(recResourceId, reservationInfo);

  const hasReservation = useWatch({
    control,
    name: 'has_reservation',
  });

  const reservationMethod = useWatch({
    control,
    name: 'reservation_method',
  });

  const reservationContactConfig =
    getReservationContactConfig(reservationMethod);

  return (
    <Stack direction="vertical" gap={4}>
      <div className="d-flex justify-content-between align-items-center">
        <h2 className="mb-0">Edit Reservations</h2>
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
        <div className="reservation-panel">
          <Stack direction="vertical" gap={4}>
            <Row>
              <Col xs={12}>
                <Controller<EditReservationFormData>
                  name="has_reservation"
                  control={control}
                  render={() => (
                    <HasReservation
                      value={Boolean(hasReservation)}
                      onChange={handleHasReservationChange}
                    />
                  )}
                />
              </Col>
            </Row>

            {hasReservation && (
              <Row className="gy-3">
                <Col lg={12}>
                  <Controller<EditReservationFormData>
                    name="reservation_method"
                    control={control}
                    render={() => (
                      <Form.Group controlId="reservation_method">
                        <FormLabel className="reservation-form-label" required>
                          {EDIT_RESERVATION_FIELD_LABEL_MAP.reservation_method}
                        </FormLabel>
                        <Form.Select
                          aria-label="Reservation method"
                          value={reservationMethod || ''}
                          onChange={(event) =>
                            handleReservationMethodChange(
                              event.target.value as ReservationMethod,
                            )
                          }
                          isInvalid={!!errors.reservation_method}
                        >
                          <option value="">Select a reservation method</option>
                          {RESERVATION_METHOD_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {errors.reservation_method?.message}
                        </Form.Control.Feedback>
                      </Form.Group>
                    )}
                  />
                </Col>
                {reservationMethod && (
                  <Col lg={12}>
                    <Form.Group controlId="reservation_contact">
                      <FormLabel className="reservation-form-label" required>
                        {EDIT_RESERVATION_FIELD_LABEL_MAP.reservation_contact}
                        {` (${RESERVATION_METHOD_LABEL_MAP[reservationMethod]})`}
                      </FormLabel>
                      <Form.Control
                        type={reservationContactConfig.type}
                        placeholder={reservationContactConfig.placeholder}
                        maxLength={reservationContactConfig.maxLength}
                        {...register('reservation_contact')}
                        isInvalid={!!errors.reservation_contact}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.reservation_contact?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                )}
              </Row>
            )}
          </Stack>
        </div>
      </Form>
    </Stack>
  );
};
