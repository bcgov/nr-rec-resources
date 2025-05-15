// Metadata keys for decorators
export const AUTH_ROLES_KEY = "roles";

export const AUTH_RST_ADMIN_ROLE = "rst-admin";

// Role validation modes
export const ROLE_MODE = {
  ANY: "any",
  ALL: "all",
} as const;

// Authentication strategies
export const AUTH_STRATEGY = {
  KEYCLOAK: "keycloak",
} as const;

// Environment variable keys
export const ENV_KEYS = {
  KEYCLOAK_REALM: "KEYCLOAK_REALM",
  KEYCLOAK_AUTH_SERVER_URL: "KEYCLOAK_AUTH_SERVER_URL",
  KEYCLOAK_ISSUER: "KEYCLOAK_ISSUER",
  KEYCLOAK_CLIENT_ID: "KEYCLOAK_CLIENT_ID",
  NODE_ENV: "NODE_ENV",
} as const;

// Environment values
export const ENV_VALUES = {
  LOCAL: "local",
} as const;

// Logging levels
export const LOG_LEVEL = {
  DEBUG: "debug",
  WARN: "warn",
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NO_ROLES_FOUND: "No roles found in token",
  INSUFFICIENT_ROLES: "User does not have the required role(s)",
  MISSING_CONFIG: "Missing required Keycloak configuration",
  INVALID_URL: "Invalid Keycloak URL",
  CONFIG_CHECK_INSTRUCTION:
    "Please check your environment variables or configuration files.",
  PROVIDE_VALID_URL: "Please provide a valid URL.",
} as const;

// Success messages
export const LOG_MESSAGES = {
  KEYCLOAK_INITIALIZED:
    "Keycloak authentication strategy initialized successfully",
} as const;
