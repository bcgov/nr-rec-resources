import { EnvironmentVariables } from 'src/app-config/app-config.schema';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService<EnvironmentVariables>) {}

  // Database Configuration
  get databaseHost(): string {
    return this.configService.get('POSTGRES_HOST', { infer: true })!;
  }

  get databasePort(): number {
    return this.configService.get('POSTGRES_PORT', 5432, { infer: true })!;
  }

  get databaseUser(): string {
    return this.configService.get('POSTGRES_USER', { infer: true })!;
  }

  get databasePassword(): string {
    return this.configService.get('POSTGRES_PASSWORD', { infer: true })!;
  }

  get databaseName(): string {
    return this.configService.get('POSTGRES_DATABASE', { infer: true })!;
  }

  get databaseSchema(): string {
    return this.configService.get('POSTGRES_SCHEMA', 'rst', { infer: true })!;
  }

  // Database URL helper
  get databaseUrl(): string {
    const encodedPassword = encodeURIComponent(this.databasePassword);
    return `postgresql://${this.databaseUser}:${encodedPassword}@${this.databaseHost}:${this.databasePort}/${this.databaseName}?schema=${this.databaseSchema}&connection_limit=10`;
  }

  // CloudFront Configuration
  get rstStorageCloudfrontUrl(): string {
    return this.configService.get('RST_STORAGE_CLOUDFRONT_URL', {
      infer: true,
    })!;
  }

  // Forest Client API Configuration
  get forestClientApiUrl(): string {
    return this.configService.get('FOREST_CLIENT_API_URL', { infer: true })!;
  }

  get forestClientApiKey(): string {
    return this.configService.get('FOREST_CLIENT_API_KEY', { infer: true })!;
  }

  // Server Configuration
  get port(): number {
    return this.configService.get('PORT', 8000, { infer: true })!;
  }
}
