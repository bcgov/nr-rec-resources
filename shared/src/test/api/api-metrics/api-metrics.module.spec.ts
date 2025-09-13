import { beforeEach, describe, expect, it } from 'vitest';
import { ApiMetricsModule } from '@shared/api/api-metrics/api-metrics.module';
import { ApiMetricsService } from '@shared/api/api-metrics/api-metrics.service';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsModule } from 'nestjs-cls';
import { ConfigModule } from '@nestjs/config';

describe('ApiMetricsModule', () => {
  let module: TestingModule;
  let apiMetricsService: ApiMetricsService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ClsModule.forRoot(),
        ApiMetricsModule.forRoot({ namespacePrefix: 'test' }),
      ],
    }).compile();

    apiMetricsService = module.get(ApiMetricsService);
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide ApiMetricsService', () => {
    expect(apiMetricsService).toBeDefined();
    expect(apiMetricsService).toBeInstanceOf(ApiMetricsService);
  });

  it('should export ApiMetricsService at runtime', () => {
    // The ApiMetricsService should be available from the module
    expect(apiMetricsService).toBeDefined();
    expect(apiMetricsService).toBeInstanceOf(ApiMetricsService);
  });
});
