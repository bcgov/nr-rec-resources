import { Controller } from 'react-hook-form';
import { Button, Col, Form, Row, Stack } from 'react-bootstrap';
import { ROUTE_PATHS } from '@/constants/routes';
import { LinkWithQueryParams } from '@shared/components/link-with-query-params';
import { Route } from '@/routes/rec-resource/$id/geospatial/edit';
import { RecResourceLocationSection } from '@/pages/rec-resource-page/components/RecResourceLocationSection';
import { useEditGeospatialForm } from '@/pages/rec-resource-page/components/RecResourceGeospatialSection/EditSection/hooks';
import { useRecResource } from '@/pages/rec-resource-page/hooks/useRecResource';
import { useGetRecreationResourceGeospatial } from '@/services/hooks/recreation-resource-admin/useGetRecreationResourceGeospatial';

const onNumberChange = (onChange: (v?: number) => void) => {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    onChange(raw === '' ? undefined : Number(raw));
  };
};

export const RecResourceGeospatialEditSection = () => {
  const params = Route.useParams();
  const recResourceId = params?.id;

  const { recResource } = useRecResource();

  const { data: geospatialData } =
    useGetRecreationResourceGeospatial(recResourceId);

  const { handleSubmit, control, errors, isDirty, isSubmitting, onSubmit } =
    useEditGeospatialForm(geospatialData ?? undefined, recResourceId);

  return (
    <Stack direction="vertical" gap={4}>
      <div className="d-flex justify-content-between align-items-center">
        <h2>Edit Geospatial</h2>
        <Stack direction="horizontal" gap={2}>
          <LinkWithQueryParams
            to={ROUTE_PATHS.REC_RESOURCE_GEOSPATIAL.replace(
              '$id',
              recResourceId,
            )}
            className="btn btn-outline-primary"
          >
            Cancel
          </LinkWithQueryParams>

          <Button
            variant="primary"
            onClick={handleSubmit(onSubmit as any)}
            disabled={!isDirty || isSubmitting || !recResourceId}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </Stack>
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="alert alert-danger">
          <strong>
            There are validation errors. Please review the form fields.
          </strong>
        </div>
      )}

      <Form onSubmit={handleSubmit(onSubmit as any)}>
        <Row className="gy-3">
          <Col xs={12} md={4}>
            <Form.Group controlId="utm_zone">
              <Form.Label>UTM Zone</Form.Label>
              <Controller
                name="utm_zone"
                control={control}
                render={({ field }) => (
                  <Form.Control
                    {...field}
                    type="number"
                    placeholder="e.g. 10"
                    value={field.value ?? ''}
                    onChange={onNumberChange(field.onChange)}
                    onBlur={field.onBlur}
                    isInvalid={!!errors.utm_zone}
                  />
                )}
              />
              <Form.Control.Feedback type="invalid">
                {errors.utm_zone?.message as any}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col xs={12} md={4}>
            <Form.Group controlId="utm_easting">
              <Form.Label>UTM Easting</Form.Label>
              <Controller
                name="utm_easting"
                control={control}
                render={({ field }) => (
                  <Form.Control
                    {...field}
                    type="number"
                    placeholder="e.g. 500000"
                    value={field.value ?? ''}
                    onChange={onNumberChange(field.onChange)}
                    onBlur={field.onBlur}
                    isInvalid={!!errors.utm_easting}
                  />
                )}
              />
              <Form.Control.Feedback type="invalid">
                {errors.utm_easting?.message as any}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col xs={12} md={4}>
            <Form.Group controlId="utm_northing">
              <Form.Label>UTM Northing</Form.Label>
              <Controller
                name="utm_northing"
                control={control}
                render={({ field }) => (
                  <Form.Control
                    {...field}
                    type="number"
                    placeholder="e.g. 5480000"
                    value={field.value ?? ''}
                    onChange={onNumberChange(field.onChange)}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    isInvalid={!!errors.utm_northing}
                  />
                )}
              />
              <Form.Control.Feedback type="invalid">
                {errors.utm_northing?.message as any}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group controlId="latitude">
              <Form.Label>Latitude</Form.Label>
              <Form.Control
                type="number"
                value={geospatialData?.latitude ?? ''}
                disabled
              />
            </Form.Group>
          </Col>

          <Col xs={12} md={6}>
            <Form.Group controlId="longitude">
              <Form.Label>Longitude</Form.Label>
              <Form.Control
                type="number"
                value={geospatialData?.longitude ?? ''}
                disabled
              />
            </Form.Group>
          </Col>
        </Row>
      </Form>
      {recResource && <RecResourceLocationSection recResource={recResource} />}
    </Stack>
  );
};
