import { beforeEach, describe, expect, it, Mocked, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { ApiMetricsInterceptor } from '@shared/api/api-metrics/api-metrics.interceptor';
import { ApiMetricsService } from '@shared/api/api-metrics/api-metrics.service';
import { OperationNameUtil } from '@shared/api/api-metrics/operation-name.util';

// helper to create a fake ExecutionContext
function createExecutionContext(req: any, res: any): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => req,
      getResponse: () => res,
    }),
  } as unknown as ExecutionContext;
}

describe('ApiMetricsInterceptor', () => {
  let interceptor: ApiMetricsInterceptor;
  let mockApiMetricsService: Mocked<ApiMetricsService>;
  let mockOperationNameUtil: Mocked<OperationNameUtil>;
  let mockCls: Mocked<ClsService>;

  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    mockApiMetricsService = {
      buildMetricDatum: vi.fn().mockReturnValue([{ metric: 'x' }]),
      publish: vi.fn().mockResolvedValue(undefined),
    } as any;

    mockOperationNameUtil = {
      get: vi.fn().mockReturnValue('TestOperation'),
    } as any;

    mockCls = {
      getId: vi.fn().mockReturnValue('req-123'),
    } as any;

    interceptor = new ApiMetricsInterceptor(
      mockApiMetricsService,
      mockOperationNameUtil,
      mockCls,
    );

    mockReq = { method: 'GET', url: '/test' };
    mockRes = {
      statusCode: 200,
      setHeader: vi.fn(),
    };
  });

  it('should handle a successful request and record metrics', async () => {
    const context = createExecutionContext(mockReq, mockRes);

    const next = {
      handle: () => of({ data: 'ok' }),
    };

    const result = await interceptor.intercept(context, next).toPromise();

    expect(result).toEqual({ data: 'ok' });
    expect(mockRes.setHeader).toHaveBeenCalledWith('rst-request-id', 'req-123');
    expect(mockApiMetricsService.buildMetricDatum).toHaveBeenCalledWith(
      'TestOperation',
      'GET',
      200,
      expect.any(Number),
    );
    expect(mockApiMetricsService.publish).toHaveBeenCalled();
  });

  it('should handle an HttpException and record error metrics', async () => {
    const context = createExecutionContext(mockReq, mockRes);

    const next = {
      handle: () =>
        throwError(() => new HttpException('Bad', HttpStatus.BAD_REQUEST)),
    };

    await expect(
      interceptor.intercept(context, next).toPromise(),
    ).rejects.toThrow('Bad');

    expect(mockApiMetricsService.buildMetricDatum).toHaveBeenCalledWith(
      'TestOperation',
      'GET',
      400,
      expect.any(Number),
    );
    expect(mockApiMetricsService.publish).toHaveBeenCalled();
  });

  it('should handle a generic error and record metrics with status 500', async () => {
    const context = createExecutionContext(mockReq, mockRes);

    const next = {
      handle: () => throwError(() => new Error('Unexpected')),
    };

    await expect(
      interceptor.intercept(context, next).toPromise(),
    ).rejects.toThrow('Unexpected');

    expect(mockApiMetricsService.buildMetricDatum).toHaveBeenCalledWith(
      'TestOperation',
      'GET',
      500,
      expect.any(Number),
    );
    expect(mockApiMetricsService.publish).toHaveBeenCalled();
  });
});
