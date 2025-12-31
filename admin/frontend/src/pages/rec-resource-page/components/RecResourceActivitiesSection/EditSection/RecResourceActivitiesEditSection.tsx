import { MultiSelectField } from '@/components';
import { RecreationResourceOptionUIModel } from '@/services';
import type { Control, FieldErrors } from 'react-hook-form';
import { EditActivitiesFormData } from './schemas/editActivities';

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
    <MultiSelectField<EditActivitiesFormData>
      name="activity_codes"
      options={options}
      label="Activities"
      hideLabel
      placeholder="Search and select activities..."
      control={control}
      errors={errors}
      disabled={optionsLoading}
    />
  );
};
