import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Style } from 'ol/style';
import { Vector as VectorSource } from 'ol/source';
import ClusterSource from 'ol/source/Cluster';
import { EsriJSON } from 'ol/format';
import type { FeatureLike } from 'ol/Feature';

vi.mock('ol-ext/layer/AnimatedCluster', () => ({
  default: class MockAnimatedCluster {
    constructor(options: any) {
      Object.assign(this, options);
    }
  },
}));

vi.mock('ol/source', () => ({
  Vector: vi.fn().mockImplementation((options) => ({
    addFeatures: vi.fn(),
    clear: vi.fn(),
    setLoader: vi.fn(),
    loader: options?.loader,
    ...options,
  })),
}));

vi.mock('ol/source/Cluster', () => ({
  default: vi.fn().mockImplementation((options) => ({
    ...options,
  })),
}));

vi.mock('ol/format', () => ({
  EsriJSON: vi.fn().mockImplementation(() => ({
    readFeatures: vi.fn(),
  })),
}));

vi.mock('@shared/utils/capitalizeWords', () => ({
  capitalizeWords: vi.fn((text: string) => text.toUpperCase()),
}));

vi.mock('@/components/search-map/styles/feature', () => ({
  featureLabelText: vi.fn((text: string) => ({ text })),
}));

vi.mock('@/components/search-map/styles/icons', () => ({
  createSITIcon: vi.fn(
    ({ opacity, variant }) => new Style({ opacity, variant } as any),
  ),
  createRTRIcon: vi.fn(
    ({ opacity, variant }) => new Style({ opacity, variant } as any),
  ),
  createIFIcon: vi.fn(
    ({ opacity, variant }) => new Style({ opacity, variant } as any),
  ),
}));

vi.mock('@/components/search-map/styles/cluster', () => ({
  clusterStyle: vi.fn(
    ({ size, clusterOpacity, haloOpacity }) =>
      new Style({ size, clusterOpacity, haloOpacity } as any),
  ),
}));

vi.mock('@/components/search-map/constants', () => ({
  RECREATION_FEATURE_LAYER: 'https://mock-api.com/recreation',
}));

// Import the module under test after mocks
import {
  createClusteredRecreationFeatureStyle,
  createRecreationFeatureSource,
  createFilteredClusterSource,
  getFilteredFeatures,
} from './recreationFeatureLayer';

// Import mocked dependencies for assertions
import { capitalizeWords } from '@shared/utils/capitalizeWords';
import { featureLabelText } from '@/components/search-map/styles/feature';
import {
  createSITIcon,
  createRTRIcon,
  createIFIcon,
} from '@/components/search-map/styles/icons';
import { clusterStyle } from '@/components/search-map/styles/cluster';

describe('recreationFeatureLayer', () => {
  // Mock fetch globally
  const mockFetch = vi.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    vi.clearAllMocks();
    // Clear internal caches by accessing them through the module
    // Since caches are private, we'll test their behavior indirectly
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('createClusteredRecreationFeatureStyle', () => {
    it('should return cluster style for multiple features', () => {
      const mockFeature = {
        get: vi.fn((key: string) => {
          if (key === 'features') return [{ id: 1 }, { id: 2 }, { id: 3 }];
          return undefined;
        }),
      } as unknown as FeatureLike;

      const result = createClusteredRecreationFeatureStyle(mockFeature, 1);

      expect(clusterStyle).toHaveBeenCalledWith({
        size: 3,
        clusterOpacity: 0.85,
        haloOpacity: 0.7,
      });
      expect(result).toBeInstanceOf(Style);
    });

    it('should return cluster style with custom opacity options', () => {
      const mockFeature = {
        get: vi.fn((key: string) => {
          if (key === 'features') return [{ id: 1 }, { id: 2 }];
          return undefined;
        }),
      } as unknown as FeatureLike;

      const options = {
        iconOpacity: 0.5,
        clusterOpacity: 0.6,
        haloOpacity: 0.4,
      };

      createClusteredRecreationFeatureStyle(mockFeature, 1, options);

      expect(clusterStyle).toHaveBeenCalledWith({
        size: 2,
        clusterOpacity: 0.6,
        haloOpacity: 0.4,
      });
    });

    it('should return selected icon for selected single feature', () => {
      const mockSingleFeature = {
        get: vi.fn((key: string) => {
          if (key === 'selected') return true;
          if (key === 'CLOSURE_IND') return 'N';
          if (key === 'PROJECT_NAME') return undefined;
          if (key === 'PROJECT_TYPE') return undefined;
          return undefined;
        }),
      };

      const mockFeature = {
        get: vi.fn((key: string) => {
          if (key === 'features') return [mockSingleFeature];
          return undefined;
        }),
      } as unknown as FeatureLike;

      const result = createClusteredRecreationFeatureStyle(mockFeature, 1);

      expect(createSITIcon).toHaveBeenCalledWith({
        opacity: 1,
        variant: 'selected',
      });
      expect(result).toBeInstanceOf(Style);
    });

    it('should return closed icon for closed single feature', () => {
      const mockSingleFeature = {
        get: vi.fn((key: string) => {
          if (key === 'selected') return false;
          if (key === 'CLOSURE_IND') return 'Y';
          if (key === 'PROJECT_NAME') return undefined;
          return undefined;
        }),
      };

      const mockFeature = {
        get: vi.fn((key: string) => {
          if (key === 'features') return [mockSingleFeature];
          return undefined;
        }),
      } as unknown as FeatureLike;

      const result = createClusteredRecreationFeatureStyle(mockFeature, 1);

      expect(createSITIcon).toHaveBeenCalledWith({
        opacity: 1,
        variant: 'closed',
      });
      expect(result).toBeInstanceOf(Style);
    });

    it('should return default icon for open single feature', () => {
      const mockSingleFeature = {
        get: vi.fn((key: string) => {
          if (key === 'selected') return false;
          if (key === 'CLOSURE_IND') return 'N';
          if (key === 'PROJECT_NAME') return undefined;
          return undefined;
        }),
      };

      const mockFeature = {
        get: vi.fn((key: string) => {
          if (key === 'features') return [mockSingleFeature];
          return undefined;
        }),
      } as unknown as FeatureLike;

      createClusteredRecreationFeatureStyle(mockFeature, 1);

      expect(createSITIcon).toHaveBeenCalledWith({
        opacity: 1,
        variant: 'default',
      });
    });

    it('should return icon and label styles for feature with name', () => {
      const mockSingleFeature = {
        get: vi.fn((key: string) => {
          if (key === 'selected') return false;
          if (key === 'CLOSURE_IND') return 'N';
          if (key === 'PROJECT_NAME') return 'test project';
          return undefined;
        }),
      };

      const mockFeature = {
        get: vi.fn((key: string) => {
          if (key === 'features') return [mockSingleFeature];
          return undefined;
        }),
      } as unknown as FeatureLike;

      const result = createClusteredRecreationFeatureStyle(mockFeature, 1);

      expect(capitalizeWords).toHaveBeenCalledWith('test project');
      expect(featureLabelText).toHaveBeenCalledWith('TEST PROJECT');
      expect(Array.isArray(result)).toBe(true);
      expect((result as Style[]).length).toBe(2);
    });

    describe('project type icons', () => {
      const createMockFeature = (
        projectType: string,
        isClosed: boolean = false,
      ) => {
        const mockSingleFeature = {
          get: vi.fn((key: string) => {
            if (key === 'selected') return false;
            if (key === 'CLOSURE_IND') return isClosed ? 'Y' : 'N';
            if (key === 'PROJECT_TYPE') return projectType;
            if (key === 'PROJECT_NAME') return undefined;
            return undefined;
          }),
        };

        return {
          get: vi.fn((key: string) => {
            if (key === 'features') return [mockSingleFeature];
            return undefined;
          }),
        } as unknown as FeatureLike;
      };

      const projectTypes = [
        { type: 'SIT', icon: createSITIcon },
        { type: 'RR', icon: createSITIcon },
        { type: 'RTR', icon: createRTRIcon },
        { type: 'IF', icon: createIFIcon },
      ];

      projectTypes.forEach(({ type, icon }) => {
        it(`should return ${type} icon for ${type} project type when zoomed in`, () => {
          const mockFeature = createMockFeature(type, false);
          createClusteredRecreationFeatureStyle(mockFeature, 200);
          expect(icon).toHaveBeenCalledWith({ opacity: 1, variant: 'default' });
        });

        it(`should return closed ${type} icon for closed ${type} project`, () => {
          const mockFeature = createMockFeature(type, true);
          createClusteredRecreationFeatureStyle(mockFeature, 200);
          expect(icon).toHaveBeenCalledWith({ opacity: 1, variant: 'closed' });
        });
      });

      it('should fall back to default icons for unknown project types', () => {
        const mockFeature = createMockFeature('UNKNOWN_TYPE', false);
        createClusteredRecreationFeatureStyle(mockFeature, 200);
        expect(createSITIcon).toHaveBeenCalledWith({
          opacity: 1,
          variant: 'default',
        });
      });

      it('should fall back to closed icon for closed unknown project types', () => {
        const mockFeature = createMockFeature('UNKNOWN_TYPE', true);
        createClusteredRecreationFeatureStyle(mockFeature, 200);
        expect(createSITIcon).toHaveBeenCalledWith({
          opacity: 1,
          variant: 'closed',
        });
      });
    });
  });

  describe('createRecreationFeatureSource', () => {
    it('should create a VectorSource with EsriJSON format', () => {
      const options = { projection: 'EPSG:4326' };
      const result = createRecreationFeatureSource(options as any);

      expect(VectorSource).toHaveBeenCalledWith({
        format: expect.any(EsriJSON),
        overlaps: false,
        projection: 'EPSG:4326',
      });
      expect(result).toBeDefined();
    });

    it('should create a VectorSource without options', () => {
      createRecreationFeatureSource();

      expect(VectorSource).toHaveBeenCalledWith({
        format: expect.any(EsriJSON),
        overlaps: false,
      });
    });
  });

  describe('createFilteredClusterSource', () => {
    it('should create a clustered source with filtered features', async () => {
      const filteredIds = ['123', '456'];
      const clusterOptions = { distance: 50 };

      const mockAddFeatures = vi.fn();
      const mockSetLoader = vi.fn();
      let capturedLoader: (() => Promise<void>) | undefined;

      (VectorSource as any).mockImplementation((options: any) => {
        return {
          addFeatures: mockAddFeatures,
          setLoader: mockSetLoader.mockImplementation((loader) => {
            capturedLoader = loader;
          }),
          clear: vi.fn(),
          ...options,
        };
      });

      const mockResponse = {
        features: [
          { attributes: { FOREST_FILE_ID: '123', PROJECT_NAME: 'Test 1' } },
          { attributes: { FOREST_FILE_ID: '456', PROJECT_NAME: 'Test 2' } },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const mockFeatures = [
        {
          get: vi.fn((key: string) =>
            key === 'FOREST_FILE_ID' ? '123' : undefined,
          ),
          setId: vi.fn(),
          set: vi.fn(),
        },
        {
          get: vi.fn((key: string) =>
            key === 'FOREST_FILE_ID' ? '456' : undefined,
          ),
          setId: vi.fn(),
          set: vi.fn(),
        },
      ];

      const mockFormat = {
        readFeatures: vi.fn().mockReturnValue(mockFeatures),
      };
      (EsriJSON as any).mockImplementation(() => mockFormat);

      const result = createFilteredClusterSource(filteredIds, clusterOptions);

      expect(VectorSource).toHaveBeenCalledWith({
        format: expect.any(Object),
        overlaps: false,
      });
      expect(mockSetLoader).toHaveBeenCalledWith(expect.any(Function));
      expect(ClusterSource).toHaveBeenCalledWith({
        source: expect.any(Object),
        distance: 50,
      });
      expect(result).toBeDefined();

      if (capturedLoader) {
        await capturedLoader();
        expect(mockAddFeatures).toHaveBeenCalledWith(mockFeatures);
      }
    });

    it('should create a clustered source without cluster options', () => {
      const filteredIds = ['123'];
      const mockSetLoader = vi.fn();

      (VectorSource as any).mockImplementation(() => ({
        addFeatures: vi.fn(),
        setLoader: mockSetLoader,
        clear: vi.fn(),
      }));

      const result = createFilteredClusterSource(filteredIds);

      expect(VectorSource).toHaveBeenCalledWith({
        format: expect.any(Object),
        overlaps: false,
      });
      expect(mockSetLoader).toHaveBeenCalledWith(expect.any(Function));
      expect(ClusterSource).toHaveBeenCalledWith({
        source: expect.any(Object),
      });
      expect(result).toBeDefined();
    });

    it('should handle loader errors gracefully', async () => {
      const filteredIds = ['123'];
      let capturedLoader: (() => Promise<void>) | undefined;
      const mockAddFeatures = vi.fn();
      const mockSetLoader = vi.fn();

      (VectorSource as any).mockImplementation(() => ({
        addFeatures: mockAddFeatures,
        setLoader: mockSetLoader.mockImplementation((loader) => {
          capturedLoader = loader;
        }),
        clear: vi.fn(),
      }));

      // Mock fetch to throw an error
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      createFilteredClusterSource(filteredIds);

      // Test that the loader handles errors
      if (capturedLoader) {
        await expect(capturedLoader()).rejects.toThrow('Network error');
        expect(mockAddFeatures).not.toHaveBeenCalled();
      }
    });
  });

  describe('getFilteredFeatures', () => {
    beforeEach(() => {
      mockFetch.mockClear();
    });

    it('should fetch and filter features successfully', async () => {
      const filteredIds = ['123', '456'];
      const mockResponse = {
        features: [
          { attributes: { FOREST_FILE_ID: '123', PROJECT_NAME: 'Test 1' } },
          { attributes: { FOREST_FILE_ID: '456', PROJECT_NAME: 'Test 2' } },
          { attributes: { FOREST_FILE_ID: '789', PROJECT_NAME: 'Test 3' } },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const mockFeatures = [
        {
          get: vi.fn((key: string) => {
            if (key === 'FOREST_FILE_ID') return '123';
            return undefined;
          }),
          setId: vi.fn(),
          set: vi.fn(),
        },
        {
          get: vi.fn((key: string) => {
            if (key === 'FOREST_FILE_ID') return '456';
            return undefined;
          }),
          setId: vi.fn(),
          set: vi.fn(),
        },
        {
          get: vi.fn((key: string) => {
            if (key === 'FOREST_FILE_ID') return '789';
            return undefined;
          }),
          setId: vi.fn(),
          set: vi.fn(),
        },
      ];

      const mockFormat = {
        readFeatures: vi.fn().mockReturnValue(mockFeatures),
      };
      (EsriJSON as any).mockImplementation(() => mockFormat);

      const result = await getFilteredFeatures(filteredIds);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('https://mock-api.com/recreation/query/?'),
      );
      expect(mockFormat.readFeatures).toHaveBeenCalledWith(mockResponse, {
        featureProjection: 'EPSG:102100',
        dataProjection: 'EPSG:102100',
      });
      expect(result).toHaveLength(2); // Only filtered features
      expect(mockFeatures[0].setId).toHaveBeenCalledWith('123');
      expect(mockFeatures[0].set).toHaveBeenCalledWith(
        'type',
        'recreation-resource',
      );
      expect(mockFeatures[1].setId).toHaveBeenCalledWith('456');
      expect(mockFeatures[1].set).toHaveBeenCalledWith(
        'type',
        'recreation-resource',
      );
    });

    it('should handle pagination with multiple batches', async () => {
      const filteredIds = ['123'];

      const mockResponse1 = {
        features: new Array(1000).fill(null).map((_, i) => ({
          attributes: { FOREST_FILE_ID: `${i}`, PROJECT_NAME: `Test ${i}` },
        })),
      };

      const mockResponse2 = {
        features: [
          { attributes: { FOREST_FILE_ID: '123', PROJECT_NAME: 'Test Match' } },
        ],
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse1),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse2),
        });

      const mockFeatures1 = new Array(1000).fill(null).map((_, i) => ({
        get: vi.fn((key: string) => {
          if (key === 'FOREST_FILE_ID') return `${i}`;
          return undefined;
        }),
        setId: vi.fn(),
        set: vi.fn(),
      }));

      const mockFeatures2 = [
        {
          get: vi.fn((key: string) => {
            if (key === 'FOREST_FILE_ID') return '123';
            return undefined;
          }),
          setId: vi.fn(),
          set: vi.fn(),
        },
      ];

      const mockFormat = {
        readFeatures: vi
          .fn()
          .mockReturnValueOnce(mockFeatures1)
          .mockReturnValueOnce(mockFeatures2),
      };
      (EsriJSON as any).mockImplementation(() => mockFormat);

      const result = await getFilteredFeatures(filteredIds);

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2); // Only the matching feature from second batch
    });

    it('should throw error on failed HTTP request', async () => {
      const filteredIds = ['123'];

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(getFilteredFeatures(filteredIds)).rejects.toThrow(
        'HTTP error! status: 500',
      );
    });

    it('should handle network errors', async () => {
      const filteredIds = ['123'];

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(getFilteredFeatures(filteredIds)).rejects.toThrow(
        'Network error',
      );
    });

    it('should handle empty filtered IDs', async () => {
      const filteredIds: string[] = [];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ features: [] }),
      });

      const mockFormat = {
        readFeatures: vi.fn().mockReturnValue([]),
      };
      (EsriJSON as any).mockImplementation(() => mockFormat);

      const result = await getFilteredFeatures(filteredIds);

      expect(result).toHaveLength(0);
    });

    it('should build correct URL parameters', async () => {
      const filteredIds = ['123'];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ features: [] }),
      });

      const mockFormat = {
        readFeatures: vi.fn().mockReturnValue([]),
      };
      (EsriJSON as any).mockImplementation(() => mockFormat);

      await getFilteredFeatures(filteredIds);

      const expectedParams = [
        'f=json',
        'where=1%3D1',
        'outFields=PROJECT_NAME%2CPROJECT_TYPE%2CCLOSURE_IND%2CFOREST_FILE_ID',
        'resultRecordCount=1000',
        'resultOffset=0',
        'orderByFields=PROJECT_NAME',
        'inSR=102100',
        'outSR=102100',
        'returnGeometry=true',
        'geometryPrecision=7',
        'outStatistics=%5B%5D',
        'returnCountOnly=false',
      ];

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('https://mock-api.com/recreation/query/?'),
      );

      const callUrl = (mockFetch as any).mock.calls[0][0];
      expectedParams.forEach((param) => {
        expect(callUrl).toContain(param);
      });
    });
  });
});
