import { recResourceLoader } from '@/service/loaders/recResourceLoader';
import { getRecreationResourceById } from '@/service/queries/recreation-resource';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/service/queries/recreation-resource/queryKeys';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/service/queries/recreation-resource');

describe('recResourceLoader', () => {
  let mockContext: any;
  let mockQueryClient: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockQueryClient = {
      ensureQueryData: vi.fn(),
    };

    mockContext = {
      queryClient: mockQueryClient,
    };
  });

  it('should call ensureQueryData with correct query key', async () => {
    const params = { id: 'REC123' };
    mockQueryClient.ensureQueryData.mockResolvedValue({});

    await recResourceLoader({ context: mockContext, params });

    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: RECREATION_RESOURCE_QUERY_KEYS.detail('REC123'),
      }),
    );
  });

  it('should fetch recreation resource by id with correct image size codes', async () => {
    const params = { id: 'REC456' };
    const mockResource = {
      id: 'REC456',
      name: 'Test Resource',
    };

    (getRecreationResourceById as any).mockResolvedValue(mockResource);

    mockQueryClient.ensureQueryData.mockImplementation(
      async ({ queryFn }: any) => {
        return await queryFn();
      },
    );

    await recResourceLoader({ context: mockContext, params });

    expect(getRecreationResourceById).toHaveBeenCalledWith({
      id: 'REC456',
      imageSizeCodes: ['pre', 'original'],
    });
  });

  it('should throw error when resource is not found', async () => {
    const params = { id: 'non-existent' };

    (getRecreationResourceById as any).mockResolvedValue(null);

    mockQueryClient.ensureQueryData.mockImplementation(
      async ({ queryFn }: any) => {
        return await queryFn();
      },
    );

    await expect(
      recResourceLoader({ context: mockContext, params }),
    ).rejects.toThrow('Resource not found');
  });

  it('should throw error with 404 status when resource is not found', async () => {
    const params = { id: 'non-existent' };

    (getRecreationResourceById as any).mockResolvedValue(null);

    mockQueryClient.ensureQueryData.mockImplementation(
      async ({ queryFn }: any) => {
        return await queryFn();
      },
    );

    try {
      await recResourceLoader({ context: mockContext, params });
      expect.fail('Should have thrown an error');
    } catch (error: any) {
      expect(error.message).toBe('Resource not found');
      expect(error.status).toBe(404);
    }
  });

  it('should return the rec resource data and id', async () => {
    const params = { id: 'REC789' };
    const mockRecResource = {
      rec_resource_id: 'REC789',
      name: 'Test Resource',
    };

    mockQueryClient.ensureQueryData.mockResolvedValue(mockRecResource);

    const result = await recResourceLoader({ context: mockContext, params });

    expect(result).toEqual({
      recResource: mockRecResource,
      recResourceId: 'REC789',
    });
  });

  it('should handle successful resource fetch', async () => {
    const params = { id: 'REC123' };
    const mockResource = {
      rec_resource_id: 'REC123',
      name: 'Successful Resource',
      description: 'A test resource',
    };

    (getRecreationResourceById as any).mockResolvedValue(mockResource);

    mockQueryClient.ensureQueryData.mockResolvedValue(mockResource);

    const result = await recResourceLoader({ context: mockContext, params });

    expect(result.recResource).toEqual(mockResource);
    expect(result.recResourceId).toBe('REC123');
  });
});
