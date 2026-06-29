import { PrismaModule } from '@/prisma.module';
import { PrismaService } from '@/prisma.service';
import { UserContextModule } from '@/common/modules/user-context/user-context.module';
import { Module } from '@nestjs/common';
import { ActAuthModule } from './auth';
import { ActAdvisoriesController } from './act-advisories.controller';
import { ActAdvisoriesRepository } from './act-advisories.repository';
import { ActAdvisoriesService } from './act-advisories.service';

/**
 * Module exposing the secure CUD advisory endpoints consumed by the
 * Act integration. Endpoints live under `/api/v1/act/advisories`.
 *
 * Security: CSS OAuth2 Client Credentials -> Keycloak bearer JWT validated
 *          by {@link ActAuthModule}'s isolated Act Passport strategy
 *          (audience bound to the Act CSS client). Authorization is
 *          enforced via the `act-service` client role.
 */
@Module({
  imports: [ActAuthModule, PrismaModule, UserContextModule],
  controllers: [ActAdvisoriesController],
  providers: [ActAdvisoriesService, ActAdvisoriesRepository, PrismaService],
  exports: [ActAdvisoriesService],
})
export class ActModule {}
