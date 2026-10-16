import { AppConfigModule } from '@/app-config/app-config.module';
import { UserContextModule } from '@/common/modules/user-context/user-context.module';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthPassportSncscKeycloakStrategy } from './auth-passport-sncsc-keycloak.strategy';

/**
 * Wires up the SNCSC-only Keycloak Passport strategy.
 *
 * Intentionally isolated so tokens issued for the SNCSC CSS client
 * only address SNCSC-protected routes.
 */
@Module({
  imports: [PassportModule, AppConfigModule, UserContextModule],
  providers: [AuthPassportSncscKeycloakStrategy],
  exports: [PassportModule],
})
export class SncscAuthModule {}
