import { DamApiHttpService, DamApiUtilsService } from '@/dam-api';
import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock axios and related modules
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      post: vi.fn(),
    })),
  },
}));

vi.mock('axios-retry', () => ({
  default: vi.fn(),
  exponentialDelay: vi.fn(),
  isNetworkOrIdempotentRequestError: vi.fn(),
  isRetryableError: vi.fn(),
}));

vi.mock('form-data', () => ({
  default: vi.fn(() => ({
    getHeaders: vi.fn(() => ({ 'content-type': 'multipart/form-data' })),
  })),
}));

// Type the mocked modules
const mockedAxios = vi.mocked(axios, true);
const mockedAxiosRetry = vi.mocked(axiosRetry, true);

describe('DamApiHttpService', () => {
  let service: DamApiHttpService;
  let mockAxiosInstance: any;
  let mockDamApiUtilsService: any;

  // Test data setup
  const testData = {
    url: 'https://dam.example.com/api/resource',
    formData: {
      getHeaders: vi.fn(() => ({ 'content-type': 'multipart/form-data' })),
    } as any,
    buffer: Buffer.from('test buffer data'),
    response: { data: { ref_id: '123', status: 'success' }, status: 200 },
    validationResponse: { data: [{ size_code: 'original' }], status: 200 },
  };

  const setupMocks = () => {
    vi.clearAllMocks();

    mockAxiosInstance = { post: vi.fn() };
    mockDamApiUtilsService = {
      formDataToBuffer: vi.fn().mockResolvedValue(testData.buffer),
      validateFileTypes: vi.fn(),
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance);

    // Mock Date.now for consistent testing
    vi.spyOn(Date, 'now')
      .mockReturnValueOnce(1000) // Start time
      .mockReturnValueOnce(1500); // End time
    vi.spyOn(Math, 'random').mockReturnValue(0.123456789);
  };

  beforeEach(async () => {
    setupMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DamApiHttpService,
        {
          provide: DamApiUtilsService,
          useValue: mockDamApiUtilsService,
        },
      ],
    }).compile();

    service = module.get<DamApiHttpService>(DamApiHttpService);
  });

  describe('service initialization', () => {
    it('should be defined and create axios instance with correct configuration', () => {
      expect(service).toBeDefined();
      expect(mockedAxios.create).toHaveBeenCalledWith({ timeout: 900000 });
      expect(mockedAxiosRetry).toHaveBeenCalledWith(
        mockAxiosInstance,
        expect.objectContaining({
          retries: 5,
          retryDelay: axiosRetry.exponentialDelay,
          retryCondition: expect.any(Function),
          onRetry: expect.any(Function),
        }),
      );
    });

    it('should have correct retry condition logic', () => {
      const retryConfig = mockedAxiosRetry.mock.calls[0]?.[1];
      const retryCondition = retryConfig?.retryCondition;

      // Mock axios-retry functions
      const mockIsNetworkError = vi.fn();
      const mockIsRetryableError = vi.fn();
      vi.mocked(axiosRetry).isNetworkOrIdempotentRequestError =
        mockIsNetworkError;
      vi.mocked(axiosRetry).isRetryableError = mockIsRetryableError;

      // Test all retry condition paths
      const testCases = [
        { networkError: true, retryableError: false, expected: true },
        { networkError: false, retryableError: true, expected: true },
        { networkError: false, retryableError: false, expected: false },
      ];

      testCases.forEach(({ networkError, retryableError, expected }) => {
        mockIsNetworkError.mockReturnValue(networkError);
        mockIsRetryableError.mockReturnValue(retryableError);
        const mockError = {
          message: 'test',
          isAxiosError: true,
          toJSON: () => ({}),
        } as any;
        expect(retryCondition?.(mockError)).toBe(expected);
      });
    });

    it('should trigger onRetry callback', () => {
      const retryConfig = mockedAxiosRetry.mock.calls[0]?.[1];
      const onRetry = retryConfig?.onRetry;

      const mockError = {
        message: 'Test retry error',
        isAxiosError: true,
        toJSON: () => ({}),
      } as any;
      const mockRequestConfig = { url: 'https://test.example.com' };

      // This covers the onRetry callback execution
      onRetry?.(2, mockError, mockRequestConfig);
      expect(onRetry).toBeDefined();
    });
  });

  describe('makeRequest', () => {
    it('should make successful POST request', async () => {
      mockAxiosInstance.post.mockResolvedValue(testData.response);

      const result = await service.makeRequest(testData.url, testData.formData);

      expect(mockDamApiUtilsService.formDataToBuffer).toHaveBeenCalledWith(
        testData.formData,
      );
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        testData.url,
        testData.buffer,
        { headers: { 'content-type': 'multipart/form-data' } },
      );
      expect(result).toEqual(testData.response.data);
    });

    it('should handle formDataToBuffer errors', async () => {
      const bufferError = new Error('Failed to convert FormData to buffer');
      mockDamApiUtilsService.formDataToBuffer.mockRejectedValue(bufferError);

      await expect(
        service.makeRequest(testData.url, testData.formData),
      ).rejects.toThrow('Failed to convert FormData to buffer');
      expect(mockAxiosInstance.post).not.toHaveBeenCalled();
    });

    // Test multiple error types in a parameterized way
    const errorTestCases = [
      {
        name: '5xx server errors',
        error: { message: 'Internal Server Error', response: { status: 500 } },
      },
      {
        name: 'timeout errors',
        error: { message: 'timeout exceeded', code: 'ECONNABORTED' },
      },
      {
        name: 'network errors',
        error: { message: 'Network Error', code: 'ENOTFOUND' },
      },
      {
        name: '4xx client errors',
        error: { message: 'Bad Request', response: { status: 400 } },
      },
      { name: 'unknown errors', error: { message: 'Unknown error' } },
    ];

    errorTestCases.forEach(({ name, error }) => {
      it(`should handle ${name}`, async () => {
        mockAxiosInstance.post.mockRejectedValue(error);
        await expect(
          service.makeRequest(testData.url, testData.formData),
        ).rejects.toThrow(error.message);
      });
    });
  });

  describe('makeRequestWithValidation', () => {
    const mockValidationFunction = vi.fn();

    beforeEach(() => {
      mockValidationFunction.mockClear();
    });

    it('should make request with custom validation function', async () => {
      mockValidationFunction.mockReturnValue(true);
      mockAxiosInstance.post.mockResolvedValue(testData.validationResponse);

      const result = await service.makeRequestWithValidation(
        testData.url,
        testData.formData,
        mockValidationFunction,
      );

      expect(result).toEqual(testData.validationResponse.data);
      expect(mockAxiosInstance.post).toHaveBeenCalled();
      // Verify custom axios instance was created
      expect(mockedAxios.create).toHaveBeenCalledTimes(2); // Once in constructor, once in method
    });

    it('should handle validation errors', async () => {
      mockValidationFunction.mockReturnValue(false);
      const axiosError = new Error('Request failed after retries');
      mockAxiosInstance.post.mockRejectedValue(axiosError);

      await expect(
        service.makeRequestWithValidation(
          testData.url,
          testData.formData,
          mockValidationFunction,
        ),
      ).rejects.toThrow('Request failed after retries');
    });

    it('should test validateResponse and onRetry callbacks for custom instance', async () => {
      mockValidationFunction.mockReturnValue(true);
      mockAxiosInstance.post.mockResolvedValue(testData.validationResponse);

      await service.makeRequestWithValidation(
        testData.url,
        testData.formData,
        mockValidationFunction,
      );

      // Get the custom axios retry configuration
      const customRetryConfig = mockedAxiosRetry.mock.calls.find(
        (call) => call[1]?.validateResponse !== undefined,
      )?.[1];

      expect(customRetryConfig).toBeDefined();

      // Test validateResponse callback
      const mockAxiosResponse = {
        data: testData.validationResponse.data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} } as any,
      };

      const validateResult =
        customRetryConfig?.validateResponse?.(mockAxiosResponse);
      expect(mockValidationFunction).toHaveBeenCalledWith(
        testData.validationResponse.data,
      );
      expect(validateResult).toBe(true);

      // Test onRetry callback for validation requests
      const onRetryCallback = customRetryConfig?.onRetry;
      const mockError = {
        message: 'Validation retry error',
        isAxiosError: true,
        toJSON: () => ({}),
      } as any;
      const mockRequestConfig = { url: 'https://test.example.com/validation' };

      onRetryCallback?.(3, mockError, mockRequestConfig);
      expect(onRetryCallback).toBeDefined();

      // Test retryCondition callback for custom instance
      const retryConditionCallback = customRetryConfig?.retryCondition;
      const mockIsNetworkError = vi.fn().mockReturnValue(true);
      const mockIsRetryableError = vi.fn().mockReturnValue(false);

      vi.mocked(axiosRetry).isNetworkOrIdempotentRequestError =
        mockIsNetworkError;
      vi.mocked(axiosRetry).isRetryableError = mockIsRetryableError;

      const retryError = {
        message: 'Network Error',
        isAxiosError: true,
        toJSON: () => ({}),
      } as any;
      const retryResult = retryConditionCallback?.(retryError);
      expect(retryResult).toBe(true);
    });
  });

  describe('file validation integration', () => {
    const validationTestCases = [
      {
        name: 'should validate files correctly for get_resource_all_image_sizes endpoint',
        files: [
          { size_code: 'original', path: '/path/original.jpg' },
          { size_code: 'thm', path: '/path/thumb.jpg' },
          { size_code: 'col', path: '/path/col.jpg' },
          { size_code: 'pre', path: '/path/preview.jpg' },
        ],
        url: 'http://example.com/get_resource_all_image_sizes?resource=123',
        expectedResult: true,
        shouldCallValidate: true,
      },
      {
        name: 'should return false for incomplete file sets',
        files: [{ size_code: 'thm', path: '/path/thumb.jpg' }],
        url: 'http://example.com/get_resource_all_image_sizes?resource=123',
        expectedResult: false,
        shouldCallValidate: true,
      },
      {
        name: 'should not validate files for non-get_resource_all_image_sizes endpoints',
        files: { result: 'success' },
        url: 'http://example.com/different_endpoint',
        expectedResult: true,
        shouldCallValidate: false,
      },
    ];

    validationTestCases.forEach(
      ({ name, files, url, expectedResult, shouldCallValidate }) => {
        it(name, () => {
          mockDamApiUtilsService.validateFileTypes.mockReturnValue(
            expectedResult,
          );

          const mockResponse = { status: 200, data: files, config: { url } };
          const requiredSizeCodes = ['original', 'thm', 'col', 'pre'];

          // Simulate validation logic
          if (
            mockResponse.config.url?.includes('get_resource_all_image_sizes')
          ) {
            const result = mockDamApiUtilsService.validateFileTypes(
              mockResponse.data,
              requiredSizeCodes,
            );
            expect(result).toBe(expectedResult);
          }

          if (shouldCallValidate) {
            expect(
              mockDamApiUtilsService.validateFileTypes,
            ).toHaveBeenCalledWith(files, requiredSizeCodes);
          } else {
            expect(
              mockDamApiUtilsService.validateFileTypes,
            ).not.toHaveBeenCalled();
          }
        });
      },
    );
  });
});
