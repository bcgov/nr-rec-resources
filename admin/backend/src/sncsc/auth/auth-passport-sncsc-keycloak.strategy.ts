import { AppConfigService } from '@/app-config/app-config.service';
import { AUTH_STRATEGY } from '@/auth/auth.constants';
import { KeycloakUserToken } from '@/auth/auth.types';
import { UserContextService } from '@/common/modules/user-context/user-context.service';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import KeycloakBearerStrategy from 'passport-keycloak-bearer';

/**
 * Passport strategy dedicated to authenticating the SNCSC integration.
 *
 * Isolated from the global RST admin strategy and other service-account
 * strategies so only tokens minted for the SNCSC CSS client (`aud`) can
 * access SNCSC-protected routes.
 */
@Injectable()
export class AuthPassportSncscKeycloakStrategy extends PassportStrategy(
  KeycloakBearerStrategy,
  AUTH_STRATEGY.SNCSC_KEYCLOAK,
) {
  private readonly logger = new Logger(AuthPassportSncscKeycloakStrategy.name);

  constructor(
    private readonly appConfig: AppConfigService,
    private readonly userContextService: UserContextService,
  ) {
    super({
      realm: appConfig.keycloakRealm,
      url: appConfig.keycloakAuthServerUrl,
      issuer: appConfig.keycloakIssuer,
      audience: appConfig.sncscCssClientId,
      loggingLevel: 'warn',
    });

    this.logger.log(
      'SNCSC Keycloak authentication strategy initialized successfully',
    );
  }

  async validate(payload: KeycloakUserToken): Promise<KeycloakUserToken> {
    const serviceAccountId = this.resolveServiceAccountId(payload);
    if (!serviceAccountId) {
      throw new UnauthorizedException(
        'SNCSC token is missing service-account identity claims.',
      );
    }

    const enrichedPayload: KeycloakUserToken = {
      ...payload,
      idir_username: serviceAccountId,
    };

    this.userContextService.setCurrentUser(enrichedPayload, 'SERVICE');
    return enrichedPayload;
  }

  private resolveServiceAccountId(
    payload: KeycloakUserToken,
  ): string | undefined {
    const azp = typeof payload.azp === 'string' ? payload.azp : undefined;
    const clientId =
      typeof payload.client_id === 'string' ? payload.client_id : undefined;
    return (
      azp ?? clientId ?? payload.preferred_username ?? payload.sub ?? undefined
    );
  }
}
