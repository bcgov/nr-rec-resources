/**
 * Checks if the provided value is a valid Keycloak error.\
 * @returns True if the error has valid Keycloak error properties.
 */
export function isKeycloakError(err: unknown): err is Keycloak.KeycloakError {
  return (
    !!err &&
    typeof err === 'object' &&
    'error' in err &&
    'error_description' in err &&
    typeof (err as any).error === 'string' &&
    typeof (err as any).error_description === 'string'
  );
}

/**
 * Extracts and returns a human-readable message from a Keycloak error.
 * @returns The error description message if available, otherwise a default string.
 */
export function getKeycloakErrorMessage(err: Keycloak.KeycloakError): string {
  if (err.error_description.trim()) {
    return err.error_description.trim();
  }
  if (err.error.trim()) {
    return err.error.trim();
  }
  return 'Keycloak error';
}

/**
 * Determines if the provided value is an object containing a message property.
 * @returns True if the error is an object with a string message property.
 */
export function isObjectWithMessage(err: unknown): err is { message: string } {
  return (
    !!err &&
    typeof err === 'object' &&
    'message' in err &&
    typeof (err as any).message === 'string'
  );
}
