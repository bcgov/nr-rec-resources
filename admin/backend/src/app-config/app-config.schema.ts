import { plainToClass, Transform } from 'class-transformer';
import { IsNotEmpty, IsString, IsUrl, validateSync } from 'class-validator';

export class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  DAM_RST_PDF_COLLECTION_ID: string;

  @IsString()
  @IsNotEmpty()
  DAM_RST_IMAGE_COLLECTION_ID: string;

  @IsUrl({ require_tld: false }) // Allow localhost URLs for development
  @IsNotEmpty()
  DAM_URL: string;

  @IsString()
  @IsNotEmpty()
  DAM_USER: string;

  @IsString()
  @IsNotEmpty()
  DAM_PRIVATE_KEY: string;

  @Transform(({ value }) => parseInt(value, 10) || 1) // Default to 1 if not provided
  DAM_RESOURCE_TYPE_PDF: number;

  @Transform(({ value }) => parseInt(value, 10) || 1) // Default to 1 if not provided
  DAM_RESOURCE_TYPE_IMAGE: number;

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

  // AWS S3 configuration
  @IsString()
  @IsNotEmpty()
  ESTABLISHMENT_ORDER_DOCS_BUCKET: string;

  @IsString()
  @IsNotEmpty()
  AWS_REGION: string;
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
