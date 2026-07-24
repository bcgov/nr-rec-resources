import { Form } from 'react-bootstrap';
import { EditResourceFormData } from '@/pages/rec-resource-page/components/RecResourceOverviewSection/EditSection/schemas';

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
  maxLength,
  disabled = false,
}: {
  name: keyof EditResourceFormData;
  label: string;
  placeholder?: string;
  register: any;
  errors: any;
  as?: 'input' | 'textarea';
  rows?: number;
  required?: boolean;
  maxLength?: number;
  disabled?: boolean;
}) => (
  <Form.Group controlId={name}>
    <Form.Label>
      {label}
      {required && ' *'}
    </Form.Label>
    <Form.Control
      disabled={disabled}
      as={as}
      rows={rows}
      placeholder={placeholder}
      maxLength={maxLength}
      {...register(name)}
      isInvalid={!!errors[name]}
    />
    <Form.Control.Feedback type="invalid">
      {errors[name]?.message}
    </Form.Control.Feedback>
  </Form.Group>
);
