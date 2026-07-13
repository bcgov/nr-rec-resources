import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AppConfigModule } from '@/app-config/app-config.module';
import { AuthPassportBcgwKeycloakStrategy } from './auth-passport-bcgw-keycloak.strategy';

/**
 * Wires up the BCGW-only Keycloak Passport strategy.
 *
 * Intentionally isolated so tokens issued for the BCGW CSS client
 * only address BCGW-protected routes.
 */
@Module({
  imports: [PassportModule, AppConfigModule],
  providers: [AuthPassportBcgwKeycloakStrategy],
  exports: [PassportModule],
})
export class BcgwAuthModule {}
