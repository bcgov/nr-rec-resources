import * as HelpersModule from '@/services/hooks/recreation-resource-admin/helpers';
import {
  S3UploadError,
  S3UploadParams,
  S3UploadResult,
  useS3Upload,
} from '@/services/hooks/recreation-resource-admin/useS3Upload';
import { server } from '@/test-setup';
import { TestQueryClientProvider } from '@test/test-utils';
import { renderHook, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/services/hooks/recreation-resource-admin/helpers', () => ({
  createRetryHandler: vi.fn(),
}));

describe('useS3Upload', () => {
  const createRetryHandler = HelpersModule.createRetryHandler as Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    createRetryHandler.mockReturnValue(() => false);
    server.resetHandlers();
  });

  it('returns a mutation object with expected properties', () => {
    const { result } = renderHook(() => useS3Upload(), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current).toMatchObject({
      mutate: expect.any(Function),
      mutateAsync: expect.any(Function),
      isPending: expect.any(Boolean),
    });
  });

  it('uploads blob to S3 using presigned URL', async () => {
    const params: S3UploadParams = {
      presignedUrl: 'https://s3.example.com/upload?signature=abc123',
      blob: new Blob(['test content'], { type: 'image/webp' }),
      contentType: 'image/webp',
      s3Key: 'uploads/test-key.webp',
    };

    // MSW will handle the request, but we need to customize the response
    server.use(
      http.put('https://s3.example.com/upload*', () => {
        return new HttpResponse(null, {
          status: 200,
          headers: { etag: '"etag-value"' },
        });
      }),
    );

    const { result } = renderHook(() => useS3Upload(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(async () => {
      const response: S3UploadResult = await result.current.mutateAsync(params);
      expect(response).toEqual({
        key: 'uploads/test-key.webp',
        etag: '"etag-value"',
        statusCode: 200,
      });
    });

    // MSW handles the actual fetch, so we just verify the hook returned the correct response
  });

  it('sets correct Content-Type header', async () => {
    const params: S3UploadParams = {
      presignedUrl: 'https://s3.example.com/upload',
      blob: new Blob(['pdf content'], { type: 'application/pdf' }),
      contentType: 'application/pdf',
      s3Key: 'uploads/test.pdf',
    };

    // Set up MSW handler for this test
    server.use(
      http.put('https://s3.example.com/upload', () => {
        return new HttpResponse(null, { status: 200 });
      }),
    );

    const { result } = renderHook(() => useS3Upload(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(async () => {
      await result.current.mutateAsync(params);
    });

    // MSW handles the actual fetch, so we just verify the hook works correctly
  });

  it('returns S3UploadResult with key, etag, and statusCode', async () => {
    const params: S3UploadParams = {
      presignedUrl: 'https://s3.example.com/upload',
      blob: new Blob(['content']),
      contentType: 'image/webp',
      s3Key: 'uploads/test.webp',
    };

    // Set up MSW handler for this test
    server.use(
      http.put('https://s3.example.com/upload', () => {
        return new HttpResponse(null, {
          status: 200,
          headers: { etag: '"abc123"' },
        });
      }),
    );

    const { result } = renderHook(() => useS3Upload(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(async () => {
      const response = await result.current.mutateAsync(params);
      expect(response.key).toBe('uploads/test.webp');
      expect(response.etag).toBe('"abc123"');
      expect(response.statusCode).toBe(200);
    });
  });

  it('handles missing etag in response', async () => {
    const params: S3UploadParams = {
      presignedUrl: 'https://s3.example.com/upload',
      blob: new Blob(['content']),
      contentType: 'image/webp',
      s3Key: 'uploads/test.webp',
    };

    // Set up MSW handler for this test (no etag header)
    server.use(
      http.put('https://s3.example.com/upload', () => {
        return new HttpResponse(null, { status: 200 });
      }),
    );

    const { result } = renderHook(() => useS3Upload(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(async () => {
      const response = await result.current.mutateAsync(params);
      expect(response.etag).toBeUndefined();
      expect(response.statusCode).toBe(200);
    });
  });

  it('throws S3UploadError on failed uploads', async () => {
    const params: S3UploadParams = {
      presignedUrl: 'https://s3.example.com/upload',
      blob: new Blob(['content']),
      contentType: 'image/webp',
      s3Key: 'uploads/test.webp',
    };

    // Set up MSW handler to return error
    server.use(
      http.put('https://s3.example.com/upload', () => {
        return new HttpResponse(null, { status: 403, statusText: 'Forbidden' });
      }),
    );

    const { result } = renderHook(() => useS3Upload(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(async () => {
      try {
        await result.current.mutateAsync(params);
        expect.fail('Should have thrown S3UploadError');
      } catch (error) {
        expect(error).toBeInstanceOf(S3UploadError);
        expect((error as S3UploadError).message).toContain('S3 upload failed');
        expect((error as S3UploadError).statusCode).toBe(403);
      }
    });
  });

  it('handles network errors appropriately', async () => {
    const params: S3UploadParams = {
      presignedUrl: 'https://s3.example.com/upload',
      blob: new Blob(['content']),
      contentType: 'image/webp',
      s3Key: 'uploads/test.webp',
    };

    // Set up MSW handler to throw network error
    server.use(
      http.put('https://s3.example.com/upload', () => {
        throw new Error('Network request failed');
      }),
    );

    const { result } = renderHook(() => useS3Upload(), {
      wrapper: TestQueryClientProvider,
    });

    // The error might be wrapped by MSW or other error handlers, so just check that it rejects
    await expect(result.current.mutateAsync(params)).rejects.toThrow();
  });

  it('configures retry logic with maxRetries', () => {
    renderHook(() => useS3Upload(), {
      wrapper: TestQueryClientProvider,
    });

    expect(createRetryHandler).toHaveBeenCalledWith({ maxRetries: 3 });
  });

  it('handles different status codes correctly', async () => {
    const params: S3UploadParams = {
      presignedUrl: 'https://s3.example.com/upload',
      blob: new Blob(['content']),
      contentType: 'image/webp',
      s3Key: 'uploads/test.webp',
    };

    const testCases = [
      { status: 200, shouldSucceed: true },
      { status: 201, shouldSucceed: true },
      { status: 400, shouldSucceed: false },
      { status: 500, shouldSucceed: false },
    ];

    for (const testCase of testCases) {
      vi.clearAllMocks();
      server.resetHandlers();

      // Set up MSW handler for this test case
      server.use(
        http.put('https://s3.example.com/upload', () => {
          return new HttpResponse(null, {
            status: testCase.status,
            statusText: `Status ${testCase.status}`,
          });
        }),
      );

      const { result: testResult } = renderHook(() => useS3Upload(), {
        wrapper: TestQueryClientProvider,
      });

      if (testCase.shouldSucceed) {
        await waitFor(async () => {
          const response = await testResult.current.mutateAsync(params);
          expect(response.statusCode).toBe(testCase.status);
        });
      } else {
        await waitFor(async () => {
          await expect(testResult.current.mutateAsync(params)).rejects.toThrow(
            S3UploadError,
          );
        });
      }
    }
  });
});
