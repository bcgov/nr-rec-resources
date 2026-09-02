import { AppConfigService } from '@/app-config/app-config.service';
import { UserContextService } from '@/common/modules/user-context/user-context.service';
import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import KeycloakBearerStrategy from 'passport-keycloak-bearer';
import {
  AUTH_STRATEGY,
  LOG_MESSAGES,
  RecreationResourceAuthRole,
} from './auth.constants';
import { KeycloakUserToken } from './auth.types';

/** All known RST application roles. Any IDIR user missing all of these gets auto-assigned IDIR_VIEWER. */
const RST_ROLES = new Set<string>(
  Object.values(RecreationResourceAuthRole).filter(
    (r) => r !== RecreationResourceAuthRole.ACT_SERVICE,
  ),
);

/**
 * Passport strategy for Keycloak Bearer authentication
 */
@Injectable()
export class AuthPassportKeycloakStrategy extends PassportStrategy(
  KeycloakBearerStrategy,
  AUTH_STRATEGY.KEYCLOAK,
) {
  private readonly logger = new Logger(AuthPassportKeycloakStrategy.name);

  constructor(
    private readonly appConfig: AppConfigService,
    private readonly userContextService: UserContextService,
  ) {
    const config = AuthPassportKeycloakStrategy.buildKeycloakConfig(appConfig);
    super(config);
    this.logger.log(LOG_MESSAGES.KEYCLOAK_INITIALIZED);
  }

  private static buildKeycloakConfig(
    appConfigService: AppConfigService,
  ): KeycloakBearerStrategy.Options {
    return {
      realm: appConfigService.keycloakRealm,
      url: appConfigService.keycloakAuthServerUrl,
      issuer: appConfigService.keycloakIssuer,
      audience: appConfigService.keycloakClientId,
      loggingLevel: 'warn',
    };
  }

  /**
   * Validates and processes the JWT payload
   * @param payload The decoded JWT payload
   * @returns The user token information
   */
  async validate(payload: KeycloakUserToken): Promise<KeycloakUserToken> {
    // Auto-assign IDIR_VIEWER to any IDIR user who holds no other RST role.
    // This implements the "automatic read-only access for IDIR" requirement
    // without requiring CSS / Keycloak admin changes.
    if (payload.idir_username) {
      const existingRoles = payload.client_roles ?? [];
      const hasRstRole = existingRoles.some((r) => RST_ROLES.has(r));
      if (!hasRstRole) {
        payload = {
          ...payload,
          client_roles: [
            ...existingRoles,
            RecreationResourceAuthRole.RST_IDIR_VIEWER,
          ],
        };
      }
    }

    this.userContextService.setCurrentUser(payload);
    return payload;
  }
}
