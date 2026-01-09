import 'dotenv/config';
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { HTTPLoggerMiddleware } from './middleware/req.res.logger';
import { AppService } from './app.service';
import { PrismaService } from 'src/prisma.service';
import { AppController } from './app.controller';
import { MetricsController } from './metrics.controller';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { RecreationResourceModule } from './recreation-resource/recreation-resource.module';
import { ClsModule } from 'nestjs-cls';
import { clsConfig } from 'src/common/cls.config';
import { ApiMetricsModule } from '@shared/api/api-metrics/api-metrics.module';
import { PUBLIC_METRIC_NAMESPACE_NAME_PREFIX } from '@shared/api/api-metrics/api-metrics.constants';
import { SitemapModule } from './sitemap/sitemap.module';
import { AppConfigModule } from './app-config/app-config.module';

@Module({
  imports: [
    ClsModule.forRoot(clsConfig),
    AppConfigModule,
    TerminusModule,
    RecreationResourceModule,
    SitemapModule,
    ApiMetricsModule.forRoot({
      namespacePrefix: PUBLIC_METRIC_NAMESPACE_NAME_PREFIX,
    }),
  ],
  controllers: [AppController, MetricsController, HealthController],
  providers: [AppService, PrismaService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(HTTPLoggerMiddleware)
      .exclude(
        { path: 'metrics', method: RequestMethod.ALL },
        { path: 'health', method: RequestMethod.ALL },
      )
      .forRoutes('*');
  }
}
