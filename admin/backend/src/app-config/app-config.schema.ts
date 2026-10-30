import { plainToClass, Transform } from 'class-transformer';
import {
  IsBooleanString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  ValidateIf,
  validateSync,
} from 'class-validator';

export class EnvironmentVariables {
  // Database configuration
  @IsString()
  @IsNotEmpty()
  POSTGRES_HOST: string;

  @Transform(({ value }) => parseInt(value, 10))
  POSTGRES_PORT: number;

  @IsString()
  @IsNotEmpty()
  POSTGRES_USER: string;

  @IsString()
  @IsNotEmpty()
  POSTGRES_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  POSTGRES_DATABASE: string;

  @IsString()
  POSTGRES_SCHEMA: string;

  // Keycloak configuration
  @IsUrl({ require_tld: false })
  @IsNotEmpty()
  KEYCLOAK_AUTH_SERVER_URL: string;

  @IsString()
  @IsNotEmpty()
  KEYCLOAK_REALM: string;

  @IsString()
  @IsNotEmpty()
  KEYCLOAK_CLIENT_ID: string;

  @IsUrl({ require_tld: false })
  @IsNotEmpty()
  KEYCLOAK_ISSUER: string;

  // Act integration: the CSS Client ID provisioned for the Act service
  // account. Used as the JWT `aud` claim that the Act-specific Keycloak
  // bearer strategy validates against. Act-issued tokens will be rejected
  // by the (RST admin) global strategy because the audience differs - and
  // vice-versa - which is exactly the isolation we want.
  @IsString()
  @IsNotEmpty()
  ACT_CSS_CLIENT_ID: string;

  @IsOptional()
  @IsString()
  BCGW_CSS_CLIENT_ID?: string;

  @IsOptional()
  @IsString()
  SNCSC_CSS_CLIENT_ID?: string;

  @IsOptional()
  @IsString()
  SNCSC_INTEGRATION_CLIENT_ID?: string;

  @IsOptional()
  @IsString()
  SNCSC_INTEGRATION_CLIENT_SECRET?: string;

  @IsOptional()
  @IsString()
  SNCSC_DM_CLIENT_ID?: string;

  @IsOptional()
  @IsString()
  SNCSC_DM_CLIENT_SECRET?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  SNCSC_BASE_URL?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  SNCSC_TOKEN_URL?: string;

  // Forest Client API configuration
  @IsUrl({ require_tld: false })
  @IsNotEmpty()
  FOREST_CLIENT_API_URL: string;

  @IsString()
  @IsNotEmpty()
  FOREST_CLIENT_API_KEY: string;

  // AWS S3 configuration
  @IsString()
  @IsNotEmpty()
  ESTABLISHMENT_ORDER_DOCS_BUCKET: string;

  @IsString()
  @IsNotEmpty()
  EXHIBIT_A_DOCS_BUCKET: string;

  @IsString()
  @IsNotEmpty()
  RST_STORAGE_IMAGES_BUCKET: string;

  @IsString()
  @IsNotEmpty()
  RST_STORAGE_PUBLIC_DOCUMENTS_BUCKET: string;

  @IsString()
  @IsNotEmpty()
  RST_STORAGE_CONSENT_FORMS_BUCKET: string;

  // BCGW layer exports written to S3 by the scheduled export job. Only required
  // when that job is enabled, so an environment that does not run it (e2e, local
  // dev without S3) still boots. The BCGW endpoints report themselves
  // unavailable when it is unset.
  @ValidateIf((env: EnvironmentVariables) => env.BCGW_EXPORT_ENABLED === 'true')
  @IsString()
  @IsNotEmpty()
  BCGW_EXPORTS_BUCKET?: string;

  @IsString()
  @IsNotEmpty()
  AWS_REGION: string;

  // Optional: AWS endpoint URL for LocalStack/local development
  @IsOptional()
  @IsUrl({ require_tld: false })
  AWS_ENDPOINT_URL?: string;

  // CloudFront CDN configuration
  @IsString()
  @IsNotEmpty()
  RST_STORAGE_CLOUDFRONT_URL: string;

  // BCGW export schedule. Disabled by default so local dev and tests do not
  // run the job on boot; trigger it manually via POST /api/v1/bcgw/export.
  @IsOptional()
  @IsBooleanString()
  BCGW_EXPORT_ENABLED?: string;

  @IsOptional()
  @IsString()
  BCGW_EXPORT_CRON?: string;

  // FTA map service integration
  @IsOptional()
  @IsString()
  CFG_FTA_MAP_SERVICE?: string;

  @IsOptional()
  @IsString()
  CFG_FTA_ARC_GIS_SERVERS?: string;

  @IsOptional()
  @IsString()
  CFG_OPERATIONAL_LAYER_LIST_URL?: string;

  @IsOptional()
  @IsString()
  CFG_FTA_ARC_IMS_SERVER?: string;

  @IsOptional()
  @IsString()
  CFG_SDE_RENDER_AGENT_SERVER?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const errorMessages = errors
      .map((error) => {
        const constraints = Object.values(error.constraints || {});
        return `${error.property}: ${constraints.join(', ')}`;
      })
      .join('\n');

    throw new Error(`Configuration validation failed:\n${errorMessages}`);
  }

  return validatedConfig;
}
