// Metadata keys for decorators
export const AUTH_ROLES_KEY = 'roles';

/**
 * Enum for authentication roles.
 */
export enum RecreationResourceAuthRole {
  RST_ADMIN = 'rst-admin',
  RST_VIEWER = 'rst-viewer',
  /**
   * Service account role assigned (via CSS) to the Act integration client.
   * Act authenticates using the OAuth2 Client Credentials grant flow,
   * obtains a bearer token from CSS, and the token must carry this role
   * to access the Act CUD advisory endpoints.
   */
  ACT_SERVICE = 'test-act',
  RST_SUPER_ADMIN = 'rst-super-admin',
}

// Role validation modes
export const ROLE_MODE = {
  ANY: 'any',
  ALL: 'all',
} as const;

// Authentication strategies and Swagger security scheme identifiers
export const AUTH_STRATEGY = {
  KEYCLOAK: 'keycloak',
  /**
   * Passport strategy name used to authenticate the Act integration.
   *
   * The generated OpenAPI document also reuses this key for the Act OAuth2
   * Client Credentials security scheme so the Swagger auth option lines up
   * with the runtime `AuthGuard(AUTH_STRATEGY.ACT_KEYCLOAK)` strategy name.
   */
  ACT_KEYCLOAK: 'act-keycloak',
} as const;

// Environment variable keys
export const ENV_KEYS = {
  KEYCLOAK_REALM: 'KEYCLOAK_REALM',
  KEYCLOAK_AUTH_SERVER_URL: 'KEYCLOAK_AUTH_SERVER_URL',
  KEYCLOAK_ISSUER: 'KEYCLOAK_ISSUER',
  KEYCLOAK_CLIENT_ID: 'KEYCLOAK_CLIENT_ID',
  NODE_ENV: 'NODE_ENV',
} as const;

// Environment values
export const ENV_VALUES = {
  LOCAL: 'local',
} as const;

// Logging levels
export const LOG_LEVEL = {
  DEBUG: 'debug',
  WARN: 'warn',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NO_ROLES_FOUND: 'No roles found in token',
  INSUFFICIENT_ROLES: 'User does not have the required role(s)',
  MISSING_CONFIG: 'Missing required Keycloak configuration',
  INVALID_URL: 'Invalid Keycloak URL',
  CONFIG_CHECK_INSTRUCTION:
    'Please check your environment variables or configuration files.',
  PROVIDE_VALID_URL: 'Please provide a valid URL.',
} as const;

// Success messages
export const LOG_MESSAGES = {
  KEYCLOAK_INITIALIZED:
    'Keycloak authentication strategy initialized successfully',
  ACT_KEYCLOAK_INITIALIZED:
    'Act Keycloak authentication strategy initialized successfully',
} as const;
