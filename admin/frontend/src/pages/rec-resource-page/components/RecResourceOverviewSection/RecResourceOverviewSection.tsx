import { ROUTE_PATHS } from '@/constants/routes';
import { EditableGuard } from '@/components/auth';
import { RecreationResourceDetailUIModel } from '@/services';
import { Link } from '@tanstack/react-router';
import { Col, Dropdown, Row, Stack } from 'react-bootstrap';
import { RecResourceEstablishmentOrderSection } from '../RecResourceEstablishmentOrderSection';
import { RecResourceLocationSection } from '../RecResourceLocationSection';
import { RecreationResourceAccessRow, VisibleOnPublicSite } from './components';
import { FieldItem } from '../shared/FieldItem';
import { useState } from 'react';
import { RecResourceArchiveModal } from './RecResourceArchiveModal';
import { useAuthorizations } from '@/hooks/useAuthorizations';

type RecResourceOverviewSectionProps = {
  recResource: RecreationResourceDetailUIModel;
};

export const RecResourceOverviewSection = (
  props: RecResourceOverviewSectionProps,
) => {
  const { recResource } = props;
  const { isSuperAdmin } = useAuthorizations();
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const isArchived = recResource.rec_status_code === 'AR';

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
      key: 'natural_resource_org',
      label: 'Natural Resource District',
      value: recResource.natural_resource_org_unit_name,
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
      key: 'controlled-access-type',
      label: 'Controlled Access Type',
      value: recResource.control_access_code_description,
    },
    {
      key: 'risk-rating',
      label: 'Risk Rating',
      value: recResource.risk_rating_description,
    },
  ];

  return (
    <Stack direction="vertical" gap={4}>
      <div className="d-flex justify-content-between align-items-center">
        <h2>Overview</h2>
        <Stack direction="horizontal" gap={2}>
          <EditableGuard isArchived={isArchived}>
            <Link
              to={ROUTE_PATHS.REC_RESOURCE_OVERVIEW_EDIT.replace(
                '$id',
                recResource.rec_resource_id,
              )}
              className="btn btn-outline-primary"
            >
              Edit
            </Link>
          </EditableGuard>
          <Dropdown>
            <Dropdown.Toggle variant="secondary" id="overview-actions-dropdown">
              Actions
            </Dropdown.Toggle>
            <Dropdown.Menu align="end">
              {isSuperAdmin && (
                <Dropdown.Item
                  onClick={() => setIsArchiveModalOpen(true)}
                  disabled={isArchived}
                >
                  Archive
                </Dropdown.Item>
              )}
            </Dropdown.Menu>
          </Dropdown>
        </Stack>
      </div>

      <Row>
        <Col xs={12}>
          <VisibleOnPublicSite
            value={recResource.display_on_public_site ?? false}
          />
        </Col>
      </Row>

      <Row className="gy-3">
        {overviewItems.map((item) => (
          <Col key={item.key} xs={12} md={6} lg={4}>
            <FieldItem label={item.label} value={item.value} />
          </Col>
        ))}
      </Row>

      <Row>
        <Col xs={12}>
          <FieldItem
            label="Access Type"
            value={<RecreationResourceAccessRow recResource={recResource} />}
          />
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <FieldItem
            label="Description"
            value={recResource.description}
            isHtml
          />
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <FieldItem
            label="Driving Directions"
            value={recResource.driving_directions}
            isHtml
          />
        </Col>
      </Row>

      <RecResourceEstablishmentOrderSection
        recResourceId={recResource.rec_resource_id}
        isArchived={isArchived}
      />

      {recResource && <RecResourceLocationSection recResource={recResource} />}
      <RecResourceArchiveModal
        show={isArchiveModalOpen}
        recResourceId={recResource.rec_resource_id}
        resourceName={recResource.name}
        onCancel={() => setIsArchiveModalOpen(false)}
      />
    </Stack>
  );
};
