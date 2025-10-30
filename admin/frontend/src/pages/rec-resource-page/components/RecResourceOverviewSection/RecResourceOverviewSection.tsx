import { FeatureFlagGuard } from '@/contexts/feature-flags';
import { RecreationResourceDetailUIModel } from '@/services';
import { LinkWithQueryParams } from '@shared/components/link-with-query-params';
import { Col, Row, Stack } from 'react-bootstrap';
import { RecResourceActivitySection } from '../RecResourceActivitySection';
import { RecResourceEstablishmentOrderSection } from '../RecResourceEstablishmentOrderSection';
import { RecResourceLocationSection } from '../RecResourceLocationSection';
import {
  RecreationResourceAccessRow,
  RecResourceOverviewItem,
} from './components';

type RecResourceOverviewSectionProps = {
  recResource: RecreationResourceDetailUIModel;
};

export const RecResourceOverviewSection = (
  props: RecResourceOverviewSectionProps,
) => {
  const { recResource } = props;

  const overviewItems = [
    {
      key: 'closest-community',
      label: 'Closest Community',
      value: recResource.closest_community,
    },
    {
      key: 'recreation-district',
      label: 'Recreation District',
      value: recResource.recreation_district_description,
    },
    {
      key: 'maintenance-type',
      label: 'Maintenance Type',
      value: recResource.maintenance_standard_description,
    },
    {
      key: 'project-established-date',
      label: 'Project Established Date',
      value: recResource.project_established_date_readable_utc,
    },
    {
      key: 'controlled-access-code',
      label: 'Controlled Access Code',
      value: recResource.control_access_code_description,
    },
    {
      key: 'risk-rating',
      label: 'Risk Rating',
      value: recResource.risk_rating_description ?? '--',
    },
  ];

  return (
    <Stack direction="vertical" gap={4}>
      <div className="d-flex justify-content-between align-items-center">
        <h2>Overview</h2>

        <FeatureFlagGuard requiredFlags={['enable_full_features']}>
          <LinkWithQueryParams to="edit" className="btn btn-outline-primary">
            Edit
          </LinkWithQueryParams>
        </FeatureFlagGuard>
      </div>

      <Row>
        <Col xs={12}>
          <RecResourceOverviewItem
            label="Description"
            value={recResource.description}
            isHtml
          />
        </Col>
      </Row>

      <Row className="gy-3">
        {overviewItems.map((item) => (
          <Col key={item.key} xs={12} md={6} lg={4}>
            <RecResourceOverviewItem label={item.label} value={item.value} />
          </Col>
        ))}
      </Row>

      <Row>
        <Col xs={12}>
          <RecResourceOverviewItem
            label="Access Type"
            value={<RecreationResourceAccessRow recResource={recResource} />}
          />
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <RecResourceOverviewItem
            label="Driving Directions"
            value={recResource.driving_directions}
            isHtml
          />
        </Col>
      </Row>

      <RecResourceEstablishmentOrderSection
        recResourceId={recResource.rec_resource_id}
      />

      {recResource && <RecResourceLocationSection recResource={recResource} />}

      <RecResourceActivitySection
        recreationActivities={recResource.recreation_activity}
      />
    </Stack>
  );
};
