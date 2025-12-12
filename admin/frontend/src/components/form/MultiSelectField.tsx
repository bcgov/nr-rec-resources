import { RecreationResourceOptionUIModel } from '@/services';
import { memo } from 'react';
import { Form } from 'react-bootstrap';
import {
  Control,
  Controller,
  FieldErrors,
  FieldValues,
  Path,
} from 'react-hook-form';
import Select, { MultiValue } from 'react-select';

interface MultiSelectFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  label: string;
  options: RecreationResourceOptionUIModel[];
  placeholder: string;
  control: Control<TFieldValues>;
  errors: FieldErrors<TFieldValues>;
  disabled?: boolean;
}

/**
 * Reusable Multi-Select Field Component using react-select
 * Handles multi-select form field logic with proper React Hook Form integration
 * For simple flat lists of options (not grouped)
 */
function MultiSelectFieldComponent<TFieldValues extends FieldValues>({
  name,
  label,
  options,
  placeholder,
  control,
  errors,
  disabled = false,
}: MultiSelectFieldProps<TFieldValues>) {
  return (
    <Controller<TFieldValues>
      name={name}
      control={control}
      render={({ field: { onChange, value } }) => {
        // Convert value array (numbers) to string for comparison with option.id (string | null)
        const valueStrings = Array.isArray(value)
          ? value.map((v: unknown) => String(v))
          : [];
        const selectedOptions = options.filter(
          (opt) => opt.id !== null && valueStrings.includes(String(opt.id)),
        );

        return (
          <Form.Group controlId={name as string}>
            <Form.Label>{label}</Form.Label>
            <Select<RecreationResourceOptionUIModel, true>
              id={`${name as string}-select`}
              isMulti
              options={options}
              placeholder={placeholder}
              isDisabled={disabled}
              value={selectedOptions}
              onChange={(
                newValue: MultiValue<RecreationResourceOptionUIModel>,
              ) => {
                // Convert option.id (string | null) to number for activity_codes array
                onChange(
                  newValue
                    ?.map((opt) => (opt.id ? Number(opt.id) : null))
                    .filter((id): id is number => id !== null) || [],
                );
              }}
              className={
                (errors as Record<string, any>)[name as string]
                  ? 'is-invalid'
                  : ''
              }
              classNamePrefix="select"
              isSearchable={true}
              closeMenuOnSelect={false}
              getOptionLabel={(option) => option.label}
              getOptionValue={(option) => option.id || ''}
            />
            {(errors as Record<string, any>)[name as string] && (
              <Form.Control.Feedback type="invalid" className="d-block">
                {
                  (errors as Record<string, any>)[name as string]
                    ?.message as string
                }
              </Form.Control.Feedback>
            )}
          </Form.Group>
        );
      }}
    />
  );
}

export const MultiSelectField = memo(MultiSelectFieldComponent) as <
  TFieldValues extends FieldValues,
>(
  props: MultiSelectFieldProps<TFieldValues>,
) => React.ReactElement;
