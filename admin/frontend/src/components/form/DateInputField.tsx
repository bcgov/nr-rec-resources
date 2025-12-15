import { Form } from 'react-bootstrap';
import {
  Controller,
  FieldValues,
  Control,
  FieldErrors,
  Path,
  UseFormRegister,
} from 'react-hook-form';

export interface DateInputFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  label: string;
  placeholder?: string;
  control?: Control<TFieldValues>;
  register?: UseFormRegister<TFieldValues>;
  errors: FieldErrors<TFieldValues>;
  required?: boolean;
  min?: string;
  max?: string;
}

export const DateInputField = <TFieldValues extends FieldValues>({
  name,
  label,
  placeholder,
  control,
  register,
  errors,
  required = false,
  min,
  max,
}: DateInputFieldProps<TFieldValues>) => {
  if (control) {
    return (
      <Form.Group controlId={name}>
        <Form.Label>
          {label}
          {required && ' *'}
        </Form.Label>
        <Controller<TFieldValues>
          name={name}
          control={control}
          render={({ field }) => (
            <Form.Control
              {...field}
              type="date"
              min={min}
              max={max}
              placeholder={placeholder}
              isInvalid={!!errors[name]}
              value={field.value ?? ''}
            />
          )}
        />
        <Form.Control.Feedback type="invalid">
          {errors[name]?.message as string}
        </Form.Control.Feedback>
      </Form.Group>
    );
  }

  return (
    <Form.Group controlId={name}>
      <Form.Label>
        {label}
        {required && ' *'}
      </Form.Label>
      <Form.Control
        type="date"
        min={min}
        max={max}
        placeholder={placeholder}
        {...(register ? register(name) : {})}
        isInvalid={!!errors[name]}
      />
      <Form.Control.Feedback type="invalid">
        {errors[name]?.message as string}
      </Form.Control.Feedback>
    </Form.Group>
  );
};
