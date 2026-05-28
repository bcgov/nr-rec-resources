import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import {
  createRecreationBoundaryStyle,
  createRecreationBoundarySource,
  createRecreationBoundaryLayer,
} from './recreationBoundaryLayer';

vi.mock('./bcgwFeatures', () => ({
  fetchBcgwFeaturesByIds: vi.fn(),
}));

import { fetchBcgwFeaturesByIds } from './bcgwFeatures';

describe('createRecreationBoundaryStyle', () => {
  it('returns a Style with a stroke and fill', () => {
    const style = createRecreationBoundaryStyle();
    expect(style.getStroke()).toBeDefined();
    expect(style.getFill()).toBeDefined();
  });

  it('stroke has the correct color', () => {
    const style = createRecreationBoundaryStyle();
    expect(style.getStroke().getColor()).toBe('#42814A');
  });

  it('stroke has width 3', () => {
    const style = createRecreationBoundaryStyle();
    expect(style.getStroke().getWidth()).toBe(3);
  });

  it('fill has the correct semi-transparent color', () => {
    const style = createRecreationBoundaryStyle();
    expect(style.getFill().getColor()).toBe('#42814A66');
  });
});

describe('createRecreationBoundarySource', () => {
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
    const source = createRecreationBoundarySource([]);
    expect(source).toBeInstanceOf(VectorSource);
  });

  it('does not fetch when filteredIds is empty', async () => {
    createRecreationBoundarySource([]);
    await capturedLoader();
    expect(fetchBcgwFeaturesByIds).not.toHaveBeenCalled();
  });

  it('fetches features using BCGW layer 5', async () => {
    const ids = ['AB001', 'AB002'];
    createRecreationBoundarySource(ids);
    await capturedLoader();
    expect(fetchBcgwFeaturesByIds).toHaveBeenCalledWith(
      expect.objectContaining({ layer: '5', ids }),
    );
  });

  it('adds fetched features to the source', async () => {
    const mockFeature = {};
    vi.mocked(fetchBcgwFeaturesByIds).mockResolvedValue([mockFeature] as any);

    createRecreationBoundarySource(['AB001']);
    await capturedLoader();

    expect(addFeaturesSpy).toHaveBeenCalledWith([mockFeature]);
  });
});

describe('createRecreationBoundaryLayer', () => {
  it('returns a VectorLayer', () => {
    const source = new VectorSource();
    const layer = createRecreationBoundaryLayer(source);
    expect(layer).toBeInstanceOf(VectorLayer);
  });

  it('uses the provided source', () => {
    const source = new VectorSource();
    const layer = createRecreationBoundaryLayer(source);
    expect(layer.getSource()).toBe(source);
  });
});
