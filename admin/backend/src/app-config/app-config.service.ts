import { EnvironmentVariables } from "@/app-config/app-config.schema";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService<EnvironmentVariables>) {}

  // DAM Configuration
  get damRstPdfCollectionId(): string {
    return this.configService.get("DAM_RST_PDF_COLLECTION_ID", {
      infer: true,
    })!;
  }

  get damRstImageCollectionId(): string {
    return this.configService.get("DAM_RST_IMAGE_COLLECTION_ID", {
      infer: true,
    })!;
  }

  get damUrl(): string {
    return this.configService.get("DAM_URL", { infer: true })!;
  }

  get damUser(): string {
    return this.configService.get("DAM_USER", { infer: true })!;
  }

  get damPrivateKey(): string {
    return this.configService.get("DAM_PRIVATE_KEY", { infer: true })!;
  }

  get damResourceTypePdf(): number {
    return (
      this.configService.get("DAM_RESOURCE_TYPE_PDF", { infer: true }) || 1
    );
  }

  get damResourceTypeImage(): number {
    return (
      this.configService.get("DAM_RESOURCE_TYPE_IMAGE", { infer: true }) || 1
    );
  }

  // Database Configuration
  get databaseHost(): string {
    return this.configService.get("POSTGRES_HOST", { infer: true })!;
  }

  get databasePort(): number {
    return this.configService.get("POSTGRES_PORT", 5432, {
      infer: true,
    })!;
  }

  get databaseUser(): string {
    return this.configService.get("POSTGRES_USER", { infer: true })!;
  }

  get databasePassword(): string {
    return this.configService.get("POSTGRES_PASSWORD", { infer: true })!;
  }

  get databaseName(): string {
    return this.configService.get("POSTGRES_DATABASE", { infer: true })!;
  }

  get databaseSchema(): string {
    return this.configService.get("POSTGRES_SCHEMA", { infer: true })!;
  }

  // Database URL helper
  get databaseUrl(): string {
    const encodedPassword = encodeURIComponent(this.databasePassword);
    return `postgresql://${this.databaseUser}:${encodedPassword}@${this.databaseHost}:${this.databasePort}/${this.databaseName}?schema=${this.databaseSchema}&connection_limit=10`;
  }

  // Keycloak Configuration
  get keycloakAuthServerUrl(): string {
    return this.configService.get("KEYCLOAK_AUTH_SERVER_URL", { infer: true })!;
  }

  get keycloakRealm(): string {
    return this.configService.get("KEYCLOAK_REALM", { infer: true })!;
  }

  get keycloakClientId(): string {
    return this.configService.get("KEYCLOAK_CLIENT_ID", { infer: true })!;
  }

  get keycloakIssuer(): string {
    return this.configService.get("KEYCLOAK_ISSUER", { infer: true })!;
  }
}
