import { RecreationResourceOptionUIModel } from '@/services';
import { ReactNode } from 'react';
import { Form } from 'react-bootstrap';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import Select, { SingleValue } from 'react-select';
import { EditResourceFormData } from '@/pages/rec-resource-page/components/RecResourceOverviewSection/EditSection/schemas';

/**
 * Reusable Select Field Component using react-select
 * Handles all select form field logic with proper React Hook Form integration
 */
export const SelectField = ({
  name,
  label,
  options,
  placeholder,
  control,
  errors,
  disabled = false,
  helperText,
}: {
  name: keyof EditResourceFormData;
  label: string;
  options: RecreationResourceOptionUIModel[];
  placeholder: string;
  control: Control<EditResourceFormData>;
  errors: FieldErrors<EditResourceFormData>;
  disabled?: boolean;
  helperText?: ReactNode;
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value } }) => {
        const selectedOption = options.find((opt) => opt.id === value) || null;

        return (
          <Form.Group controlId={name}>
            <Form.Label>{label}</Form.Label>
            <Select<RecreationResourceOptionUIModel>
              id={`${name}-select`}
              options={options}
              placeholder={placeholder}
              isDisabled={disabled}
              value={selectedOption}
              onChange={(
                newValue: SingleValue<RecreationResourceOptionUIModel>,
              ) => {
                onChange(newValue?.id);
              }}
              className={errors[name] ? 'is-invalid' : ''}
              classNamePrefix="select"
              isSearchable={true}
              getOptionLabel={(option) => option.label}
              getOptionValue={(option) => option.id || ''}
              isOptionDisabled={(option) => Boolean(option.disabled)}
            />
            <Form.Text muted>{helperText}</Form.Text>
            {errors[name] && (
              <Form.Control.Feedback type="invalid" className="d-block">
                {errors[name]?.message as string}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        );
      }}
    />
  );
};
