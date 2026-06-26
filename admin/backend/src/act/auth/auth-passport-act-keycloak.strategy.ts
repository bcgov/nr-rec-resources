import { AppConfigService } from '@/app-config/app-config.service';
import { AUTH_STRATEGY } from '@/auth/auth.constants';
import { KeycloakUserToken } from '@/auth/auth.types';
import { UserContextService } from '@/common/modules/user-context/user-context.service';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import KeycloakBearerStrategy from 'passport-keycloak-bearer';
import { ACT_AUTH_LOG_MESSAGES } from './act-auth.constants';

/**
 * Passport strategy dedicated to authenticating the Act integration.
 *
 * Why a separate strategy from {@link AuthPassportKeycloakStrategy}?
 *  - The RST admin strategy is registered globally and validates the
 *    audience claim against the RST admin client. Act tokens come from
 *    a *different* CSS client (with a different `aud`) and must NOT be
 *    accepted by RST admin endpoints, nor vice-versa.
 *  - Keeping the strategies isolated guarantees a Act-issued bearer
 *    token can only address `/api/v1/act/**` routes.
 *
 * Registered under {@link AUTH_STRATEGY.ACT_KEYCLOAK} so controllers
 * can opt in via `@UseGuards(AuthGuard(AUTH_STRATEGY.ACT_KEYCLOAK))`.
 *
 * On successful validation the payload is stored in CLS with an
 * identity provider of `'SERVICE'`, and the `idir_username` field is
 * synthesized from the token (`azp` / `client_id` / `preferred_username`)
 * so audit-aware downstream code keeps working.
 */
@Injectable()
export class AuthPassportActKeycloakStrategy extends PassportStrategy(
  KeycloakBearerStrategy,
  AUTH_STRATEGY.ACT_KEYCLOAK,
) {
  private readonly logger = new Logger(AuthPassportActKeycloakStrategy.name);

  constructor(
    private readonly appConfig: AppConfigService,
    private readonly userContextService: UserContextService,
  ) {
    const options = AuthPassportActKeycloakStrategy.buildConfig(appConfig);
    super(options);
    this.logger.log(ACT_AUTH_LOG_MESSAGES.STRATEGY_INITIALIZED);
  }

  /**
   * Build the underlying `passport-keycloak-bearer` options bound to the
   * Act CSS client audience.
   */
  private static buildConfig(
    appConfigService: AppConfigService,
  ): KeycloakBearerStrategy.Options {
    return {
      realm: appConfigService.keycloakRealm,
      url: appConfigService.keycloakAuthServerUrl,
      issuer: appConfigService.keycloakIssuer,
      // Audience MUST match the Act CSS client - this is what keeps the
      // strategy isolated from the RST admin strategy.
      audience: appConfigService.actCssClientId,
      loggingLevel: 'warn',
    };
  }

  /**
   * Validates the decoded JWT payload, stores a service-account user
   * context in CLS, and returns the payload to Passport.
   *
   * Act tokens are issued via the Client Credentials grant flow, which
   * has no end user. We synthesize a stable identifier from standard
   * OAuth2 claims so the audit extension can populate `created_by` /
   * `updated_by` fields without depending on `idir_username`.
   */
  async validate(payload: KeycloakUserToken): Promise<KeycloakUserToken> {
    const serviceAccountId = this.resolveServiceAccountId(payload);
    if (!serviceAccountId) {
      this.logger.warn(ACT_AUTH_LOG_MESSAGES.MISSING_SERVICE_ACCOUNT);
      throw new UnauthorizedException(
        ACT_AUTH_LOG_MESSAGES.MISSING_SERVICE_ACCOUNT,
      );
    }

    const enrichedPayload: KeycloakUserToken = {
      ...payload,
      idir_username: serviceAccountId,
    };

    this.userContextService.setCurrentUser(enrichedPayload, 'SERVICE');
    return enrichedPayload;
  }

  /**
   * Picks the most appropriate stable identifier from the JWT for use as
   * the service-account username. Prefers `azp` (authorized party, the
   * OAuth2 client that obtained the token), then `client_id`, then
   * `preferred_username`, then `sub` as a last resort.
   */
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
