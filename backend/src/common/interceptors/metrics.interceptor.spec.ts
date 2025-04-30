import { Test, type TestingModule } from "@nestjs/testing";
import { Reflector } from "@nestjs/core";
import { CallHandler, ExecutionContext } from "@nestjs/common";
import { of } from "rxjs";
import { MetricsInterceptor } from "./metrics.interceptor";
import type { Request, Response } from "express";
import { ConfigService } from "@nestjs/config";
import {
  CloudWatchClient,
  PutMetricDataCommand,
  StandardUnit,
} from "@aws-sdk/client-cloudwatch";
import { mockClient } from "aws-sdk-client-mock"; // Mock the AWS SDK v3 CloudWatchClient

// Mock the AWS SDK v3 CloudWatchClient
const cloudWatchMock = mockClient(CloudWatchClient);

describe("MetricsInterceptor", () => {
  let interceptor: MetricsInterceptor;
  let reflector: Reflector;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;
  let mockRequest: Request;
  let mockResponse: Response;

  beforeEach(async () => {
    cloudWatchMock.reset();

    const configServiceMock = {
      get: vi.fn((key: string) => {
        if (key === "NODE_ENV") {
          return "production"; // Default to production (metrics enabled)
        }
        return undefined;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetricsInterceptor,
        {
          provide: Reflector,
          useValue: {
            get: vi.fn(),
          },
        },
        {
          // Provide a mock ConfigService
          provide: ConfigService,
          useValue: configServiceMock,
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
      // Directly mock the get method as used in getOperationName
      get: vi.fn((key: string, target: any) => {
        if (
          key === "swagger/apiOperation" &&
          target &&
          target.name === "testHandler"
        ) {
          return undefined;
        }
        return undefined;
      }),
    } as unknown as ExecutionContext;

    mockCallHandler = {
      handle: vi.fn().mockReturnValue(of({})), // Default successful response
    };
  });

  // Restore mocks after each test if needed (aws-sdk-client-mock handles reset)
  afterEach(() => {
    vi.clearAllMocks();
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
      const operationName = "TestController.testHandler";
      const latency = 100;
      mockResponse.statusCode = 200; // Ensure status code is 200

      await interceptor["logMetrics"](
        operationName,
        mockRequest,
        mockResponse,
        latency,
      );

      const commandCalls = cloudWatchMock.commandCalls(PutMetricDataCommand);
      expect(commandCalls.length).toBe(1); // Should send one command

      const putMetricDataInput = commandCalls[0].args[0].input;

      expect(putMetricDataInput.Namespace).toBe(
        "RecreationSitesAndTrailsBCAPI",
      );
      expect(putMetricDataInput.MetricData).toHaveLength(2); // RequestLatency, RequestCount

      const latencyMetric = putMetricDataInput.MetricData.find(
        (m) => m.MetricName === "RequestLatency",
      );
      expect(latencyMetric).toBeDefined();
      expect(latencyMetric.Value).toBe(latency);
      expect(latencyMetric.Unit).toBe(StandardUnit.Milliseconds);
      expect(latencyMetric.Dimensions).toEqual([
        { Name: "Operation", Value: operationName },
        { Name: "Method", Value: mockRequest.method },
        { Name: "StatusCode", Value: mockResponse.statusCode.toString() },
      ]);
      expect(latencyMetric.Timestamp).toBeInstanceOf(Date);

      const requestCountMetric = putMetricDataInput.MetricData.find(
        (m) => m.MetricName === "RequestCount",
      );
      expect(requestCountMetric).toBeDefined();
      expect(requestCountMetric.Value).toBe(1);
      expect(requestCountMetric.Unit).toBe(StandardUnit.Count);
      expect(requestCountMetric.Dimensions).toEqual([
        { Name: "Operation", Value: operationName },
        { Name: "StatusCode", Value: mockResponse.statusCode.toString() },
      ]);
      expect(requestCountMetric.Timestamp).toBeInstanceOf(Date);
    });

    it("should log metrics with ErrorCount for a client error (4xx)", async () => {
      mockResponse.statusCode = 404;
      const operationName = "TestController.testHandler";
      const latency = 50;

      await interceptor["logMetrics"](
        operationName,
        mockRequest,
        mockResponse,
        latency,
      );

      const commandCalls = cloudWatchMock.commandCalls(PutMetricDataCommand);
      expect(commandCalls.length).toBe(1);

      const putMetricDataInput = commandCalls[0].args[0].input;
      expect(putMetricDataInput.Namespace).toBe(
        "RecreationSitesAndTrailsBCAPI",
      );
      expect(putMetricDataInput.MetricData).toHaveLength(3); // Latency, RequestCount, ErrorCount

      const errorCountMetric = putMetricDataInput.MetricData.find(
        (m) => m.MetricName === "ErrorCount",
      );
      expect(errorCountMetric).toBeDefined();
      expect(errorCountMetric.Value).toBe(1);
      expect(errorCountMetric.Unit).toBe(StandardUnit.Count);
      expect(errorCountMetric.Dimensions).toEqual([
        { Name: "Operation", Value: operationName },
        { Name: "ErrorType", Value: "ClientError" },
      ]);
      expect(errorCountMetric.Timestamp).toBeInstanceOf(Date);

      // Also check the RequestCount dimension for the 4xx status
      const requestCountMetric = putMetricDataInput.MetricData.find(
        (m) => m.MetricName === "RequestCount",
      );
      expect(requestCountMetric.Dimensions).toContainEqual({
        Name: "StatusCode",
        Value: "404",
      });
    });

    it("should log metrics with ErrorCount for a server error (5xx)", async () => {
      mockResponse.statusCode = 503;
      const operationName = "TestController.testHandler";
      const latency = 200;

      await interceptor["logMetrics"](
        operationName,
        mockRequest,
        mockResponse,
        latency,
      );

      const commandCalls = cloudWatchMock.commandCalls(PutMetricDataCommand);
      expect(commandCalls.length).toBe(1);

      const putMetricDataInput = commandCalls[0].args[0].input;
      expect(putMetricDataInput.Namespace).toBe(
        "RecreationSitesAndTrailsBCAPI",
      );
      expect(putMetricDataInput.MetricData).toHaveLength(3); // Latency, RequestCount, ErrorCount

      const errorCountMetric = putMetricDataInput.MetricData.find(
        (m) => m.MetricName === "ErrorCount",
      );
      expect(errorCountMetric).toBeDefined();
      expect(errorCountMetric.Value).toBe(1);
      expect(errorCountMetric.Unit).toBe(StandardUnit.Count);
      expect(errorCountMetric.Dimensions).toEqual([
        { Name: "Operation", Value: operationName },
        { Name: "ErrorType", Value: "ServerError" },
      ]);
      expect(errorCountMetric.Timestamp).toBeInstanceOf(Date);

      // Also check the RequestCount dimension for the 5xx status
      const requestCountMetric = putMetricDataInput.MetricData.find(
        (m) => m.MetricName === "RequestCount",
      );
      expect(requestCountMetric.Dimensions).toContainEqual({
        Name: "StatusCode",
        Value: "503",
      });
    });

    it("should not log metrics if metricsEnabled is false", async () => {
      // Mock ConfigService to return 'local' for NODE_ENV
      const localConfigModule: TestingModule = await Test.createTestingModule({
        // <-- Module created HERE
        providers: [
          MetricsInterceptor,
          { provide: Reflector, useValue: { get: vi.fn() } },
          {
            provide: ConfigService,
            useValue: {
              // <-- ConfigService mock defined HERE
              get: vi.fn((key: string) => {
                if (key === "NODE_ENV") {
                  return "local"; // <-- Returns 'local' for NODE_ENV
                }
                return undefined;
              }),
            },
          },
        ],
      }).compile();

      const operationName = "TestController.testHandler";
      const latency = 100;
      mockResponse.statusCode = 200;

      const localInterceptor =
        localConfigModule.get<MetricsInterceptor>(MetricsInterceptor); // <-- Interceptor created HERE

      await localInterceptor["logMetrics"](
        operationName,
        mockRequest,
        mockResponse,
        latency,
      );

      // Verify that no CloudWatch commands were sent
      const commandCalls = cloudWatchMock.commandCalls(PutMetricDataCommand);
      expect(commandCalls.length).toBe(0);
    });

    it("should handle errors during metrics publishing", async () => {
      const operationName = "TestController.testHandler";
      const latency = 75;
      mockResponse.statusCode = 200;
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {}); // Silence console.error during test

      // Mock the CloudWatch send command to reject
      const publishError = new Error("Failed to publish to CloudWatch");
      cloudWatchMock.on(PutMetricDataCommand).rejects(publishError);

      await interceptor["logMetrics"](
        operationName,
        mockRequest,
        mockResponse,
        latency,
      );

      // Verify that the error was caught and logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to publish CloudWatch metrics:",
        publishError,
      );
      consoleErrorSpy.mockRestore(); // Restore original console.error
    });
  });

  describe("getErrorType", () => {
    // This method's logic is unchanged, so these tests remain the same
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

    it("should log metrics after the handler completes successfully", async () => {
      mockResponse.statusCode = 200;

      await interceptor
        .intercept(mockExecutionContext, mockCallHandler)
        .toPromise();

      // Verify that the logMetrics method was effectively called by checking CloudWatch mock
      const commandCalls = cloudWatchMock.commandCalls(PutMetricDataCommand);
      expect(commandCalls.length).toBe(1);

      const putMetricDataInput = commandCalls[0].args[0].input;
      expect(putMetricDataInput.Namespace).toBe(
        "RecreationSitesAndTrailsBCAPI",
      );
      expect(putMetricDataInput.MetricData).toHaveLength(2); // Latency, RequestCount

      const latencyMetric = putMetricDataInput.MetricData.find(
        (m) => m.MetricName === "RequestLatency",
      );
      expect(latencyMetric).toBeDefined();
      // Check that the logged latency is within a reasonable range
      expect(latencyMetric.Value).toBeGreaterThanOrEqual(0);
      // If mocking Date.now, assert the specific expected latency
      expect(latencyMetric.Unit).toBe(StandardUnit.Milliseconds);
      expect(latencyMetric.Dimensions).toEqual([
        { Name: "Operation", Value: "TestController.testHandler" },
        { Name: "Method", Value: "GET" },
        { Name: "StatusCode", Value: "200" },
      ]);

      const requestCountMetric = putMetricDataInput.MetricData.find(
        (m) => m.MetricName === "RequestCount",
      );
      expect(requestCountMetric).toBeDefined();
      expect(requestCountMetric.Value).toBe(1);
      expect(requestCountMetric.Unit).toBe(StandardUnit.Count);
      expect(requestCountMetric.Dimensions).toEqual([
        { Name: "Operation", Value: "TestController.testHandler" },
        { Name: "StatusCode", Value: "200" },
      ]);
    });
  });
});
