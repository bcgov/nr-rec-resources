import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import {
  createRecreationTrailStyle,
  createRecreationTrailSource,
  createRecreationTrailLayer,
} from './recreationTrailLayer';

vi.mock('./bcgwFeatures', () => ({
  fetchBcgwFeaturesByIds: vi.fn(),
}));

import { fetchBcgwFeaturesByIds } from './bcgwFeatures';

describe('createRecreationTrailStyle', () => {
  it('returns a Style with a stroke', () => {
    const style = createRecreationTrailStyle();
    expect(style.getStroke()).toBeDefined();
  });

  it('has no fill', () => {
    const style = createRecreationTrailStyle();
    expect(style.getFill()).toBeNull();
  });

  it('stroke has the correct color', () => {
    const style = createRecreationTrailStyle();
    expect(style.getStroke().getColor()).toBe('#42814A');
  });

  it('stroke has width 3', () => {
    const style = createRecreationTrailStyle();
    expect(style.getStroke().getWidth()).toBe(3);
  });

  it('stroke is dashed', () => {
    const style = createRecreationTrailStyle();
    expect(style.getStroke().getLineDash()).toEqual([6, 6]);
  });
});

describe('createRecreationTrailSource', () => {
  let capturedLoader: () => Promise<void>;
  let setLoaderSpy: ReturnType<typeof vi.spyOn>;
  let addFeaturesSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    setLoaderSpy = vi
      .spyOn(VectorSource.prototype, 'setLoader')
      .mockImplementation(function (fn: any) {
        capturedLoader = fn;
      });
    addFeaturesSpy = vi
      .spyOn(VectorSource.prototype, 'addFeatures')
      .mockImplementation(() => {});
    vi.mocked(fetchBcgwFeaturesByIds).mockResolvedValue([]);
  });

  afterEach(() => {
    setLoaderSpy.mockRestore();
    addFeaturesSpy.mockRestore();
    vi.clearAllMocks();
  });

  it('returns a VectorSource', () => {
    const source = createRecreationTrailSource([]);
    expect(source).toBeInstanceOf(VectorSource);
  });

  it('does not fetch when filteredIds is empty', async () => {
    createRecreationTrailSource([]);
    await capturedLoader();
    expect(fetchBcgwFeaturesByIds).not.toHaveBeenCalled();
  });

  it('fetches features using BCGW layer 3', async () => {
    const ids = ['AB001', 'AB002'];
    createRecreationTrailSource(ids);
    await capturedLoader();
    expect(fetchBcgwFeaturesByIds).toHaveBeenCalledWith(
      expect.objectContaining({ layer: '3', ids }),
    );
  });

  it('adds fetched features to the source', async () => {
    const mockFeature = {};
    vi.mocked(fetchBcgwFeaturesByIds).mockResolvedValue([mockFeature] as any);

    createRecreationTrailSource(['AB001']);
    await capturedLoader();

    expect(addFeaturesSpy).toHaveBeenCalledWith([mockFeature]);
  });
});

describe('createRecreationTrailLayer', () => {
  it('returns a VectorLayer', () => {
    const source = new VectorSource();
    const layer = createRecreationTrailLayer(source);
    expect(layer).toBeInstanceOf(VectorLayer);
  });

  it('uses the provided source', () => {
    const source = new VectorSource();
    const layer = createRecreationTrailLayer(source);
    expect(layer.getSource()).toBe(source);
  });
});
