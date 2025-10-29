import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import KeycloakBearerStrategy from 'passport-keycloak-bearer';
import { AppConfigService } from '@/app-config/app-config.service';
import { AUTH_STRATEGY, LOG_MESSAGES } from './auth.constants';
import { KeycloakUserToken } from './auth.types';

/**
 * Passport strategy for Keycloak Bearer authentication
 */
@Injectable()
export class AuthPassportKeycloakStrategy extends PassportStrategy(
  KeycloakBearerStrategy,
  AUTH_STRATEGY.KEYCLOAK,
) {
  private readonly logger = new Logger(AuthPassportKeycloakStrategy.name);

  constructor(private readonly appConfig: AppConfigService) {
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
      loggingLevel: 'debug',
    };
  }

  /**
   * Validates and processes the JWT payload
   * @param payload The decoded JWT payload
   * @returns The user token information
   */
  async validate(payload: KeycloakUserToken): Promise<KeycloakUserToken> {
    return payload;
  }
}
