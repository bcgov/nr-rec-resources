import { Col, Row } from 'react-bootstrap';
import { Link } from '@tanstack/react-router';
import { EditableGuard } from '@/components/auth';
import { CopyButton } from '@shared/components/copy-button';
import { ROUTE_PATHS } from '@/constants/routes';
import {
  GEOMETRY_NUMBER_FORMAT,
  SITE_TYPE_CODES,
  TRAIL_TYPE_CODES,
} from '@/constants/geospatial';
import type { RecreationResourceGeospatialDto } from '@/services/recreation-resource-admin';
import { FieldItem } from '../../shared/FieldItem';

interface Props {
  recResourceId: string;
  resourceTypeCode?: string | null;
  isArchived: boolean;
  geospatialData?: RecreationResourceGeospatialDto | null;
}

const formatNumber = (value?: number | null) =>
  value != null ? value.toLocaleString('en-CA', GEOMETRY_NUMBER_FORMAT) : null;

export function GeospatialFieldsCard({
  recResourceId,
  resourceTypeCode,
  isArchived,
  geospatialData,
}: Props) {
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
  const isTrail = TRAIL_TYPE_CODES.includes(resourceTypeCode ?? '');
  const isSite = SITE_TYPE_CODES.includes(resourceTypeCode ?? '');

  const items = [
    { key: 'utm-zone', label: 'UTM zone', value: utm_zone?.toString() },
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
            value: formatNumber(total_area_hectares),
          },
        ]
      : []),
    ...(isTrail
      ? [
          {
            key: 'total-length',
            label: 'Total length (km)',
            value: formatNumber(total_length_km),
          },
          {
            key: 'right-of-way',
            label: 'Right-of-way width (m)',
            value: formatNumber(right_of_way_m),
          },
        ]
      : []),
  ];

  return (
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
          {items.map((item) => (
            <Col key={item.key} xs={12} md={6} lg={4}>
              <FieldItem label={item.label} value={item.value} />
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
}
