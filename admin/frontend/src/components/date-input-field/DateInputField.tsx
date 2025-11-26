import { Form } from 'react-bootstrap';
import { Controller } from 'react-hook-form';

export interface DateInputFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  control?: any;
  register?: any;
  errors: any;
  required?: boolean;
}

export const DateInputField = ({
  name,
  label,
  placeholder,
  control,
  register,
  errors,
  required = false,
}: DateInputFieldProps) => {
  const today = new Date().toISOString().split('T')[0];

  if (control) {
    return (
      <Form.Group controlId={name}>
        <Form.Label>
          {label}
          {required && ' *'}
        </Form.Label>
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Form.Control
              {...field}
              type="date"
              max={today}
              placeholder={placeholder}
              isInvalid={!!errors[name]}
              value={field.value ?? ''}
            />
          )}
        />
        <Form.Control.Feedback type="invalid">
          {errors[name]?.message}
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
        max={today}
        placeholder={placeholder}
        {...(register ? register(name) : {})}
        isInvalid={!!errors[name]}
      />
      <Form.Control.Feedback type="invalid">
        {errors[name]?.message}
      </Form.Control.Feedback>
    </Form.Group>
  );
};
