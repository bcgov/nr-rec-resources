import { useMemo } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { Button, Col, Form, Row, Stack } from 'react-bootstrap';
import { ROUTE_PATHS } from '@/constants/routes';
import { UTM_HELP } from '@/constants/geospatial';
import { Route } from '@/routes/rec-resource/$id/geospatial/edit';
import { RecResourceLocationSection } from '@/pages/rec-resource-page/components/RecResourceLocationSection';
import { useEditGeospatialForm } from '@/pages/rec-resource-page/components/RecResourceGeospatialSection/EditSection/hooks';
import { useRecResource } from '@/pages/rec-resource-page/hooks/useRecResource';
import { useGetRecreationResourceGeospatial } from '@/services/hooks/recreation-resource-admin/useGetRecreationResourceGeospatial';
import { Link } from '@tanstack/react-router';
import {
  utmToSitePointGeometry,
  utmToWgs84,
} from '@/pages/rec-resource-page/components/RecResourceGeospatialSection/EditSection/utils/validateUtmAgainstSpatialFeatures';
import { ExhibitASection } from '@/pages/rec-resource-page/components/RecResourceGeospatialSection/ExhibitASection/ExhibitASection';
import { HelpIcon } from '@/components/help-icon';

const onNumberChange = (onChange: (v?: number) => void) => {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    onChange(raw === '' ? undefined : Number(raw));
  };
};

/** Number of decimal places shown for the live lat/lon preview. */
const COORD_DECIMALS = 6;

export const RecResourceGeospatialEditSection = () => {
  const params = Route.useParams();
  const recResourceId = params?.id;

  const { recResource } = useRecResource();

  const { data: geospatialData } =
    useGetRecreationResourceGeospatial(recResourceId);

  const { handleSubmit, control, errors, isDirty, isSubmitting, onSubmit } =
    useEditGeospatialForm(geospatialData ?? undefined, recResourceId);

  // ── Live UTM preview ──────────────────────────────────────────────────────
  const [watchedZone, watchedEasting, watchedNorthing] = useWatch({
    control,
    name: ['utm_zone', 'utm_easting', 'utm_northing'],
  });

  /** Lat/lon derived from the current UTM field values, or null when inputs are incomplete/invalid. */
  const previewLatLon = useMemo(() => {
    if (
      watchedZone == null ||
      watchedEasting == null ||
      watchedNorthing == null
    )
      return null;
    return utmToWgs84(watchedZone, watchedEasting, watchedNorthing);
  }, [watchedZone, watchedEasting, watchedNorthing]);

  /** GeoJSON point string (EPSG:3005) for the live map pin preview. */
  const previewSitePointGeometry = useMemo(() => {
    if (
      watchedZone == null ||
      watchedEasting == null ||
      watchedNorthing == null
    )
      return (
        geospatialData?.site_point_geometry ?? recResource?.site_point_geometry
      );
    return (
      utmToSitePointGeometry(watchedZone, watchedEasting, watchedNorthing) ??
      geospatialData?.site_point_geometry ??
      recResource?.site_point_geometry
    );
  }, [
    watchedZone,
    watchedEasting,
    watchedNorthing,
    geospatialData?.site_point_geometry,
    recResource?.site_point_geometry,
  ]);

  /** recResource with the live preview geometry injected for the map. */
  const recResourceForMap = useMemo(() => {
    if (!recResource) return undefined;
    return {
      ...recResource,
      site_point_geometry: previewSitePointGeometry,
      spatial_feature_geometry:
        geospatialData?.spatial_feature_geometry ??
        recResource.spatial_feature_geometry,
    };
  }, [
    recResource,
    previewSitePointGeometry,
    geospatialData?.spatial_feature_geometry,
  ]);

  // Displayed lat/lon: live-calculated when a valid UTM is typed, otherwise fall back to saved values
  const displayLatitude =
    previewLatLon?.latitude?.toFixed(COORD_DECIMALS) ??
    geospatialData?.latitude?.toFixed(COORD_DECIMALS) ??
    '';
  const displayLongitude =
    previewLatLon?.longitude?.toFixed(COORD_DECIMALS) ??
    geospatialData?.longitude?.toFixed(COORD_DECIMALS) ??
    '';

  return (
    <Stack direction="vertical" gap={4}>
      <div className="d-flex justify-content-between align-items-center">
        <h2>Edit Geospatial</h2>
        <Stack direction="horizontal" gap={2}>
          <Link
            to={ROUTE_PATHS.REC_RESOURCE_GEOSPATIAL.replace(
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
            disabled={!isDirty || isSubmitting || !recResourceId}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </Stack>
      </div>

      {errors.root && (
        <div className="alert alert-danger" role="alert">
          <strong>Error: </strong>
          {errors.root.message}
        </div>
      )}

      {!errors.root && Object.keys(errors).length > 0 && (
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
              <Form.Label>
                UTM Zone <HelpIcon text={UTM_HELP.zone} id="utm-zone" />
              </Form.Label>
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
              <Form.Label>
                UTM Easting{' '}
                <HelpIcon text={UTM_HELP.easting} id="utm-easting" />
              </Form.Label>
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
              <Form.Label>
                UTM Northing{' '}
                <HelpIcon text={UTM_HELP.northing} id="utm-northing" />
              </Form.Label>
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

          {/* Lat/lon are read-only and update live as UTM values change */}
          <Col xs={12} md={6}>
            <Form.Group controlId="latitude">
              <Form.Label>
                Latitude{' '}
                <small className="text-secondary fw-normal">
                  (auto-calculated)
                </small>
              </Form.Label>
              <Form.Control type="text" value={displayLatitude} disabled />
              <Form.Text className="text-muted">
                Generated from UTM coordinates.
              </Form.Text>
            </Form.Group>
          </Col>

          <Col xs={12} md={6}>
            <Form.Group controlId="longitude">
              <Form.Label>
                Longitude{' '}
                <small className="text-secondary fw-normal">
                  (auto-calculated)
                </small>
              </Form.Label>
              <Form.Control type="text" value={displayLongitude} disabled />
              <Form.Text className="text-muted">
                Generated from UTM coordinates.
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>
      </Form>

      {/* Map updates in real-time as UTM values change */}
      {recResourceForMap && (
        <RecResourceLocationSection recResource={recResourceForMap} />
      )}

      {/* ── Exhibit A ── */}
      <div className="geospatial-section__card">
        <ExhibitASection recResourceId={recResourceId} />
      </div>
    </Stack>
  );
};
