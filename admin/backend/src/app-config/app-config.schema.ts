import { plainToClass, Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
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

  // AWS S3 configuration
  @IsString()
  @IsNotEmpty()
  ESTABLISHMENT_ORDER_DOCS_BUCKET: string;

  @IsString()
  @IsNotEmpty()
  RST_STORAGE_IMAGES_BUCKET: string;

  @IsString()
  @IsNotEmpty()
  RST_STORAGE_PUBLIC_DOCUMENTS_BUCKET: string;

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
