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

interface BaseProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  label: string;
  options: GroupedOptions[];
  placeholder: string;
  control: Control<TFieldValues>;
  errors: FieldErrors<TFieldValues>;
  disabled?: boolean;
  helperText?: string;
}

interface SingleSelectProps<TFieldValues extends FieldValues>
  extends BaseProps<TFieldValues> {
  isMulti?: false;
}

interface MultiSelectProps<TFieldValues extends FieldValues>
  extends BaseProps<TFieldValues> {
  isMulti: true;
}

type GroupedSelectFieldProps<TFieldValues extends FieldValues> =
  | SingleSelectProps<TFieldValues>
  | MultiSelectProps<TFieldValues>;

export function GroupedMultiSelectField<TFieldValues extends FieldValues>({
  name,
  label,
  options,
  placeholder,
  control,
  errors,
  disabled = false,
  helperText,
  isMulti = true,
}: GroupedSelectFieldProps<TFieldValues>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange: formOnChange } }) => (
        <Form.Group controlId={name as string}>
          <Form.Label>{label}</Form.Label>
          {isMulti ? (
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
          ) : (
            <Select<GroupedOption, false>
              id={`${name as string}-select`}
              isMulti={false}
              options={options}
              placeholder={placeholder}
              isDisabled={disabled}
              value={value}
              onChange={formOnChange}
              className={`${(errors as Record<string, any>)[name as string] ? 'is-invalid' : ''}`}
              classNamePrefix="select"
              closeMenuOnSelect
              getOptionValue={(option) => option.value}
              getOptionLabel={(option) => option.label}
              noOptionsMessage={() => 'No options available'}
            />
          )}
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
      )}
    />
  );
}
