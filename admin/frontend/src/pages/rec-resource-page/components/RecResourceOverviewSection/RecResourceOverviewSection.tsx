import { ROUTE_PATHS } from '@/constants/routes';
import { EditableGuard } from '@/components/auth';
import { RecreationResourceDetailUIModel } from '@/services';
import { useNavigate } from '@tanstack/react-router';
import { Button, Col, Row, Stack } from 'react-bootstrap';
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
  const navigate = useNavigate();
  const { recResource } = props;
  const { isSuperAdmin, canEdit } = useAuthorizations();
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const isArchived = recResource.rec_status_code === 'AR';

  const overviewItems = [
    {
      key: 'closest-community',
      label: 'Closest community',
      value: recResource.closest_community,
    },
    {
      key: 'recreation-district',
      label: 'Recreation district',
      value: recResource.recreation_district_description,
    },
    {
      key: 'natural_resource_org',
      label: 'Natural resource district',
      value: recResource.natural_resource_org_unit_name,
    },

    {
      key: 'maintenance-type',
      label: 'Maintenance type',
      value: recResource.maintenance_standard_description,
    },
    {
      key: 'project-established-date',
      label: 'Project established date',
      value: recResource.project_established_date_readable_utc,
    },
    {
      key: 'controlled-access-type',
      label: 'Controlled access type',
      value: recResource.control_access_code_description,
    },
    {
      key: 'risk-rating',
      label: 'Risk rating',
      value: recResource.risk_rating_description,
    },
    {
      key: 'recreation-user-days-code',
      label: 'User Days',
      value: recResource.recreation_user_days_code?.description ?? '',
    },
    {
      key: 'licensee',
      label: 'Licensee',
      value: recResource.licensee,
    },
  ];

  return (
    <Stack direction="vertical" gap={4}>
      <div className="d-flex justify-content-between align-items-center">
        <h2>Overview</h2>
        <Stack direction="horizontal" gap={2}>
          {canEdit && (
            <EditableGuard isArchived={isArchived}>
              <Button
                variant="outline-primary"
                onClick={() =>
                  navigate({
                    to: ROUTE_PATHS.REC_RESOURCE_OVERVIEW_EDIT.replace(
                      '$id',
                      recResource.rec_resource_id,
                    ),
                  })
                }
              >
                Edit
              </Button>
            </EditableGuard>
          )}
          {isSuperAdmin && !isArchived && (
            <Button
              variant="outline-primary"
              onClick={() => setIsArchiveModalOpen(true)}
            >
              Archive
            </Button>
          )}
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
            label="Access type"
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
            label="Driving directions"
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
