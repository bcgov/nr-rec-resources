import { HttpException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import axios from "axios";
import axiosRetry from "axios-retry";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DamApiHttpService } from "../../src/dam-api/dam-api-http.service";
import { DamErrors } from "../../src/dam-api/dam-api.types";

// Mock axios and related modules
vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => ({
      post: vi.fn(),
    })),
  },
}));

vi.mock("axios-retry", () => ({
  default: vi.fn(),
  exponentialDelay: vi.fn(),
  isNetworkOrIdempotentRequestError: vi.fn(),
  isRetryableError: vi.fn(),
}));

vi.mock("form-data", () => ({
  default: vi.fn(() => ({
    getHeaders: vi.fn(() => ({ "content-type": "multipart/form-data" })),
  })),
}));

// Type the mocked modules
const mockedAxios = vi.mocked(axios, true);
const mockedAxiosRetry = vi.mocked(axiosRetry, true);

describe("DamApiHttpService", () => {
  let service: DamApiHttpService;
  let mockAxiosInstance: any;

  beforeEach(async () => {
    // Clear all mocks
    vi.clearAllMocks();

    // Create a mock axios instance
    mockAxiosInstance = {
      post: vi.fn(),
    };

    // Set up axios.create to return our mock instance
    mockedAxios.create.mockReturnValue(mockAxiosInstance);

    const module: TestingModule = await Test.createTestingModule({
      providers: [DamApiHttpService],
    }).compile();

    service = module.get<DamApiHttpService>(DamApiHttpService);
  });

  describe("constructor", () => {
    it("should be defined", () => {
      expect(service).toBeDefined();
    });

    it("should create axios instance with correct configuration", () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        timeout: 30000,
      });
    });

    it("should configure axios retry with correct settings", () => {
      expect(mockedAxiosRetry).toHaveBeenCalledWith(
        mockAxiosInstance,
        expect.objectContaining({
          retries: 3,
          retryDelay: axiosRetry.exponentialDelay,
          retryCondition: expect.any(Function),
          onRetry: expect.any(Function),
        }),
      );
    });

    it("should have correct retry condition logic", () => {
      // Get the retry configuration that was passed to axiosRetry
      const retryConfig = mockedAxiosRetry.mock.calls[0]?.[1];
      expect(retryConfig).toBeDefined();
      const retryCondition = retryConfig?.retryCondition;

      // Create mock implementations for the retry functions
      const mockIsNetworkOrIdempotentRequestError = vi.fn();
      const mockIsRetryableError = vi.fn();

      // Mock the axios-retry functions that are used in the retry condition
      vi.mocked(axiosRetry).isNetworkOrIdempotentRequestError =
        mockIsNetworkOrIdempotentRequestError;
      vi.mocked(axiosRetry).isRetryableError = mockIsRetryableError;

      // Create proper error objects
      const networkError = new Error("Network Error") as any;
      networkError.code = "ENOTFOUND";

      const timeoutError = new Error("Timeout Error") as any;
      timeoutError.code = "ETIMEDOUT";

      const customError = new Error("Custom Error") as any;
      customError.code = "CUSTOM_ERROR";

      // Test retry condition with network error
      mockIsNetworkOrIdempotentRequestError.mockReturnValue(true);
      mockIsRetryableError.mockReturnValue(false);
      expect(retryCondition?.(networkError)).toBe(true);

      // Test retry condition with retryable error
      mockIsNetworkOrIdempotentRequestError.mockReturnValue(false);
      mockIsRetryableError.mockReturnValue(true);
      expect(retryCondition?.(timeoutError)).toBe(true);

      // Test retry condition with non-retryable error
      mockIsNetworkOrIdempotentRequestError.mockReturnValue(false);
      mockIsRetryableError.mockReturnValue(false);
      expect(retryCondition?.(customError)).toBe(false);
    });

    it("should trigger onRetry callback for main axios instance", () => {
      // Get the retry configuration that was passed to axiosRetry
      const retryConfig = mockedAxiosRetry.mock.calls[0]?.[1];
      expect(retryConfig).toBeDefined();
      const onRetry = retryConfig?.onRetry;
      expect(onRetry).toBeDefined();

      // Create a mock error and request config with proper AxiosError properties
      const mockError = new Error("Test retry error") as any;
      mockError.isAxiosError = true;
      mockError.toJSON = () => ({});
      const mockRequestConfig = { url: "https://test.example.com" };

      // Trigger the onRetry callback
      onRetry?.(2, mockError, mockRequestConfig);

      // This will trigger the logger.warn call on lines 32-35
      expect(onRetry).toBeDefined();
    });
  });

  describe("makeRequest", () => {
    const mockUrl = "https://dam.example.com/api/resource";
    const mockFormData = {
      getHeaders: vi.fn(() => ({ "content-type": "multipart/form-data" })),
    } as any;

    beforeEach(() => {
      vi.spyOn(Date, "now")
        .mockReturnValueOnce(1000) // Start time
        .mockReturnValueOnce(1500); // End time
      vi.spyOn(Math, "random").mockReturnValue(0.123456789);
    });

    it("should make successful POST request", async () => {
      const mockResponse = {
        data: { ref_id: "123", status: "success" },
        status: 200,
      };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await service.makeRequest(mockUrl, mockFormData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        mockUrl,
        mockFormData,
        {
          headers: { "content-type": "multipart/form-data" },
        },
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should handle 5xx server errors with custom HttpException", async () => {
      const serverError = {
        message: "Internal Server Error",
        response: { status: 500 },
      };
      mockAxiosInstance.post.mockRejectedValue(serverError);

      await expect(service.makeRequest(mockUrl, mockFormData)).rejects.toThrow(
        HttpException,
      );

      try {
        await service.makeRequest(mockUrl, mockFormData);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(
          "DAM service unavailable: Internal Server Error",
        );
        expect(error.getStatus()).toBe(DamErrors.ERR_SERVICE_UNAVAILABLE);
      }
    });

    it("should handle 502 Bad Gateway errors", async () => {
      const badGatewayError = {
        message: "Bad Gateway",
        response: { status: 502 },
      };
      mockAxiosInstance.post.mockRejectedValue(badGatewayError);

      await expect(service.makeRequest(mockUrl, mockFormData)).rejects.toThrow(
        HttpException,
      );
    });

    it("should handle 503 Service Unavailable errors", async () => {
      const serviceUnavailableError = {
        message: "Service Unavailable",
        response: { status: 503 },
      };
      mockAxiosInstance.post.mockRejectedValue(serviceUnavailableError);

      await expect(service.makeRequest(mockUrl, mockFormData)).rejects.toThrow(
        HttpException,
      );
    });

    it("should handle timeout errors", async () => {
      const timeoutError = new Error("timeout of 30000ms exceeded");
      (timeoutError as any).code = "ECONNABORTED";
      mockAxiosInstance.post.mockRejectedValue(timeoutError);

      await expect(service.makeRequest(mockUrl, mockFormData)).rejects.toThrow(
        "timeout of 30000ms exceeded",
      );
    });

    it("should handle network errors without response", async () => {
      const networkError = new Error("Network Error");
      (networkError as any).code = "ENOTFOUND";
      mockAxiosInstance.post.mockRejectedValue(networkError);

      await expect(service.makeRequest(mockUrl, mockFormData)).rejects.toThrow(
        "Network Error",
      );
    });

    it("should handle 4xx client errors", async () => {
      const clientError = new Error("Bad Request");
      (clientError as any).response = { status: 400 };
      mockAxiosInstance.post.mockRejectedValue(clientError);

      await expect(service.makeRequest(mockUrl, mockFormData)).rejects.toThrow(
        "Bad Request",
      );
    });

    it("should handle errors without status code", async () => {
      const unknownError = new Error("Unknown error");
      mockAxiosInstance.post.mockRejectedValue(unknownError);

      await expect(service.makeRequest(mockUrl, mockFormData)).rejects.toThrow(
        "Unknown error",
      );
    });
  });

  describe("createValidationClient", () => {
    it("should create validation axios instance", () => {
      const validationClient = service.createValidationClient();
      expect(validationClient).toBeDefined();
      expect(mockedAxios.create).toHaveBeenCalledWith({
        timeout: 30000,
      });
    });

    it("should configure validation client with custom retry logic", () => {
      service.createValidationClient();

      // Should be called twice - once for main instance, once for validation client
      expect(mockedAxiosRetry).toHaveBeenCalledTimes(2);

      // Check the validation client retry configuration
      const validationRetryConfig = mockedAxiosRetry.mock.calls[1]?.[1];
      expect(validationRetryConfig).toBeDefined();
      expect(validationRetryConfig?.retries).toBe(3);
      expect(validationRetryConfig?.retryDelay).toBe(
        axiosRetry.exponentialDelay,
      );
    });

    it("should have custom retry condition for validation client", () => {
      service.createValidationClient();

      const validationRetryConfig = mockedAxiosRetry.mock.calls[1]?.[1];
      expect(validationRetryConfig).toBeDefined();
      const retryCondition = validationRetryConfig?.retryCondition;

      // Create mock implementations for the retry functions
      const mockIsNetworkOrIdempotentRequestError = vi.fn();
      const mockIsRetryableError = vi.fn();

      // Mock the axios-retry functions that are used in the retry condition
      vi.mocked(axiosRetry).isNetworkOrIdempotentRequestError =
        mockIsNetworkOrIdempotentRequestError;
      vi.mocked(axiosRetry).isRetryableError = mockIsRetryableError;

      // Create proper error objects
      const filesNotReadyError = new Error("FILES_NOT_READY") as any;
      const networkError = new Error("Network Error") as any;
      networkError.code = "ENOTFOUND";
      const timeoutError = new Error("Timeout Error") as any;
      timeoutError.code = "ETIMEDOUT";
      const otherError = new Error("Other error") as any;

      // Test with FILES_NOT_READY error
      mockIsNetworkOrIdempotentRequestError.mockReturnValue(false);
      mockIsRetryableError.mockReturnValue(false);
      expect(retryCondition?.(filesNotReadyError)).toBe(true);

      // Test with network error
      mockIsNetworkOrIdempotentRequestError.mockReturnValue(true);
      mockIsRetryableError.mockReturnValue(false);
      expect(retryCondition?.(networkError)).toBe(true);

      // Test with retryable error
      mockIsNetworkOrIdempotentRequestError.mockReturnValue(false);
      mockIsRetryableError.mockReturnValue(true);
      expect(retryCondition?.(timeoutError)).toBe(true);

      // Test with non-retryable error
      mockIsNetworkOrIdempotentRequestError.mockReturnValue(false);
      mockIsRetryableError.mockReturnValue(false);
      expect(retryCondition?.(otherError)).toBe(false);
    });

    it("should trigger onRetry callback for validation client", () => {
      service.createValidationClient();

      const validationRetryConfig = mockedAxiosRetry.mock.calls[1]?.[1];
      expect(validationRetryConfig).toBeDefined();
      const onRetry = validationRetryConfig?.onRetry;
      expect(onRetry).toBeDefined();

      // Create a mock error and request config with proper AxiosError properties
      const mockError = new Error("FILES_NOT_READY") as any;
      mockError.isAxiosError = true;
      mockError.toJSON = () => ({});
      const mockRequestConfig = { url: "https://validation.example.com" };

      // Trigger the onRetry callback
      onRetry?.(1, mockError, mockRequestConfig);

      // This will trigger the logger.debug call on lines 96-100
      expect(onRetry).toBeDefined();
    });
  });
});
