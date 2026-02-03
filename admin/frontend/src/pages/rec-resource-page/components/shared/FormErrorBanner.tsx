import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMemo } from 'react';
import { Alert, Stack } from 'react-bootstrap';
import { FieldErrors, FieldValues } from 'react-hook-form';

/**
 * Generic utility to extract error messages.
 * T extends FieldValues ensures compatibility with react-hook-form.
 * React Hook Form flattens Zod errors for flat schemas, so we can iterate directly
 * @param errors - The form errors object
 * @param fieldLabelMap - Optional map of field names to human-readable labels
 */
function extractErrorMessages<T extends FieldValues>(
  errors: FieldErrors<T>,
  fieldLabelMap?: Partial<Record<keyof T, string>>,
): string[] {
  const messages: string[] = [];
  // Iterate over top-level error fields (schema is flat, no nesting)
  for (const [fieldName, error] of Object.entries(errors)) {
    if (error && error.message) {
      const fieldLabel = fieldLabelMap?.[fieldName as keyof T] || fieldName;
      messages.push(`${String(fieldLabel)}: ${error.message}`);
    }
  }

  return messages;
}

interface FormErrorBannerProps<T extends FieldValues> {
  errors: FieldErrors<T>;
  fieldLabelMap?: Partial<Record<keyof T, string>>;
  className?: string;
}

/**
 * Generic Form error banner component
 * Displays all form validation errors in a danger alert banner
 */
export const FormErrorBanner = <T extends FieldValues>({
  errors,
  fieldLabelMap,
  className,
}: FormErrorBannerProps<T>) => {
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
        <Alert.Heading className="h5 mb-0">
          <Stack direction="horizontal" gap={2}>
            <FontAwesomeIcon icon={faExclamationTriangle} aria-hidden="true" />
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
