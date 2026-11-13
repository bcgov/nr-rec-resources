import { MultiSelectField } from '@/components';
import { RecreationResourceOptionUIModel } from '@/services';
import type { Control, FieldErrors } from 'react-hook-form';
import { EditActivitiesFormData } from './schemas/editActivities';

export type RecResourceLowMobilityEditSectionProps = {
  control: Control<EditActivitiesFormData>;
  errors: FieldErrors<EditActivitiesFormData>;
  options: RecreationResourceOptionUIModel[];
  optionsLoading: boolean;
};

export const RecResourceLowMobilityEditSection = ({
  control,
  errors,
  options,
  optionsLoading,
}: RecResourceLowMobilityEditSectionProps) => {
  return (
    <MultiSelectField<EditActivitiesFormData>
      name="low_mobility_activity_codes"
      options={options}
      label="Low mobility access"
      hideLabel
      placeholder="Search and select low mobility access..."
      control={control}
      errors={errors}
      disabled={optionsLoading}
    />
  );
};
