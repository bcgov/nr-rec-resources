import { EnvironmentVariables } from '@/app-config/app-config.schema';
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
    return this.configService.get('POSTGRES_PORT', 5432, {
      infer: true,
    })!;
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

  // Keycloak Configuration
  get keycloakAuthServerUrl(): string {
    return this.configService.get('KEYCLOAK_AUTH_SERVER_URL', { infer: true })!;
  }

  get keycloakRealm(): string {
    return this.configService.get('KEYCLOAK_REALM', { infer: true })!;
  }

  get keycloakClientId(): string {
    return this.configService.get('KEYCLOAK_CLIENT_ID', { infer: true })!;
  }

  get keycloakIssuer(): string {
    return this.configService.get('KEYCLOAK_ISSUER', { infer: true })!;
  }

  // AWS S3 Configuration
  get establishmentOrderDocsBucket(): string {
    return this.configService.get('ESTABLISHMENT_ORDER_DOCS_BUCKET', {
      infer: true,
    })!;
  }

  get recResourceImagesBucket(): string {
    return this.configService.get('RST_STORAGE_IMAGES_BUCKET', {
      infer: true,
    })!;
  }

  get recResourcePublicDocsBucket(): string {
    return this.configService.get('RST_STORAGE_PUBLIC_DOCUMENTS_BUCKET', {
      infer: true,
    })!;
  }

  get recResourceConsentFormsBucket(): string {
    return this.configService.get('RST_STORAGE_CONSENT_FORMS_BUCKET', {
      infer: true,
    })!;
  }

  get awsRegion(): string {
    return this.configService.get('AWS_REGION', {
      infer: true,
    })!;
  }

  get awsEndpointUrl(): string | undefined {
    return this.configService.get('AWS_ENDPOINT_URL', {
      infer: true,
    });
  }

  // CloudFront Configuration
  get recResourceStorageCloudfrontUrl(): string {
    return this.configService.get('RST_STORAGE_CLOUDFRONT_URL', {
      infer: true,
    })!;
  }
}
