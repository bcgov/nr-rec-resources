import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMemo } from 'react';
import { Alert, Stack } from 'react-bootstrap';
import { FieldErrors } from 'react-hook-form';
import { EditResourceFormData } from '../schemas';

/**
 * Utility function to extract all error messages from react-hook-form errors
 * React Hook Form flattens Zod errors for flat schemas, so we can iterate directly
 * @param errors - The form errors object
 * @param fieldLabelMap - Optional map of field names to human-readable labels
 */
function extractErrorMessages(
  errors: FieldErrors<EditResourceFormData>,
  fieldLabelMap?: Record<keyof EditResourceFormData, string>,
): string[] {
  const messages: string[] = [];

  // Iterate over top-level error fields (schema is flat, no nesting)
  for (const [fieldName, error] of Object.entries(errors)) {
    if (error) {
      const fieldLabel =
        fieldLabelMap?.[fieldName as keyof EditResourceFormData] || fieldName;
      messages.push(`${fieldLabel}: ${error.message}`);
    }
  }

  return messages;
}

interface FormErrorBannerProps {
  errors: FieldErrors<EditResourceFormData>;
  fieldLabelMap?: Record<keyof EditResourceFormData, string>;
  className?: string;
}

/**
 * Form error banner component for EditResourceForm
 * Displays all form validation errors in a danger alert banner
 */
export const FormErrorBanner = ({
  errors,
  fieldLabelMap,
  className,
}: FormErrorBannerProps) => {
  const errorMessages = useMemo(
    () => extractErrorMessages(errors, fieldLabelMap),
    [errors, fieldLabelMap],
  );

  if (errorMessages.length === 0) {
    return null;
  }

  return (
    <Alert variant="danger" className={className}>
      <div className="d-flex align-items-center gap-2 mb-2">
        <Alert.Heading className="h5">
          <Stack direction="horizontal" gap={2}>
            <FontAwesomeIcon icon={faExclamationTriangle} aria-label="Error" />
            <span>Please review and correct the following errors:</span>
          </Stack>
        </Alert.Heading>
      </div>
      <ul className="mb-0">
        {errorMessages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
    </Alert>
  );
};
