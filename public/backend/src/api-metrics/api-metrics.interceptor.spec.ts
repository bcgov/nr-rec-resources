import { Test } from '@nestjs/testing';
import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { ApiMetricsInterceptor } from './api-metrics.interceptor';
import { ApiMetricsService } from './api-metrics.service';
import { OperationNameUtil } from './operation-name.util';
import { Mocked } from 'vitest';

describe('ApiMetricsInterceptor', () => {
  let interceptor: ApiMetricsInterceptor;
  let apiMetricsService: ApiMetricsService;
  let operationNameUtil: OperationNameUtil;

  // Mock data
  const mockContext = {
    switchToHttp: vi.fn().mockReturnValue({
      getRequest: vi.fn().mockReturnValue({ method: 'GET' }),
      getResponse: vi.fn().mockReturnValue({ statusCode: 200 }),
    }),
  } as unknown as ExecutionContext;

  const mockCallHandler = {
    handle: vi.fn(),
  } as Mocked<CallHandler>;

  const mockMetricDatum = [{ name: 'test', value: 1 }];

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ApiMetricsInterceptor,
        {
          provide: ApiMetricsService,
          useValue: {
            buildMetricDatum: vi.fn().mockReturnValue(mockMetricDatum),
            publish: vi.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: OperationNameUtil,
          useValue: {
            get: vi.fn().mockReturnValue('testOperation'),
          },
        },
      ],
    }).compile();

    interceptor = moduleRef.get<ApiMetricsInterceptor>(ApiMetricsInterceptor);
    apiMetricsService = moduleRef.get<ApiMetricsService>(ApiMetricsService);
    operationNameUtil = moduleRef.get<OperationNameUtil>(OperationNameUtil);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should handle successful requests', () => {
    mockCallHandler.handle.mockReturnValue(of('test'));
    vi.spyOn(Date, 'now')
      .mockReturnValueOnce(1000) // Start time
      .mockReturnValueOnce(1500); // End time

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: () => {
        // Assert
        expect(apiMetricsService.buildMetricDatum).toHaveBeenCalledWith(
          'testOperation',
          'GET',
          200,
          500,
        );
        expect(apiMetricsService.publish).toHaveBeenCalledWith(mockMetricDatum);
      },
    });
  });

  it('should handle HttpException errors', () => {
    const httpError = new HttpException('Test error', HttpStatus.BAD_REQUEST);
    mockCallHandler.handle.mockReturnValue(throwError(() => httpError));
    vi.spyOn(Date, 'now').mockReturnValueOnce(1000).mockReturnValueOnce(1500);

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      error: (error) => {
        expect(apiMetricsService.buildMetricDatum).toHaveBeenCalledWith(
          'testOperation',
          'GET',
          400,
          500,
        );
        expect(apiMetricsService.publish).toHaveBeenCalledWith(mockMetricDatum);
        expect(error).toBe(httpError);
      },
    });
  });

  it('should handle non-HttpException errors', () => {
    const error = new Error('Test error');
    mockCallHandler.handle.mockReturnValue(throwError(() => error));
    vi.spyOn(Date, 'now').mockReturnValueOnce(1000).mockReturnValueOnce(1500);

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      error: (err) => {
        expect(apiMetricsService.buildMetricDatum).toHaveBeenCalledWith(
          'testOperation',
          'GET',
          500,
          500,
        );
        expect(apiMetricsService.publish).toHaveBeenCalledWith(mockMetricDatum);
        expect(err).toBe(error);
      },
    });
  });

  it('should get operation name from util', () => {
    mockCallHandler.handle.mockReturnValue(of('test'));
    interceptor.intercept(mockContext, mockCallHandler).subscribe();
    expect(operationNameUtil.get).toHaveBeenCalledWith(mockContext);
  });
});
