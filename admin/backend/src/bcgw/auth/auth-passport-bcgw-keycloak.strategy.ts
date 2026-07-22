import { AppConfigService } from '@/app-config/app-config.service';
import { AUTH_STRATEGY } from '@/auth/auth.constants';
import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import KeycloakBearerStrategy from 'passport-keycloak-bearer';

/**
 * Passport strategy dedicated to authenticating the BCGW ingestion integration.
 *
 * Mirrors the ACT strategy pattern — a separate strategy is needed because
 * BCGW tokens come from a different CSS client (different `aud` claim) and
 * must not be accepted by RST admin or ACT endpoints, nor vice-versa.
 *
 * Registered under {@link AUTH_STRATEGY.BCGW_KEYCLOAK} so the controller
 * can opt in via `@UseGuards(AuthGuard(AUTH_STRATEGY.BCGW_KEYCLOAK))`.
 */
@Injectable()
export class AuthPassportBcgwKeycloakStrategy extends PassportStrategy(
  KeycloakBearerStrategy,
  AUTH_STRATEGY.BCGW_KEYCLOAK,
) {
  private readonly logger = new Logger(AuthPassportBcgwKeycloakStrategy.name);

  constructor(private readonly appConfig: AppConfigService) {
    super({
      realm: appConfig.keycloakRealm,
      url: appConfig.keycloakAuthServerUrl,
      issuer: appConfig.keycloakIssuer,
      audience: appConfig.bcgwCssClientId,
      loggingLevel: 'warn',
    });
    this.logger.log(
      'BCGW Keycloak authentication strategy initialized successfully',
    );
  }

  async validate(payload: object): Promise<object> {
    return payload;
  }
}
