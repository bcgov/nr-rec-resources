import { Form } from 'react-bootstrap';
import { EditResourceFormData } from '../schemas';

/**
 * Reusable Text Field Component
 * Handles text input and textarea form fields with proper error handling
 */
export const TextField = ({
  name,
  label,
  placeholder,
  register,
  errors,
  as = 'input',
  rows,
  required = false,
}: {
  name: keyof EditResourceFormData;
  label: string;
  placeholder?: string;
  register: any;
  errors: any;
  as?: 'input' | 'textarea';
  rows?: number;
  required?: boolean;
}) => (
  <Form.Group controlId={name}>
    <Form.Label>
      {label}
      {required && ' *'}
    </Form.Label>
    <Form.Control
      as={as}
      rows={rows}
      placeholder={placeholder}
      {...register(name)}
      isInvalid={!!errors[name]}
    />
    <Form.Control.Feedback type="invalid">
      {errors[name]?.message}
    </Form.Control.Feedback>
  </Form.Group>
);
