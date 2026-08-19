import { Col, Row, Stack } from 'react-bootstrap';
import { EditableGuard } from '@/components/auth';
import { CopyButton } from '@shared/components/copy-button';
import { FieldItem } from '../shared/FieldItem';
import { RecResourceLocationSection } from '@/pages/rec-resource-page/components/RecResourceLocationSection';
import { Route } from '@/routes/rec-resource/$id/geospatial';
import { ROUTE_PATHS } from '@/constants/routes';
import { useRecResource } from '@/pages/rec-resource-page/hooks/useRecResource';
import { useGetRecreationResourceGeospatial } from '@/services/hooks/recreation-resource-admin/useGetRecreationResourceGeospatial';
import { Link } from '@tanstack/react-router';
import { ExhibitASection } from './ExhibitASection/ExhibitASection';
import { IMAP_URL } from '@/constants/urls';
import { buildImapUrlFromLatLng, buildImapUrlFromUtm } from '@/utils/imap';
import './RecResourceGeospatialSection.scss';

const geometryNumberFormat: Intl.NumberFormatOptions = {
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
};

export function RecResourceGeospatialSection() {
  const params = Route.useParams();
  const recResourceId = params?.id;
  const { recResource } = useRecResource();
  const isArchived = recResource?.rec_status_code === 'AR';

  const { data: geospatialData } =
    useGetRecreationResourceGeospatial(recResourceId);

  const {
    latitude,
    longitude,
    utm_easting,
    utm_northing,
    utm_zone,
    total_length_km,
    total_area_hectares,
    right_of_way_m,
  } = geospatialData || {};

  const hasGeometryData = utm_zone && utm_easting && utm_northing;

  const SITE_TYPE_CODES = ['IF', 'RR', 'SIT', 'RTR', 'TRB'];
  const TRAIL_TYPE_CODES = ['TBL', 'IFT', 'RTE'];

  const isTrail = TRAIL_TYPE_CODES.includes(
    recResource?.rec_resource_type_code ?? '',
  );
  const isSite = SITE_TYPE_CODES.includes(
    recResource?.rec_resource_type_code ?? '',
  );

  const geospatialItems = [
    {
      key: 'utm-zone',
      label: 'UTM zone',
      value: utm_zone?.toString(),
    },
    {
      key: 'utm-easting',
      label: 'UTM easting',
      value: utm_easting?.toString(),
    },
    {
      key: 'utm-northing',
      label: 'UTM northing',
      value: utm_northing?.toString(),
    },
    {
      key: 'latitude',
      label: 'Latitude',
      value: latitude ? <CopyButton text={String(latitude)} /> : undefined,
    },
    {
      key: 'longitude',
      label: 'Longitude',
      value: longitude ? <CopyButton text={String(longitude)} /> : undefined,
    },
    ...(isSite
      ? [
          {
            key: 'total-area',
            label: 'Total area (ha)',
            value:
              total_area_hectares != null
                ? `${total_area_hectares.toLocaleString('en-CA', geometryNumberFormat)}`
                : null,
          },
        ]
      : []),
    ...(isTrail
      ? [
          {
            key: 'total-length',
            label: 'Total length (km)',
            value:
              total_length_km != null
                ? `${total_length_km.toLocaleString('en-CA', geometryNumberFormat)}`
                : null,
          },
          {
            key: 'right-of-way',
            label: 'Right-of-way width (m)',
            value:
              right_of_way_m != null
                ? `${right_of_way_m.toLocaleString('en-CA', geometryNumberFormat)}`
                : null,
          },
        ]
      : []),
  ];

  const recResourceWithGeometry = recResource
    ? {
        ...recResource,
        site_point_geometry:
          geospatialData?.site_point_geometry ??
          recResource.site_point_geometry,
        spatial_feature_geometry:
          geospatialData?.spatial_feature_geometry ??
          recResource.spatial_feature_geometry,
      }
    : undefined;

  const imapUrl =
    latitude != null && longitude != null
      ? buildImapUrlFromLatLng(latitude, longitude)
      : utm_zone != null && utm_easting != null && utm_northing != null
        ? buildImapUrlFromUtm(utm_easting, utm_northing, utm_zone)
        : IMAP_URL;

  return (
    <Stack direction="vertical" gap={4}>
      {/* ── Geospatial fields card ── */}
      <div className="geospatial-section__card">
        <div className="geospatial-section__card-header d-flex justify-content-between align-items-center">
          <h2 className="geospatial-section__card-title">Geospatial</h2>
          <EditableGuard isArchived={isArchived}>
            {hasGeometryData && (
              <Link
                to={ROUTE_PATHS.REC_RESOURCE_GEOSPATIAL_EDIT.replace(
                  '$id',
                  recResourceId,
                )}
                className="btn btn-outline-primary btn-sm"
              >
                Edit
              </Link>
            )}
          </EditableGuard>
        </div>

        <div className="geospatial-section__card-body">
          <Row className="gy-3">
            {geospatialItems.map((item) => (
              <Col key={item.key} xs={12} md={6} lg={4}>
                <FieldItem label={item.label} value={item.value} />
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* ── Map + action buttons ── */}
      {recResourceWithGeometry && (
        <RecResourceLocationSection
          recResource={recResourceWithGeometry}
          showHeading={false}
          imapUrl={imapUrl}
        />
      )}

      {/* ── Exhibit A ── */}
      <div className="geospatial-section__card">
        <ExhibitASection recResourceId={recResourceId} />
      </div>
    </Stack>
  );
}
