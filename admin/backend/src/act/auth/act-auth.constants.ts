/**
 * Constants for the Act-specific authentication wiring.
 *
 * Strategy name keys live in the central {@link AUTH_STRATEGY} constant
 * (see `src/auth/auth.constants.ts`) so guards and decorators can resolve
 * them without depending on this module.
 */

export const ACT_AUTH_LOG_MESSAGES = {
  STRATEGY_INITIALIZED:
    'Act Keycloak authentication strategy initialized successfully',
  MISSING_SERVICE_ACCOUNT:
    'Act token is missing a recognizable service-account identifier',
} as const;
