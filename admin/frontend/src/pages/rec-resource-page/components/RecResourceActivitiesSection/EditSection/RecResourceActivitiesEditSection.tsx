import { MultiSelectField } from '@/components';
import { RecreationResourceOptionUIModel } from '@/services';
import type { Control, FieldErrors } from 'react-hook-form';
import { Col, Row } from 'react-bootstrap';
import { EditActivitiesFormData } from './schemas/editActivities';

/**
 * Edit section for recreation resource activities
 * Allows editing of activities using multi-select
 */
export type RecResourceActivitiesEditSectionProps = {
  control: Control<EditActivitiesFormData>;
  errors: FieldErrors<EditActivitiesFormData>;
  options: RecreationResourceOptionUIModel[];
  optionsLoading: boolean;
};

export const RecResourceActivitiesEditSection = ({
  control,
  errors,
  options,
  optionsLoading,
}: RecResourceActivitiesEditSectionProps) => {
  return (
    <Row className="gy-3">
      <Col xs={12}>
        <MultiSelectField<EditActivitiesFormData, number>
          name="activity_codes"
          options={options}
          label="Activities"
          placeholder="Search and select activities..."
          control={control}
          errors={errors}
          disabled={optionsLoading}
          parseId={(id) => Number(id)}
        />
      </Col>
    </Row>
  );
};
