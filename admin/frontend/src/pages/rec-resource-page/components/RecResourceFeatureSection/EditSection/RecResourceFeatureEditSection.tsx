import type { Control, FieldErrors } from 'react-hook-form';
import { MultiSelectField } from '@/components';
import { RecreationResourceOptionUIModel } from '@/services';
import { EditFeaturesFormData } from './schemas/editFeatures';

export type RecResourceFeatureEditSectionProps = {
  control: Control<EditFeaturesFormData>;
  errors: FieldErrors<EditFeaturesFormData>;
  options: RecreationResourceOptionUIModel[];
  optionsLoading: boolean;
};

export const RecResourceFeatureEditSection = ({
  control,
  errors,
  options,
  optionsLoading,
}: RecResourceFeatureEditSectionProps) => {
  return (
    <MultiSelectField<EditFeaturesFormData>
      name="feature_codes"
      label="Features"
      hideLabel
      options={options}
      placeholder="Search and select features..."
      control={control}
      errors={errors}
      disabled={optionsLoading}
    />
  );
};
