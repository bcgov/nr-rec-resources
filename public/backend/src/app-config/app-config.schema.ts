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

  @Transform(({ value }) => parseInt(value, 10) || 5432)
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
  @IsOptional()
  POSTGRES_SCHEMA: string;

  // CloudFront configuration
  @IsUrl({ require_tld: false })
  @IsNotEmpty()
  RST_STORAGE_CLOUDFRONT_URL: string;

  // Forest Client API configuration
  @IsUrl({ require_tld: false })
  @IsNotEmpty()
  FOREST_CLIENT_API_URL: string;

  @IsString()
  @IsNotEmpty()
  FOREST_CLIENT_API_KEY: string;

  // Server configuration
  @Transform(({ value }) => parseInt(value, 10) || 8000)
  @IsOptional()
  PORT?: number;
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
