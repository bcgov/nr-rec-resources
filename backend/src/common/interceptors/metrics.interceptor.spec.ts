import { Test, type TestingModule } from "@nestjs/testing";
import { Reflector } from "@nestjs/core";
import { CallHandler, ExecutionContext } from "@nestjs/common";
import { Observable, of } from "rxjs";
import { createMetricsLogger } from "aws-embedded-metrics";
import { MetricsInterceptor } from "./metrics.interceptor";
import type { Request, Response } from "express";

// Mock the aws-embedded-metrics module
vi.mock("aws-embedded-metrics", () => ({
  createMetricsLogger: vi.fn(() => ({
    setNamespace: vi.fn().mockReturnThis(),
    putMetric: vi.fn().mockReturnThis(),
    setDimensions: vi.fn().mockReturnThis(),
    setProperty: vi.fn().mockReturnThis(),
    flush: vi.fn().mockResolvedValue(undefined),
  })),
  Unit: {
    Milliseconds: "Milliseconds",
    Count: "Count",
  },
}));

describe("MetricsInterceptor", () => {
  let interceptor: MetricsInterceptor;
  let reflector: Reflector;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;
  let mockRequest: Request;
  let mockResponse: Response;
  const mockMetricsLogger = {
    setNamespace: vi.fn().mockReturnThis(),
    putMetric: vi.fn().mockReturnThis(),
    setDimensions: vi.fn().mockReturnThis(),
    setProperty: vi.fn().mockReturnThis(),
    flush: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetricsInterceptor,
        {
          provide: Reflector,
          useValue: {
            get: vi.fn(),
          },
        },
      ],
    }).compile();

    interceptor = module.get<MetricsInterceptor>(MetricsInterceptor);
    reflector = module.get<Reflector>(Reflector);

    // Mock ExecutionContext
    mockRequest = {
      method: "GET",
      headers: { "user-agent": "Test Agent" },
      ip: "127.0.0.1",
      path: "/test",
    } as unknown as Request;
    mockResponse = {
      statusCode: 200,
    } as unknown as Response;
    mockExecutionContext = {
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: vi.fn().mockReturnValue(mockRequest),
        getResponse: vi.fn().mockReturnValue(mockResponse),
      }),
      getHandler: vi.fn().mockReturnValue({ name: "testHandler" }),
      getClass: vi.fn().mockReturnValue({ name: "TestController" }),
    } as unknown as ExecutionContext;

    // Mock CallHandler
    mockCallHandler = {
      handle: vi.fn().mockReturnValue(of({})),
    };

    // Reset the mock for createMetricsLogger before each test
    (createMetricsLogger as ReturnType<typeof vi.fn>).mockReturnValue(
      mockMetricsLogger,
    );
  });

  it("should be defined", () => {
    expect(interceptor).toBeDefined();
  });

  describe("getOperationName", () => {
    it("should return the operation name from the reflector if defined", () => {
      const apiOperation = { operationId: "customOperationId" };
      (reflector.get as ReturnType<typeof vi.fn>).mockReturnValue(apiOperation);
      expect(interceptor["getOperationName"](mockExecutionContext)).toBe(
        "customOperationId",
      );
      expect(reflector.get).toHaveBeenCalledWith("swagger/apiOperation", {
        name: "testHandler",
      });
    });

    it("should return the controller and handler name if operationName is not defined in reflector", () => {
      (reflector.get as ReturnType<typeof vi.fn>).mockReturnValue(undefined);
      expect(interceptor["getOperationName"](mockExecutionContext)).toBe(
        "TestController.testHandler",
      );
    });
  });

  describe("logMetrics", () => {
    it("should log metrics for a successful request", async () => {
      const metrics = createMetricsLogger();
      const operationName = "TestController.testHandler";
      const latency = 100;

      await interceptor["logMetrics"](
        operationName,
        mockRequest,
        mockResponse,
        latency,
      );

      expect(metrics.setNamespace).toHaveBeenCalledWith(
        "RecreationSitesAndTrailsBCAPI",
      );
      expect(metrics.putMetric).toHaveBeenCalledWith(
        "Latency",
        latency,
        "Milliseconds",
      );
      expect(metrics.putMetric).toHaveBeenCalledWith(
        "StatusCode_200",
        1,
        "Count",
      );
      expect(metrics.setDimensions).toHaveBeenCalledWith({
        Operation: operationName,
        Method: "GET",
        StatusCode: "200",
      });
      expect(metrics.setProperty).toHaveBeenCalledWith(
        "UserAgent",
        "Test Agent",
      );
      expect(metrics.setProperty).toHaveBeenCalledWith("ClientIp", "127.0.0.1");
      expect(metrics.setProperty).toHaveBeenCalledWith("Path", "/test");
      expect(metrics.putMetric).not.toHaveBeenCalledWith(
        "ErrorCount",
        1,
        "Count",
      );
      expect(metrics.setProperty).not.toHaveBeenCalledWith(
        "ErrorType",
        expect.any(String),
      );
      expect(metrics.flush).toHaveBeenCalled();
    });

    it("should log metrics for a client error (4xx)", async () => {
      mockResponse.statusCode = 400;
      const metrics = createMetricsLogger();
      const operationName = "TestController.testHandler";
      const latency = 50;

      await interceptor["logMetrics"](
        operationName,
        mockRequest,
        mockResponse,
        latency,
      );

      expect(metrics.putMetric).toHaveBeenCalledWith(
        "StatusCode_400",
        1,
        "Count",
      );
      expect(metrics.putMetric).toHaveBeenCalledWith("ErrorCount", 1, "Count");
      expect(metrics.setProperty).toHaveBeenCalledWith(
        "ErrorType",
        "ClientError",
      );
      expect(metrics.flush).toHaveBeenCalled();
    });

    it("should log metrics for a server error (5xx)", async () => {
      mockResponse.statusCode = 503;
      const metrics = createMetricsLogger();
      const operationName = "TestController.testHandler";
      const latency = 200;

      await interceptor["logMetrics"](
        operationName,
        mockRequest,
        mockResponse,
        latency,
      );

      expect(metrics.putMetric).toHaveBeenCalledWith(
        "StatusCode_503",
        1,
        "Count",
      );
      expect(metrics.putMetric).toHaveBeenCalledWith("ErrorCount", 1, "Count");
      expect(metrics.setProperty).toHaveBeenCalledWith(
        "ErrorType",
        "ServerError",
      );
      expect(metrics.flush).toHaveBeenCalled();
    });

    it("should handle errors during metrics flushing", async () => {
      const metrics = createMetricsLogger();
      const operationName = "TestController.testHandler";
      const latency = 75;
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      (metrics.flush as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Failed to flush"),
      );

      await interceptor["logMetrics"](
        operationName,
        mockRequest,
        mockResponse,
        latency,
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to flush CloudWatch metrics:",
        new Error("Failed to flush"),
      );
      consoleErrorSpy.mockRestore();
    });
  });

  describe("getErrorType", () => {
    it('should return "ServerError" for status codes >= 500', () => {
      expect(interceptor["getErrorType"](500)).toBe("ServerError");
      expect(interceptor["getErrorType"](503)).toBe("ServerError");
    });

    it('should return "ClientError" for status codes >= 400 and < 500', () => {
      expect(interceptor["getErrorType"](400)).toBe("ClientError");
      expect(interceptor["getErrorType"](404)).toBe("ClientError");
    });

    it('should return "Unknown" for status codes < 400', () => {
      expect(interceptor["getErrorType"](200)).toBe("Unknown");
      expect(interceptor["getErrorType"](302)).toBe("Unknown");
    });
  });

  describe("intercept", () => {
    it("should call next.handle", () => {
      interceptor.intercept(mockExecutionContext, mockCallHandler);
      expect(mockCallHandler.handle).toHaveBeenCalled();
    });

    it("should log metrics after the handler completes", async () => {
      const startTime = Date.now();
      await interceptor
        .intercept(mockExecutionContext, mockCallHandler)
        .toPromise();
      const endTime = Date.now();
      const latency = endTime - startTime;

      expect(createMetricsLogger).toHaveBeenCalled();
      expect(mockMetricsLogger.setNamespace).toHaveBeenCalledWith(
        "RecreationSitesAndTrailsBCAPI",
      );
      expect(mockMetricsLogger.putMetric).toHaveBeenCalledWith(
        "Latency",
        expect.any(Number),
        "Milliseconds",
      );
      expect(mockMetricsLogger.putMetric).toHaveBeenCalledWith(
        "StatusCode_200",
        1,
        "Count",
      );
      expect(mockMetricsLogger.setDimensions).toHaveBeenCalledWith({
        Operation: "TestController.testHandler",
        Method: "GET",
        StatusCode: "200",
      });
      expect(mockMetricsLogger.setProperty).toHaveBeenCalledWith(
        "UserAgent",
        "Test Agent",
      );
      expect(mockMetricsLogger.setProperty).toHaveBeenCalledWith(
        "ClientIp",
        "127.0.0.1",
      );
      expect(mockMetricsLogger.setProperty).toHaveBeenCalledWith(
        "Path",
        "/test",
      );
      expect(mockMetricsLogger.flush).toHaveBeenCalled();
      expect(latency).toBeGreaterThanOrEqual(0);
    });

    it("should use the operation name from reflector if available", async () => {
      const apiOperation = { operationId: "customOperationId" };
      (reflector.get as ReturnType<typeof vi.fn>).mockReturnValue(apiOperation);
      await interceptor
        .intercept(mockExecutionContext, mockCallHandler)
        .toPromise();
      expect(mockMetricsLogger.setDimensions).toHaveBeenCalledWith(
        expect.objectContaining({ Operation: apiOperation.operationId }),
      );
    });

    it("should handle errors in the observable pipeline", async () => {
      const error = new Error("Test Error");
      mockCallHandler.handle = vi.fn().mockReturnValue(
        new Observable((subscriber) => {
          subscriber.error(error);
        }),
      );
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      try {
        await interceptor
          .intercept(mockExecutionContext, mockCallHandler)
          .toPromise();
      } catch (e) {
        expect(e).toBe(error);
      }

      // Metrics should still attempt to be logged on error
      expect(createMetricsLogger).toHaveBeenCalled();
      expect(mockMetricsLogger.setNamespace).toHaveBeenCalledWith(
        "RecreationSitesAndTrailsBCAPI",
      );
      expect(mockMetricsLogger.putMetric).toHaveBeenCalledWith(
        "Latency",
        expect.any(Number),
        "Milliseconds",
      );
      // Default status code on error might vary, but the logic should still execute
      expect(mockMetricsLogger.putMetric).toHaveBeenCalledWith(
        `StatusCode_${mockResponse.statusCode}`,
        1,
        "Count",
      );
      expect(mockMetricsLogger.setDimensions).toHaveBeenCalledWith({
        Operation: "TestController.testHandler",
        Method: "GET",
        StatusCode: mockResponse.statusCode.toString(),
      });
      expect(mockMetricsLogger.setProperty).toHaveBeenCalledWith(
        "UserAgent",
        "Test Agent",
      );
      expect(mockMetricsLogger.setProperty).toHaveBeenCalledWith(
        "ClientIp",
        "127.0.0.1",
      );
      expect(mockMetricsLogger.setProperty).toHaveBeenCalledWith(
        "Path",
        "/test",
      );
      expect(mockMetricsLogger.flush).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });
});
