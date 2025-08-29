import {
  getKeycloakErrorMessage,
  isKeycloakError,
  isObjectWithMessage,
} from '@/errors';

/**
 * Custom error class for authentication-related errors.
 * Can wrap native errors, Keycloak errors, or plain messages.
 */
export class AuthenticationError extends Error {
  constructor(message?: string) {
    super(message || 'Authentication error');
    this.name = 'AuthenticationError';
  }

  /**
   * Factory method to parse various error shapes into an AuthenticationError.
   * Handles AuthenticationError, KeycloakError, native Error, string, and objects with a message.
   */
  static parse(err: unknown): AuthenticationError {
    if (err instanceof AuthenticationError) return err;

    // Keycloak error shape: { error: string, error_description?: string }
    if (isKeycloakError(err)) {
      return new AuthenticationError(getKeycloakErrorMessage(err));
    }

    if (err instanceof Error) {
      return new AuthenticationError(err.message);
    }

    if (typeof err === 'string') {
      return new AuthenticationError(err);
    }

    if (isObjectWithMessage(err)) {
      return new AuthenticationError((err as any).message);
    }

    return new AuthenticationError('Unknown authentication error');
  }

  getMessage(): string {
    return this.message;
  }
}
