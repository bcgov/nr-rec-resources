import { formatRecreationAccess } from '@/pages/rec-resource-page/components/RecResourceOverviewSection/helpers';
import { RecreationResourceDetailUIModel } from '@/services';
import { Col, Row, Stack } from 'react-bootstrap';
import { RecResourceOverviewItem } from './RecResourceOverviewItem';
import { RecResourceActivitySection } from '../RecResourceActivitySection';
import { RecResourceLocationSection } from '../RecResourceLocationSection';

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
      key: 'access-type',
      label: 'Access Type',
      value: formatRecreationAccess(recResource.recreation_access),
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
  ];

  return (
    <Stack direction="vertical" gap={4}>
      <h2>Overview</h2>
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
            label="Driving Directions"
            value={recResource.driving_directions}
            isHtml
          />
        </Col>
      </Row>

      {recResource && <RecResourceLocationSection recResource={recResource} />}

      <RecResourceActivitySection
        recreationActivities={recResource.recreation_activity}
      />
    </Stack>
  );
};
