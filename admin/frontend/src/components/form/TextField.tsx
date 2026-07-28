import { Form } from 'react-bootstrap';
import { EditResourceFormData } from '@/pages/rec-resource-page/components/RecResourceOverviewSection/EditSection/schemas';
import { HelpIcon } from '@/components/help-icon';

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
  helpText,
  helperText,
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
  helpText?: string;
  helperText?: string;
}) => (
  <Form.Group controlId={name}>
    <Form.Label>
      {label}
      {required && ' *'}
      {helpText && <HelpIcon id={`${name}-help`} text={helpText} />}
    </Form.Label>
    <Form.Control
      as={as}
      rows={rows}
      placeholder={placeholder}
      maxLength={maxLength}
      {...register(name)}
      isInvalid={!!errors[name]}
    />
    {helperText && <Form.Text muted>{helperText}</Form.Text>}
    <Form.Control.Feedback type="invalid">
      {errors[name]?.message}
    </Form.Control.Feedback>
  </Form.Group>
);
