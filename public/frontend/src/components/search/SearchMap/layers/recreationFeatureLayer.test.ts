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
} from './recreationFeatureLayer';

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
});
