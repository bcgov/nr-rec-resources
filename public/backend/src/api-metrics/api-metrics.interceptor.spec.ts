import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { ClsModule } from "nestjs-cls";
import { of, throwError } from "rxjs";
import { ApiMetricsInterceptor } from "./api-metrics.interceptor";
import { ApiMetricsService } from "./api-metrics.service";
import { OperationNameUtil } from "./operation-name.util";
import { Mocked } from "vitest";

describe("ApiMetricsInterceptor", () => {
  let interceptor: ApiMetricsInterceptor;
  let apiMetricsService: ApiMetricsService;
  let operationNameUtil: OperationNameUtil;

  const mockSetResHeader = vi.fn();

  // Mock data
  const mockContext = {
    switchToHttp: vi.fn().mockReturnValue({
      getRequest: vi.fn().mockReturnValue({ method: "GET" }),
      getResponse: vi
        .fn()
        .mockReturnValue({ statusCode: 200, setHeader: mockSetResHeader }),
    }),
  } as unknown as ExecutionContext;

  const mockCallHandler = {
    handle: vi.fn(),
  } as Mocked<CallHandler>;

  const mockMetricDatum = [{ name: "test", value: 1 }];

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ClsModule],
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
            get: vi.fn().mockReturnValue("testOperation"),
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

  it("should be defined", () => {
    expect(interceptor).toBeDefined();
  });

  it("should handle successful requests", () => {
    mockCallHandler.handle.mockReturnValue(of("test"));
    vi.spyOn(Date, "now")
      .mockReturnValueOnce(1000) // Start time
      .mockReturnValueOnce(1500); // End time

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: () => {
        // Assert
        expect(apiMetricsService.buildMetricDatum).toHaveBeenCalledWith(
          "testOperation",
          "GET",
          200,
          500,
        );
        expect(apiMetricsService.publish).toHaveBeenCalledWith(mockMetricDatum);
        expect(mockSetResHeader).toHaveBeenCalledWith(
          "X-RST-Request-ID",
          expect.any(String),
        );
      },
    });
  });

  it("should handle HttpException errors", () => {
    const httpError = new HttpException("Test error", HttpStatus.BAD_REQUEST);
    mockCallHandler.handle.mockReturnValue(throwError(() => httpError));
    vi.spyOn(Date, "now").mockReturnValueOnce(1000).mockReturnValueOnce(1500);

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      error: (error) => {
        expect(apiMetricsService.buildMetricDatum).toHaveBeenCalledWith(
          "testOperation",
          "GET",
          400,
          500,
        );
        expect(apiMetricsService.publish).toHaveBeenCalledWith(mockMetricDatum);
        expect(error).toBe(httpError);
      },
    });
  });

  it("should handle non-HttpException errors", () => {
    const error = new Error("Test error");
    mockCallHandler.handle.mockReturnValue(throwError(() => error));
    vi.spyOn(Date, "now").mockReturnValueOnce(1000).mockReturnValueOnce(1500);

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      error: (err) => {
        expect(apiMetricsService.buildMetricDatum).toHaveBeenCalledWith(
          "testOperation",
          "GET",
          500,
          500,
        );
        expect(apiMetricsService.publish).toHaveBeenCalledWith(mockMetricDatum);
        expect(err).toBe(error);
      },
    });
  });

  it("should get operation name from util", () => {
    mockCallHandler.handle.mockReturnValue(of("test"));
    interceptor.intercept(mockContext, mockCallHandler).subscribe();
    expect(operationNameUtil.get).toHaveBeenCalledWith(mockContext);
  });

  it("should log and not throw if recordMetrics fails", async () => {
    // Arrange
    const error = new Error("publish failed");
    (apiMetricsService.publish as any).mockRejectedValueOnce(error);
    mockCallHandler.handle.mockReturnValue(of("test"));
    vi.spyOn(Date, "now").mockReturnValueOnce(1000).mockReturnValueOnce(1500);
    const loggerErrorSpy = vi.spyOn(interceptor["logger"], "error");

    // Act
    await new Promise((resolve) => {
      interceptor.intercept(mockContext, mockCallHandler).subscribe({
        next: () => {
          // Assert
          expect(apiMetricsService.buildMetricDatum).toHaveBeenCalled();
          expect(apiMetricsService.publish).toHaveBeenCalled();
          expect(loggerErrorSpy).toHaveBeenCalledWith(
            expect.stringContaining("Failed to record metrics"),
            error,
          );
          resolve(true);
        },
      });
    });
  });

  it("should set X-RST-Request-ID header with value from cls.getId", () => {
    // Arrange
    const fakeId = "fake-request-id";
    // Patch the interceptor's cls.getId method
    interceptor["cls"].getId = vi.fn().mockReturnValue(fakeId);
    mockCallHandler.handle.mockReturnValue(of("test"));

    // Act
    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: () => {
        // Assert
        expect(mockSetResHeader).toHaveBeenCalledWith(
          "X-RST-Request-ID",
          fakeId,
        );
      },
    });
  });

  it("should log error and rethrow on error in catchError", async () => {
    const error = new Error("fail");
    mockCallHandler.handle.mockReturnValue(throwError(() => error));
    vi.spyOn(Date, "now").mockReturnValueOnce(1000).mockReturnValueOnce(1500);
    const loggerErrorSpy = vi.spyOn(interceptor["logger"], "error");

    await new Promise((resolve) => {
      interceptor.intercept(mockContext, mockCallHandler).subscribe({
        error: (err) => {
          expect(loggerErrorSpy).toHaveBeenCalledWith(
            expect.stringContaining("Request failed"),
          );
          expect(err).toBe(error);
          resolve(true);
        },
      });
    });
  });

  it("should log request start and completion", async () => {
    const loggerLogSpy = vi.spyOn(interceptor["logger"], "log");
    mockCallHandler.handle.mockReturnValue(of("test"));
    vi.spyOn(Date, "now").mockReturnValueOnce(1000).mockReturnValueOnce(1500);

    await new Promise((resolve) => {
      interceptor.intercept(mockContext, mockCallHandler).subscribe({
        next: () => {
          expect(loggerLogSpy).toHaveBeenCalledWith(
            expect.stringContaining("Starting request"),
          );
          expect(loggerLogSpy).toHaveBeenCalledWith(
            expect.stringContaining("Request completed successfully"),
          );
          resolve(true);
        },
      });
    });
  });

  it("should log debug messages in recordMetrics", async () => {
    const loggerDebugSpy = vi.spyOn(interceptor["logger"], "debug");
    mockCallHandler.handle.mockReturnValue(of("test"));
    vi.spyOn(Date, "now").mockReturnValueOnce(1000).mockReturnValueOnce(1500);

    await new Promise((resolve) => {
      interceptor.intercept(mockContext, mockCallHandler).subscribe({
        next: () => {
          expect(loggerDebugSpy).toHaveBeenCalledWith(
            expect.stringContaining("Recording metrics"),
          );
          expect(loggerDebugSpy).toHaveBeenCalledWith(
            expect.stringContaining("Built"),
          );
          expect(loggerDebugSpy).toHaveBeenCalledWith(
            expect.stringContaining("Successfully published metrics"),
          );
          resolve(true);
        },
      });
    });
  });
});
