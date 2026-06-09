import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRecreationTrailLayer } from './useRecreationTrailLayer';
import * as trailLayer from '@/components/search-map/layers/recreationTrailLayer';
import * as bcgwFeatures from '@/components/search-map/layers/bcgwFeatures';
import * as useLayerModule from './useLayer';
import * as viewportIdFetchModule from './useViewportIdFetch';

describe('useRecreationTrailLayer', () => {
  const mapRef = { current: {} } as any;
  const pinSource = { id: 'pin' } as any;
  const source = { id: 'trail-source' } as any;
  const layer = { id: 'trail-layer' } as any;

  beforeEach(() => {
    vi.spyOn(useLayerModule, 'useLayer').mockReturnValue({ layer, source });
    vi.spyOn(viewportIdFetchModule, 'useViewportIdFetch').mockReturnValue(
      undefined as any,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls useLayer with the source/layer/style factories and forwarded options', () => {
    renderHook(() =>
      useRecreationTrailLayer(mapRef, { pinSource, hideBelowZoom: 10 }),
    );

    expect(useLayerModule.useLayer).toHaveBeenCalledWith(
      mapRef,
      trailLayer.createRecreationTrailSource,
      trailLayer.createRecreationTrailLayer,
      trailLayer.createRecreationTrailStyle,
      { hideBelowZoom: 10 },
    );
  });

  it('excludes pinSource from the layerOptions forwarded to useLayer', () => {
    renderHook(() =>
      useRecreationTrailLayer(mapRef, { pinSource, hideBelowZoom: 10 }),
    );

    const layerOptions = vi.mocked(useLayerModule.useLayer).mock.calls[0][4];
    expect(layerOptions).not.toHaveProperty('pinSource');
  });

  it('drives useViewportIdFetch with the pin source, layer source and zoom threshold', () => {
    renderHook(() =>
      useRecreationTrailLayer(mapRef, { pinSource, hideBelowZoom: 10 }),
    );

    expect(viewportIdFetchModule.useViewportIdFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        mapRef,
        pinSource,
        source,
        minZoom: 10,
        fetchByIds: expect.any(Function),
      }),
    );
  });

  it('fetchByIds proxies to the BCGW trail layer (layer 3)', () => {
    const fetchSpy = vi
      .spyOn(bcgwFeatures, 'fetchBcgwFeaturesByIds')
      .mockResolvedValue([]);

    renderHook(() =>
      useRecreationTrailLayer(mapRef, { pinSource, hideBelowZoom: 10 }),
    );

    const { fetchByIds } = vi.mocked(viewportIdFetchModule.useViewportIdFetch)
      .mock.calls[0][0];
    fetchByIds(['AB001', 'AB002']);

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ layer: '3', ids: ['AB001', 'AB002'] }),
    );
  });

  it('returns the layer from useLayer', () => {
    const { result } = renderHook(() =>
      useRecreationTrailLayer(mapRef, { pinSource, hideBelowZoom: 10 }),
    );

    expect(result.current).toEqual({ layer });
  });
});
