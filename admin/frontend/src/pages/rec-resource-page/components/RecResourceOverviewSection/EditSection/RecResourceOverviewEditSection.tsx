import { RecResourceOverviewLink } from '@/components/RecResourceOverviewLink';
import { DateInputField } from '@/components/date-input-field';
import { EditResourceFormData } from '@/pages/rec-resource-page/components/RecResourceOverviewSection/EditSection/schemas';
import { useRecResource } from '@/pages/rec-resource-page/hooks/useRecResource';
import { RecreationResourceDetailUIModel } from '@/services';
import { Button, Col, Form, Row, Stack } from 'react-bootstrap';
import { GroupedMultiSelectField, SelectField } from './components';
import { useEditResourceForm, useResourceOptions } from './hooks';

/**
 * Edit section for recreation resource overview
 * Allows editing of resource details including name, description, location, and access information
 */
export const RecResourceOverviewEditSection = () => {
  const { recResource = {} as RecreationResourceDetailUIModel } =
    useRecResource();

  // Use custom hooks for data and form logic
  const {
    maintenanceOptions,
    controlAccessCodeTypeOptions,
    riskRatingCodeTypeOptions,
    recreationStatusOptions,
    groupedAccessOptions,
    districtOptions,
  } = useResourceOptions();

  const { handleSubmit, control, errors, isDirty, updateMutation, onSubmit } =
    useEditResourceForm(recResource);

  return (
    <Stack direction="vertical" gap={4}>
      <div className="d-flex justify-content-between align-items-center">
        <h2>Edit Overview</h2>
        <Stack direction="horizontal" gap={2}>
          <RecResourceOverviewLink
            rec_resource_id={recResource.rec_resource_id}
          >
            <Button variant="outline-primary">Cancel</Button>
          </RecResourceOverviewLink>
          <Button
            variant="primary"
            onClick={handleSubmit(onSubmit as any)}
            disabled={!isDirty || updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </Stack>
      </div>

      <Form onSubmit={handleSubmit(onSubmit as any)}>
        <Stack direction="vertical" gap={4}>
          <Row className="gy-3">
            {/* Status */}
            <Col xs={12} md={6}>
              <SelectField
                name="status_code"
                label="Status"
                options={recreationStatusOptions}
                placeholder="Search or select a status..."
                control={control}
                errors={errors}
              />
            </Col>

            {/* Maintenance Standard & Control Access */}
            <Col xs={12} md={6}>
              <SelectField
                name="maintenance_standard_code"
                label="Maintenance Standard"
                options={maintenanceOptions}
                placeholder="Search or select a standard..."
                control={control}
                errors={errors}
              />
            </Col>

            <Col xs={12} md={6}>
              <SelectField
                name="control_access_code"
                label="Controlled Access Type"
                options={controlAccessCodeTypeOptions}
                placeholder="Search or select a control access type..."
                control={control}
                errors={errors}
              />
            </Col>

            <Col xs={12} md={6}>
              <SelectField
                name="district_code"
                label="Recreation District"
                options={districtOptions}
                placeholder="Search or select a recreation district..."
                control={control}
                errors={errors}
              />
            </Col>

            <Col xs={12} md={6}>
              <SelectField
                name="risk_rating_code"
                label="Risk Rating"
                options={riskRatingCodeTypeOptions}
                placeholder="Search or select a risk rating..."
                control={control}
                errors={errors}
              />
            </Col>

            <Col xs={12} md={6}>
              <DateInputField
                name="project_established_date"
                label="Project Established Date"
                control={control}
                errors={errors}
              />
            </Col>
          </Row>

          <Row className="gy-3">
            {/* Grouped Access Codes with Sub-Access Codes */}
            <Col xs={12}>
              <GroupedMultiSelectField<EditResourceFormData>
                name="selected_access_options"
                label="Access and Sub-Access"
                options={groupedAccessOptions}
                placeholder="Search and select access types and their specific sub-options..."
                control={control}
                errors={errors}
                helperText="Access types are grouped with their available sub-options below them."
              />
            </Col>
          </Row>
        </Stack>
      </Form>
    </Stack>
  );
};
