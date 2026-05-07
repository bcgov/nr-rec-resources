import { MultiSelectField } from '@/components';
import { RecreationResourceOptionUIModel } from '@/services';
import type { Control, FieldErrors } from 'react-hook-form';
import { EditActivitiesFormData } from './schemas/editActivities';

export type RecResourceAdaptiveActivitiesEditSectionProps = {
  control: Control<EditActivitiesFormData>;
  errors: FieldErrors<EditActivitiesFormData>;
  options: RecreationResourceOptionUIModel[];
  optionsLoading: boolean;
};

export const RecResourceAdaptiveActivitiesEditSection = ({
  control,
  errors,
  options,
  optionsLoading,
}: RecResourceAdaptiveActivitiesEditSectionProps) => {
  return (
    <MultiSelectField<EditActivitiesFormData>
      name="adaptive_activity_codes"
      options={options}
      label="Accessible activities"
      hideLabel
      placeholder="Search and select accessible activities..."
      control={control}
      errors={errors}
      disabled={optionsLoading}
    />
  );
};
