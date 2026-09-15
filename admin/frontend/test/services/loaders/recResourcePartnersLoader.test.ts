import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// 1. Hoist mock functions so they exist before module evaluation
const {
  mockRecResourceLoader,
  mockGetPartnersByRecreationResourceId,
  mockGetToken,
} = vi.hoisted(() => ({
  mockRecResourceLoader: vi.fn(),
  mockGetPartnersByRecreationResourceId: vi.fn(),
  mockGetToken: vi.fn(),
}));

// 2. Mock parent loader with path alias
vi.mock('@/services/loaders/recResourceLoader', () => ({
  recResourceLoader: mockRecResourceLoader,
}));

// 3. Mock AuthService
vi.mock('@/services/auth', () => ({
  AuthService: {
    getInstance: vi.fn(() => ({
      getToken: mockGetToken,
    })),
  },
}));

// 4. Mock API & Configuration using constructable functions
vi.mock('@/services/recreation-resource-admin', async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import('@/services/recreation-resource-admin')
    >();

  // Constructable mock class for PartnersApi
  const MockPartnersApi = vi.fn().mockImplementation(function (this: any) {
    this.getPartnersByRecreationResourceId =
      mockGetPartnersByRecreationResourceId;
  });

  // Constructable mock class for Configuration
  const MockConfiguration = vi.fn().mockImplementation(function (
    this: any,
    config: any,
  ) {
    Object.assign(this, config);
  });

  return {
    ...actual,
    Configuration: MockConfiguration,
    PartnersApi: MockPartnersApi,
  };
});

// 5. Module imports with path alias
import { recResourcePartnersLoader } from '@/services/loaders/recResourcePartnersLoader';
import {
  Configuration,
  PartnersApi,
} from '@/services/recreation-resource-admin';

describe('recResourcePartnersLoader', () => {
  const mockEnsureQueryData = vi.fn();

  const mockArgs = {
    params: { id: 'resource-123' },
    context: {
      queryClient: {
        ensureQueryData: mockEnsureQueryData,
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockRecResourceLoader.mockResolvedValue({
      parentKey: 'parentValue',
    });

    // Execute queryFn inline when queryClient.ensureQueryData is called
    mockEnsureQueryData.mockImplementation(
      async ({ queryFn }: { queryFn: () => any }) => queryFn(),
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should return combined parent data and partner info on success', async () => {
    const mockPartnersResponse = [{ id: 'p1', name: 'Partner 1' }];
    mockGetPartnersByRecreationResourceId.mockResolvedValue(
      mockPartnersResponse,
    );
    mockGetToken.mockResolvedValue('mock-token');

    const result = await recResourcePartnersLoader(mockArgs);

    // Verify parent loader call
    expect(mockRecResourceLoader).toHaveBeenCalledWith(mockArgs);

    // Verify Configuration constructor call
    expect(Configuration).toHaveBeenCalledWith({
      basePath: expect.any(String),
      accessToken: expect.any(Function),
    });

    // Verify PartnersApi constructor call
    expect(PartnersApi).toHaveBeenCalled();

    // Test the async accessToken callback branch passed to Configuration
    const configCallArg = vi.mocked(Configuration).mock.calls[0][0];
    const token = await (configCallArg?.accessToken as () => Promise<string>)();
    expect(token).toBe('mock-token');

    // Verify API invocation and output structure
    expect(mockGetPartnersByRecreationResourceId).toHaveBeenCalledWith({
      recResourceId: 'resource-123',
    });
    expect(result).toEqual({
      parentKey: 'parentValue',
      partnersInfo: mockPartnersResponse,
    });
  });

  it('should return null for partnersInfo when the API call throws an error', async () => {
    mockGetPartnersByRecreationResourceId.mockRejectedValue(
      new Error('API Failure'),
    );

    const result = await recResourcePartnersLoader(mockArgs);

    expect(result).toEqual({
      parentKey: 'parentValue',
      partnersInfo: null,
    });
  });

  it('should handle fallback basePath when VITE_API_BASE_URL is undefined', async () => {
    vi.stubEnv('VITE_API_BASE_URL', undefined as any);

    mockGetPartnersByRecreationResourceId.mockResolvedValue([]);

    await recResourcePartnersLoader(mockArgs);

    expect(Configuration).toHaveBeenCalledWith(
      expect.objectContaining({ basePath: '' }),
    );
  });
});
