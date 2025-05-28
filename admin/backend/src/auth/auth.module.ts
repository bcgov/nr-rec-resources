import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthPassportKeycloakStrategy } from "./auth-papssport-keycloak-strategy.service";

@Module({
  imports: [PassportModule, ConfigModule],
  providers: [AuthPassportKeycloakStrategy, ConfigService],
  exports: [PassportModule],
})
export class AuthModule {}
