import { ROLE_MODE } from './auth.constants';

// Role validation modes type
export type RoleMode = (typeof ROLE_MODE)[keyof typeof ROLE_MODE];

// Roles metadata interface for decorators
export interface RolesMetadata {
  roles: string[];
  mode: RoleMode;
}

// User token information
export interface KeycloakUserToken {
  sub: string;
  iss: string;
  email_verified?: boolean;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  client_roles?: string[];
  [key: string]: unknown;
}
