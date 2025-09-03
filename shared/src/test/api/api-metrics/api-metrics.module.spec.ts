import { ApiMetricsModule } from '@shared/api/api-metrics/api-metrics.module';
import { ApiMetricsService } from '@shared/api/api-metrics/api-metrics.service';
import { Test } from '@nestjs/testing';
import { ClsModule } from 'nestjs-cls';

describe('ApiMetricsModule', () => {
  let module;
  let apiMetricsService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [ClsModule.forRoot(), ApiMetricsModule],
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
