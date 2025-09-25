import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthPassportKeycloakStrategy } from './auth-papssport-keycloak-strategy.service';

@Module({
  imports: [PassportModule],
  providers: [AuthPassportKeycloakStrategy],
  exports: [PassportModule],
})
export class AuthModule {}
