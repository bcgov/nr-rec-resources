import { Col, Row, Stack } from 'react-bootstrap';
import { FeatureFlagGuard } from '@/contexts/feature-flags';
import { LinkWithQueryParams } from '@shared/components/link-with-query-params';
import { CopyButton } from '@shared/components/copy-button';
import { RecResourceOverviewItem } from '@/pages/rec-resource-page/components/RecResourceOverviewSection/components';
import { RecResourceLocationSection } from '@/pages/rec-resource-page/components/RecResourceLocationSection';
import { Route } from '@/routes/rec-resource/$id/geospatial';
import { RecreationResourceGeospatialDto } from '@/services/recreation-resource-admin';

export function RecResourceGeospatialSection() {
  const { geospatialData } = Route.useLoaderData() as {
    geospatialData?: RecreationResourceGeospatialDto;
  };
  const formatCoordinate = (
    value: number | null | undefined,
    decimals: number = 2,
  ): string | undefined => {
    if (!value) return undefined;
    return value.toFixed(decimals);
  };

  const latitude = formatCoordinate(geospatialData?.latitude, 6);
  const longitude = formatCoordinate(geospatialData?.longitude, 6);

  const geospatialItems = [
    {
      key: 'utm-zone',
      label: 'UTM zone',
      value: geospatialData?.utm_zone?.toString(),
    },
    {
      key: 'utm-easting',
      label: 'UTM easting',
      value: geospatialData?.utm_easting?.toString(),
    },
    {
      key: 'utm-northing',
      label: 'UTM northing',
      value: geospatialData?.utm_northing?.toString(),
    },
    {
      key: 'latitude',
      label: 'Latitude',
      value: latitude ? <CopyButton text={latitude} /> : undefined,
    },
    {
      key: 'longitude',
      label: 'Longitude',
      value: longitude ? <CopyButton text={longitude} /> : undefined,
    },
  ];

  return (
    <Stack direction="vertical" gap={4}>
      <div className="d-flex justify-content-between align-items-center">
        <h2>Geospatial</h2>

        <FeatureFlagGuard requiredFlags={['enable_full_features']}>
          <LinkWithQueryParams to="edit" className="btn btn-outline-primary">
            Edit
          </LinkWithQueryParams>
        </FeatureFlagGuard>
      </div>

      <div className="rec-resource-geospatial-section__body">
        <Row className="gy-3">
          {geospatialItems.map((item) => (
            <Col key={item.key} xs={12} md={6} lg={4}>
              <RecResourceOverviewItem label={item.label} value={item.value} />
            </Col>
          ))}
        </Row>

        {geospatialData && (
          <div style={{ marginTop: 32 }}>
            <RecResourceLocationSection recResource={geospatialData} />
          </div>
        )}
      </div>
    </Stack>
  );
}
