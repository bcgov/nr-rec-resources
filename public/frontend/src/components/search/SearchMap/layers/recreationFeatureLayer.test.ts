import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Feature from 'ol/Feature';
import VectorSource from 'ol/source/Vector';
import Cluster from 'ol/source/Cluster';
import EsriJSON from 'ol/format/EsriJSON';
import { Style } from 'ol/style';
import {
  createClusteredRecreationFeatureStyle,
  createRecreationFeatureSource,
  createClusteredRecreationFeatureSource,
  createClusteredRecreationFeatureLayer,
  recreationFeatureLoader,
} from './recreationFeatureLayer';

const PROJECTION = 'EPSG:3857';

describe('recreationFeatureLayer', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('recreationFeatureLoader', () => {
    it('fetches in batches until no more data and filters features', async () => {
      const filteredIds = Array.from({ length: 1002 }, (_, i) => String(i + 1));
      const format = new EsriJSON();
      const source = new VectorSource();

      const generateFeatures = (count: number) =>
        Array.from({ length: count }, (_, i) => ({
          attributes: { FOREST_FILE_ID: String(i + 1) },
        }));

      const fetchMock = vi
        .spyOn(global, 'fetch')
        .mockResolvedValueOnce({
          json: async () => ({ features: generateFeatures(1000) }),
        } as any)
        .mockResolvedValueOnce({
          json: async () => ({ features: generateFeatures(2) }),
        } as any);

      vi.spyOn(format, 'readFeatures').mockImplementation((data) =>
        data.features.map((f: any) => {
          const feature = new Feature();
          feature.set('FOREST_FILE_ID', f.attributes.FOREST_FILE_ID);
          return feature;
        }),
      );

      const addFeaturesSpy = vi.spyOn(source, 'addFeatures');

      await recreationFeatureLoader(filteredIds, format, source, PROJECTION);

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(addFeaturesSpy).toHaveBeenCalledTimes(1);
      expect(addFeaturesSpy.mock.calls[0][0].length).toBe(1002);
    });

    it('filters out features not in filteredIds', async () => {
      const filteredIds = ['2', '3'];
      const format = new EsriJSON();
      const source = new VectorSource();

      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: async () => ({
          features: [
            { attributes: { FOREST_FILE_ID: '1' } },
            { attributes: { FOREST_FILE_ID: '2' } },
            { attributes: { FOREST_FILE_ID: '3' } },
          ],
        }),
      } as any);

      vi.spyOn(format, 'readFeatures').mockImplementation((data) =>
        data.features.map((f: any) => {
          const feature = new Feature();
          feature.set('FOREST_FILE_ID', f.attributes.FOREST_FILE_ID);
          return feature;
        }),
      );

      const addFeaturesSpy = vi.spyOn(source, 'addFeatures');

      await recreationFeatureLoader(filteredIds, format, source, PROJECTION);
      const addedFeatures = addFeaturesSpy.mock.calls[0][0];
      const ids = addedFeatures.map((f: Feature) => f.get('FOREST_FILE_ID'));
      expect(ids).toEqual(['2', '3']);
    });
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
      const source = createRecreationFeatureSource(['1', '2']);
      expect(source).toBeInstanceOf(VectorSource);
    });
  });

  describe('createClusteredRecreationFeatureSource', () => {
    it('creates Cluster source wrapping VectorSource', () => {
      const source = createClusteredRecreationFeatureSource(['1']);
      expect(source).toBeInstanceOf(Cluster);
    });
  });

  describe('createClusteredRecreationFeatureLayer', () => {
    it('creates AnimatedCluster layer with given source and style', () => {
      const clusterSource = createClusteredRecreationFeatureSource(['1']);
      const layer = createClusteredRecreationFeatureLayer(
        clusterSource,
        createClusteredRecreationFeatureStyle,
      );
      expect(layer).toBeDefined();
    });
  });
});
