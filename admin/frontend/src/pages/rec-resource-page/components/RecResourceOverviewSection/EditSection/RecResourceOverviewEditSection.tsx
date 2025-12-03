import { RecResourceOverviewLink } from '@/components/RecResourceOverviewLink';
import { DateInputField } from '@/components/date-input-field';
import { VisibleOnPublicSite } from '@/pages/rec-resource-page/components/RecResourceOverviewSection/components';
import { useRecResource } from '@/pages/rec-resource-page/hooks/useRecResource';
import { RecreationResourceDetailUIModel } from '@/services';
import { useMemo } from 'react';
import { Button, Col, Form, Row, Stack } from 'react-bootstrap';
import { Controller, useWatch } from 'react-hook-form';
import {
  FormErrorBanner,
  GroupedMultiSelectField,
  SelectField,
} from './components';
import { EDIT_RESOURCE_FIELD_LABEL_MAP } from './constants';
import { useEditResourceForm, useResourceOptions } from './hooks';
import { EditResourceFormData } from './schemas';

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
  } = useResourceOptions({
    currentDistrictCode: recResource.recreation_district?.district_code,
  });

  const { handleSubmit, control, errors, isDirty, updateMutation, onSubmit } =
    useEditResourceForm(recResource, districtOptions);

  // Watch the district_code field to check if selected option is archived
  const selectedDistrictCode = useWatch({
    control,
    name: 'district_code',
  });

  // Determine helper text based on whether an archived option is selected
  const districtHelperText = useMemo(() => {
    const selectedOption = districtOptions.find(
      (opt) => opt.id === selectedDistrictCode,
    );

    if (selectedOption?.is_archived) {
      return (
        <div className="bg-light p-2 rounded mt-1">
          <span className="bg-light text-danger">
            <strong>Note:</strong> The district currently assigned to this
            resource has been archived. Please select an active district from
            the list.
          </span>
        </div>
      );
    }

    return null;
  }, [districtOptions, selectedDistrictCode]);

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

      <FormErrorBanner
        errors={errors}
        fieldLabelMap={EDIT_RESOURCE_FIELD_LABEL_MAP}
      />

      <Form onSubmit={handleSubmit(onSubmit as any)}>
        <Stack direction="vertical" gap={4}>
          <Row>
            <Col xs={12}>
              <Controller
                name="display_on_public_site"
                control={control}
                render={({ field }) => (
                  <VisibleOnPublicSite
                    isEditMode={true}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </Col>
          </Row>
          <Row className="gy-3">
            {/* Status */}
            <Col xs={12} md={6}>
              <SelectField
                name="status_code"
                label={EDIT_RESOURCE_FIELD_LABEL_MAP.status_code}
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
                label={EDIT_RESOURCE_FIELD_LABEL_MAP.maintenance_standard_code}
                options={maintenanceOptions}
                placeholder="Search or select a standard..."
                control={control}
                errors={errors}
              />
            </Col>

            <Col xs={12} md={6}>
              <SelectField
                name="control_access_code"
                label={EDIT_RESOURCE_FIELD_LABEL_MAP.control_access_code}
                options={controlAccessCodeTypeOptions}
                placeholder="Search or select a control access type..."
                control={control}
                errors={errors}
              />
            </Col>

            <Col xs={12} md={6}>
              <SelectField
                name="district_code"
                label={EDIT_RESOURCE_FIELD_LABEL_MAP.district_code}
                options={districtOptions}
                placeholder="Search or select a recreation district..."
                control={control}
                errors={errors}
                helperText={districtHelperText}
              />
            </Col>

            <Col xs={12} md={6}>
              <SelectField
                name="risk_rating_code"
                label={EDIT_RESOURCE_FIELD_LABEL_MAP.risk_rating_code}
                options={riskRatingCodeTypeOptions}
                placeholder="Search or select a risk rating..."
                control={control}
                errors={errors}
              />
            </Col>

            <Col xs={12} md={6}>
              <DateInputField
                name="project_established_date"
                label={EDIT_RESOURCE_FIELD_LABEL_MAP.project_established_date}
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
                label={EDIT_RESOURCE_FIELD_LABEL_MAP.selected_access_options}
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
