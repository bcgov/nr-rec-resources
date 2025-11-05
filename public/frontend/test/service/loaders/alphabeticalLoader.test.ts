import {
  alphabeticalLoader,
  getAlphabeticalResources,
} from '@/service/loaders/alphabeticalLoader';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/service/queries/recreation-resource/queryKeys';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/service/recreation-resource');
vi.mock('@/service/hooks/helpers', () => ({
  getBasePath: vi.fn(() => 'http://localhost:3000'),
}));

describe('alphabeticalLoader', () => {
  let mockContext: any;
  let mockQueryClient: any;
  let mockLocation: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockQueryClient = {
      ensureQueryData: vi.fn(),
    };

    mockContext = {
      queryClient: mockQueryClient,
    };

    mockLocation = {
      search: {},
    };
  });

  it('should use correct query key with letter and type', async () => {
    mockLocation.search = { letter: 'A', type: 'site' };
    mockQueryClient.ensureQueryData.mockResolvedValue([]);

    await alphabeticalLoader({ context: mockContext, location: mockLocation });

    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: RECREATION_RESOURCE_QUERY_KEYS.alphabetical('A', 'site'),
      }),
    );
  });

  it('should default to # when letter not provided', async () => {
    mockLocation.search = {};
    mockQueryClient.ensureQueryData.mockResolvedValue([]);

    await alphabeticalLoader({ context: mockContext, location: mockLocation });

    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: RECREATION_RESOURCE_QUERY_KEYS.alphabetical('#', undefined),
      }),
    );
  });

  it('should return resources with letter and type', async () => {
    const mockResources = [
      { rec_resource_id: 'REC1', name: 'Alpine Trail' },
      { rec_resource_id: 'REC2', name: 'Aspen Site' },
    ];

    mockLocation.search = { letter: 'A', type: 'site' };
    mockQueryClient.ensureQueryData.mockResolvedValue(mockResources);

    const result = await alphabeticalLoader({
      context: mockContext,
      location: mockLocation,
    });

    expect(result).toEqual({
      resources: mockResources,
      letter: 'A',
      type: 'site',
    });
  });
});

describe('getAlphabeticalResources', () => {
  it('should throw error when letter is not provided', async () => {
    await expect(getAlphabeticalResources('')).rejects.toThrow(
      'Letter parameter is required',
    );
  });

  it('should fetch resources with letter and type parameter', async () => {
    const { RecreationResourceApi } = await import(
      '@/service/recreation-resource'
    );
    const mockApi = {
      getRecreationResourcesAlphabetically: vi
        .fn()
        .mockResolvedValue([{ rec_resource_id: 'REC1', name: 'Alpine Trail' }]),
    };
    vi.mocked(RecreationResourceApi).mockImplementation(() => mockApi as any);

    const result = await getAlphabeticalResources('A', 'trail');

    expect(mockApi.getRecreationResourcesAlphabetically).toHaveBeenCalledWith({
      letter: 'A',
      type: 'trail',
    });
    expect(result).toEqual([{ rec_resource_id: 'REC1', name: 'Alpine Trail' }]);
  });
});
