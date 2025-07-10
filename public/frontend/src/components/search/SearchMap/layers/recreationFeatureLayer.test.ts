import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Feature from 'ol/Feature';
import VectorSource from 'ol/source/Vector';
import Cluster from 'ol/source/Cluster';
import { Style } from 'ol/style';
import {
  createClusteredRecreationFeatureStyle,
  createRecreationFeatureSource,
  createClusteredRecreationFeatureSource,
  createClusteredRecreationFeatureLayer,
  loadFeaturesForFilteredIds,
} from './recreationFeatureLayer';

vi.mock('ol/format/EsriJSON', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      readFeatures: vi.fn().mockReturnValue([
        (() => {
          const f = new Feature();
          f.set('FOREST_FILE_ID', '123');
          return f;
        })(),
      ]),
    })),
  };
});

describe('recreationFeatureLayer', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createClusteredRecreationFeatureStyle', () => {
    it('returns cluster style for multiple features', () => {
      const feature = new Feature();
      feature.set('features', [new Feature(), new Feature()]);

      const result = createClusteredRecreationFeatureStyle(feature, 1);
      expect(result).toBeDefined();
    });

    it('returns icon and label styles for single feature', () => {
      const feature = new Feature();
      const singleFeature = new Feature();
      singleFeature.set('CLOSURE_IND', 'Y');
      singleFeature.set('PROJECT_NAME', 'test project');
      feature.set('features', [singleFeature]);

      const result = createClusteredRecreationFeatureStyle(
        feature,
        1,
      ) as Style[];
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(result[0]).toBeInstanceOf(Style);
      expect(result[1]).toBeInstanceOf(Style);
    });
  });

  describe('createRecreationFeatureSource', () => {
    it('creates VectorSource with loader set', () => {
      const source = createRecreationFeatureSource();
      expect(source).toBeInstanceOf(VectorSource);
    });
  });

  describe('createClusteredRecreationFeatureSource', () => {
    it('creates Cluster source wrapping VectorSource', () => {
      const source = createClusteredRecreationFeatureSource();
      expect(source).toBeInstanceOf(Cluster);
    });
  });

  describe('createClusteredRecreationFeatureLayer', () => {
    it('creates AnimatedCluster layer with given source and style', () => {
      const clusterSource = createClusteredRecreationFeatureSource();
      const layer = createClusteredRecreationFeatureLayer(
        clusterSource,
        createClusteredRecreationFeatureStyle,
      );
      expect(layer).toBeDefined();
    });
  });

  describe('createClusteredRecreationFeatureStyle', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('returns cluster style for multiple features', () => {
      const feature = new Feature();
      feature.set('features', [new Feature(), new Feature()]);

      const result = createClusteredRecreationFeatureStyle(feature, 1);
      expect(result).toBeDefined();
    });

    it('returns orange icon style for selected feature', () => {
      const feature = new Feature();
      const singleFeature = new Feature();
      singleFeature.set('selected', true);
      feature.set('features', [singleFeature]);

      const result = createClusteredRecreationFeatureStyle(feature, 1);
      expect(result).toBeDefined();
    });

    it('returns red icon for closed, unselected feature', () => {
      const feature = new Feature();
      const singleFeature = new Feature();
      singleFeature.set('selected', false);
      singleFeature.set('CLOSURE_IND', 'Y');
      singleFeature.set('PROJECT_NAME', 'Test Project');
      feature.set('features', [singleFeature]);

      const result = createClusteredRecreationFeatureStyle(
        feature,
        1,
      ) as Style[];
      expect(result).toHaveLength(2);
    });

    it('returns blue icon for open, unselected feature', () => {
      const feature = new Feature();
      const singleFeature = new Feature();
      singleFeature.set('selected', false);
      singleFeature.set('CLOSURE_IND', 'N');
      singleFeature.set('PROJECT_NAME', 'Another Project');
      feature.set('features', [singleFeature]);

      const result = createClusteredRecreationFeatureStyle(
        feature,
        1,
      ) as Style[];
      expect(result).toHaveLength(2);
    });

    it('returns icon style without label if PROJECT_NAME is missing', () => {
      const feature = new Feature();
      const singleFeature = new Feature();
      singleFeature.set('selected', false);
      singleFeature.set('CLOSURE_IND', 'N');
      feature.set('features', [singleFeature]);

      const result = createClusteredRecreationFeatureStyle(feature, 1);
      expect(result).toBeInstanceOf(Style);
    });
  });
  describe('loadFeaturesForFilteredIds', () => {
    it('fetches and processes features correctly', async () => {
      const mockFeature = new Feature();
      mockFeature.set('FOREST_FILE_ID', '123');

      const mockFormat = {
        readFeatures: vi.fn().mockReturnValue([mockFeature]),
      };

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          json: () =>
            Promise.resolve({
              features: [{}],
            }),
        }),
      );

      const EsriJSONModule = await import('ol/format/EsriJSON');
      vi.spyOn(EsriJSONModule, 'default').mockImplementation(
        () => mockFormat as any,
      );

      const source = new VectorSource();
      const projection = 'EPSG:3857';

      await loadFeaturesForFilteredIds(['123'], source, projection);

      expect(fetch).toHaveBeenCalled();
      expect(mockFormat.readFeatures).toHaveBeenCalled();
      expect(source.getFeatures()).toHaveLength(1);
      expect(source.getFeatures()[0].get('type')).toBe('recreation-resource');
    });
  });
});
