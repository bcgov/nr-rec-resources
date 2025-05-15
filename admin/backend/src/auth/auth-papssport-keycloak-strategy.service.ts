import { Injectable, Logger } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import KeycloakBearerStrategy from "passport-keycloak-bearer";
import { ConfigService } from "@nestjs/config";
import {
  AUTH_STRATEGY,
  ENV_KEYS,
  ENV_VALUES,
  ERROR_MESSAGES,
  LOG_LEVEL,
  LOG_MESSAGES,
} from "./auth.constants";
import { KeycloakUserToken } from "./auth.types";

/**
 * Passport strategy for Keycloak Bearer authentication
 */
@Injectable()
export class AuthPassportKeycloakStrategy extends PassportStrategy(
  KeycloakBearerStrategy,
  AUTH_STRATEGY.KEYCLOAK,
) {
  private readonly logger = new Logger(AuthPassportKeycloakStrategy.name);

  constructor(private readonly configService: ConfigService) {
    const config =
      AuthPassportKeycloakStrategy.buildKeycloakConfig(configService);
    super(config);
    this.logger.log(LOG_MESSAGES.KEYCLOAK_INITIALIZED);
  }

  private static buildKeycloakConfig(
    configService: ConfigService,
  ): KeycloakBearerStrategy.Options {
    const config: Partial<KeycloakBearerStrategy.Options> = {
      realm: configService.get<string>(ENV_KEYS.KEYCLOAK_REALM),
      url: configService.get<string>(ENV_KEYS.KEYCLOAK_AUTH_SERVER_URL),
      issuer: configService.get<string>(ENV_KEYS.KEYCLOAK_ISSUER),
      audience: configService.get<string>(ENV_KEYS.KEYCLOAK_CLIENT_ID),
      loggingLevel:
        configService.get(ENV_KEYS.NODE_ENV) === ENV_VALUES.LOCAL
          ? LOG_LEVEL.DEBUG
          : LOG_LEVEL.WARN,
    };

    return AuthPassportKeycloakStrategy.validateConfig(config);
  }

  private static validateConfig(
    config: Partial<KeycloakBearerStrategy.Options>,
  ): KeycloakBearerStrategy.Options {
    const missingConfigs: string[] = [];

    if (!config.realm) missingConfigs.push(ENV_KEYS.KEYCLOAK_REALM);
    if (!config.issuer) missingConfigs.push(ENV_KEYS.KEYCLOAK_ISSUER);
    if (!config.audience) missingConfigs.push(ENV_KEYS.KEYCLOAK_CLIENT_ID);

    if (!config.url) {
      missingConfigs.push(ENV_KEYS.KEYCLOAK_AUTH_SERVER_URL);
    } else {
      try {
        new URL(config.url);
      } catch {
        throw new Error(
          `${ERROR_MESSAGES.INVALID_URL}: ${config.url}. ${ERROR_MESSAGES.PROVIDE_VALID_URL}`,
        );
      }
    }

    if (missingConfigs.length > 0) {
      throw new Error(
        `${ERROR_MESSAGES.MISSING_CONFIG}: ${missingConfigs.join(", ")}. ` +
          ERROR_MESSAGES.CONFIG_CHECK_INSTRUCTION,
      );
    }

    return config as KeycloakBearerStrategy.Options;
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
