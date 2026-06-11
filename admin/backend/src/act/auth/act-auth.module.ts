import { UserContextModule } from '@/common/modules/user-context/user-context.module';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthPassportActKeycloakStrategy } from './auth-passport-act-keycloak.strategy';

/**
 * Module that wires up the Act-only Keycloak Passport strategy.
 *
 * It is intentionally separate from the global RST admin {@link AuthModule}
 * because:
 *  - Act tokens come from a different CSS client and therefore carry
 *    a different `aud` claim.
 *  - The global RST admin strategy is bound to the RST admin client and
 *    would reject Act tokens at runtime (and vice-versa).
 *  - This module is imported only by the {@link ActModule} so the
 *    strategy is never accidentally picked up by other parts of the app.
 */
@Module({
  imports: [PassportModule, UserContextModule],
  providers: [AuthPassportActKeycloakStrategy],
  exports: [PassportModule],
})
export class ActAuthModule {}
