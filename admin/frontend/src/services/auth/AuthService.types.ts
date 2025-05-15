import { KeycloakTokenParsed } from "@keycloak-lib/keycloak";

export interface UserInfo extends KeycloakTokenParsed {
  idir_username: string;
  email_verified: boolean;
  preferred_username: string;
  given_name: string;
  display_name: string;
  idir_user_guid: string;
  user_principal_name: string;
  client_roles: string[];
  name: string;
  family_name: string;
  email: string;
}
