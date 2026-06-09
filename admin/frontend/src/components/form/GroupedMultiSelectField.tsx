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

const flattenOptions = (grouped: GroupedOptions[]): GroupedOption[] =>
  grouped.flatMap((g) => g.options);

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
  const allOptions = flattenOptions(options);
  const errorMessage = (errors as Record<string, any>)[name as string]
    ?.message as string | undefined;
  const hasError = Boolean(errorMessage);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange: formOnChange } }) => {
        if (isMulti) {
          // value is string[] in the form, hydrate to GroupedOption[]
          const selectedOptions: GroupedOption[] = Array.isArray(value)
            ? allOptions.filter((o) => (value as string[]).includes(o.value))
            : [];

          return (
            <Form.Group controlId={name as string}>
              <Form.Label>{label}</Form.Label>
              <Select<GroupedOption, true>
                id={`${name as string}-select`}
                isMulti
                options={options}
                placeholder={placeholder}
                isDisabled={disabled}
                value={selectedOptions}
                onChange={(selected) =>
                  formOnChange(selected ? selected.map((o) => o.value) : [])
                }
                className={hasError ? 'is-invalid' : ''}
                classNamePrefix="select"
                closeMenuOnSelect={false}
                getOptionValue={(option) => option.value}
                getOptionLabel={(option) => option.label}
                noOptionsMessage={() => 'No options available'}
              />
              {helperText && <Form.Text muted>{helperText}</Form.Text>}
              {hasError && (
                <Form.Control.Feedback type="invalid">
                  {errorMessage}
                </Form.Control.Feedback>
              )}
            </Form.Group>
          );
        }

        // Single select: value is a string in the form, hydrate to GroupedOption | null
        const selectedOption: GroupedOption | null =
          typeof value === 'string'
            ? (allOptions.find((o) => o.value === value) ?? null)
            : null;

        return (
          <Form.Group controlId={name as string}>
            <Form.Label>{label}</Form.Label>
            <Select<GroupedOption, false>
              id={`${name as string}-select`}
              isMulti={false}
              options={options}
              placeholder={placeholder}
              isDisabled={disabled}
              value={selectedOption}
              onChange={(selected) =>
                formOnChange(selected ? selected.value : '')
              }
              className={hasError ? 'is-invalid' : ''}
              classNamePrefix="select"
              closeMenuOnSelect
              getOptionValue={(option) => option.value}
              getOptionLabel={(option) => option.label}
              noOptionsMessage={() => 'No options available'}
            />
            {helperText && <Form.Text muted>{helperText}</Form.Text>}
            {hasError && (
              <Form.Control.Feedback type="invalid">
                {errorMessage}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        );
      }}
    />
  );
}
