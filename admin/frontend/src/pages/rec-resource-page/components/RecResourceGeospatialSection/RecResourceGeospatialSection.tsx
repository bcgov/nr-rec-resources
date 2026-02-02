import { Col, Row, Stack } from 'react-bootstrap';
import { FeatureFlagGuard } from '@/contexts/feature-flags';
import { LinkWithQueryParams } from '@shared/components/link-with-query-params';
import { CopyButton } from '@shared/components/copy-button';
import { FieldItem } from '../shared/FieldItem';
import { RecResourceLocationSection } from '@/pages/rec-resource-page/components/RecResourceLocationSection';
import { Route } from '@/routes/rec-resource/$id/geospatial';
import { ROUTE_PATHS } from '@/constants/routes';
import { useRecResource } from '@/pages/rec-resource-page/hooks/useRecResource';
import { useGetRecreationResourceGeospatial } from '@/services/hooks/recreation-resource-admin/useGetRecreationResourceGeospatial';

export function RecResourceGeospatialSection() {
  const params = Route.useParams();
  const recResourceId = params?.id;
  const { recResource } = useRecResource();

  const { data: geospatialData } =
    useGetRecreationResourceGeospatial(recResourceId);

  const { latitude, longitude, utm_easting, utm_northing, utm_zone } =
    geospatialData || {};

  const hasGeometryData = utm_zone && utm_easting && utm_northing;

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
  ];

  return (
    <Stack direction="vertical" gap={4}>
      <div className="d-flex justify-content-between align-items-center">
        <h2>Geospatial</h2>

        <FeatureFlagGuard requiredFlags={['enable_full_features']}>
          {hasGeometryData && (
            <LinkWithQueryParams
              to={ROUTE_PATHS.REC_RESOURCE_GEOSPATIAL_EDIT.replace(
                '$id',
                recResourceId,
              )}
              className="btn btn-outline-primary"
            >
              Edit
            </LinkWithQueryParams>
          )}
        </FeatureFlagGuard>
      </div>

      <div className="rec-resource-geospatial-section__body">
        <Row className="gy-3">
          {geospatialItems.map((item) => (
            <Col key={item.key} xs={12} md={6} lg={4}>
              <FieldItem label={item.label} value={item.value} />
            </Col>
          ))}
        </Row>

        {recResource && (
          <div className="mt-4">
            <RecResourceLocationSection recResource={recResource} />
          </div>
        )}
      </div>
    </Stack>
  );
}
