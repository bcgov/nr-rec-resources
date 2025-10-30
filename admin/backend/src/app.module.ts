import { RecreationResourceModule } from '@/recreation-resources/recreation-resource.module';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TerminusModule } from '@nestjs/terminus';
import { ADMIN_METRIC_NAMESPACE_NAME_PREFIX } from '@shared/api/api-metrics/api-metrics.constants';
import { ApiMetricsModule } from '@shared/api/api-metrics/api-metrics.module';
import { ClsModule } from 'nestjs-cls';
import { AppConfigModule } from './app-config/app-config.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth';
import { clsConfig } from './common/cls.config';
import { UserContextModule } from './common/modules/user-context/user-context.module';
import { HealthController } from './health.controller';
import { PrismaService } from './prisma.service';

@Module({
  imports: [
    ClsModule.forRoot(clsConfig),
    AppConfigModule,
    PassportModule,
    AuthModule,
    TerminusModule,
    RecreationResourceModule,
    UserContextModule,
    ApiMetricsModule.forRoot({
      namespacePrefix: ADMIN_METRIC_NAMESPACE_NAME_PREFIX,
    }),
  ],
  controllers: [AppController, HealthController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
