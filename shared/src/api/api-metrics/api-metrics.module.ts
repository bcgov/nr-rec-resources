import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClsModule } from 'nestjs-cls';
import { Reflector } from '@nestjs/core';
import { ApiMetricsInterceptor } from './api-metrics.interceptor';
import { ApiMetricsService } from './api-metrics.service';
import { OperationNameUtil } from './operation-name.util';

export interface ApiMetricsModuleOptions {
  namespacePrefix: string;
}

@Module({})
export class ApiMetricsModule {
  static forRoot(options: ApiMetricsModuleOptions): DynamicModule {
    return {
      module: ApiMetricsModule,
      imports: [ConfigModule, ClsModule],
      providers: [
        Reflector,
        OperationNameUtil,
        {
          provide: ApiMetricsService,
          useFactory: (configService: ConfigService) =>
            new ApiMetricsService(configService, options.namespacePrefix),
          inject: [ConfigService],
        },
        {
          provide: 'APP_INTERCEPTOR',
          useClass: ApiMetricsInterceptor,
        },
      ],
      exports: [ApiMetricsService, OperationNameUtil],
    };
  }
}
