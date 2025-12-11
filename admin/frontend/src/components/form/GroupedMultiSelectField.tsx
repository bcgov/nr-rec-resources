import { Form } from 'react-bootstrap';
import {
  Control,
  Controller,
  FieldErrors,
  FieldValues,
  Path,
} from 'react-hook-form';
import Select from 'react-select';

export interface GroupedOption {
  label: string;
  value: string;
  group: string;
  groupLabel: string;
}

export interface GroupedOptions {
  label: string;
  options: GroupedOption[];
}

interface GroupedMultiSelectFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  label: string;
  options: GroupedOptions[];
  placeholder: string;
  control: Control<TFieldValues>;
  errors: FieldErrors<TFieldValues>;
  disabled?: boolean;
  helperText?: string;
}

/**
 * Grouped Multi-Select Typeahead Field Component
 * Handles multi-select functionality with grouped options (access codes with sub-access codes)
 */
export function GroupedMultiSelectField<TFieldValues extends FieldValues>({
  name,
  label,
  options,
  placeholder,
  control,
  errors,
  disabled = false,
  helperText,
}: GroupedMultiSelectFieldProps<TFieldValues>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange: formOnChange } }) => {
        return (
          <Form.Group controlId={name as string}>
            <Form.Label>{label}</Form.Label>
            <Select<GroupedOption, true>
              id={`${name as string}-select`}
              isMulti
              options={options}
              placeholder={placeholder}
              isDisabled={disabled}
              value={value}
              onChange={formOnChange}
              className={`${(errors as Record<string, any>)[name as string] ? 'is-invalid' : ''}`}
              classNamePrefix="select"
              closeMenuOnSelect={false}
              getOptionValue={(option) => option.value}
              getOptionLabel={(option) => option.label}
              noOptionsMessage={() => 'No options available'}
            />
            {helperText && <Form.Text muted>{helperText}</Form.Text>}
            {(errors as Record<string, any>)[name as string] && (
              <Form.Control.Feedback type="invalid">
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
