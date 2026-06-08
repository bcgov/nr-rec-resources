import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRecreationBoundaryLayer } from './useRecreationBoundaryLayer';
import * as boundaryLayer from '@/components/search-map/layers/recreationBoundaryLayer';
import * as bcgwFeatures from '@/components/search-map/layers/bcgwFeatures';
import * as useLayerModule from './useLayer';
import * as viewportIdFetchModule from './useViewportIdFetch';

describe('useRecreationBoundaryLayer', () => {
  const mapRef = { current: {} } as any;
  const pinSource = { id: 'pin' } as any;
  const source = { id: 'boundary-source' } as any;
  const layer = { id: 'boundary-layer' } as any;

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
      useRecreationBoundaryLayer(mapRef, { pinSource, hideBelowZoom: 10 }),
    );

    expect(useLayerModule.useLayer).toHaveBeenCalledWith(
      mapRef,
      boundaryLayer.createRecreationBoundarySource,
      boundaryLayer.createRecreationBoundaryLayer,
      boundaryLayer.createRecreationBoundaryStyle,
      { hideBelowZoom: 10 },
    );
  });

  it('excludes pinSource from the layerOptions forwarded to useLayer', () => {
    renderHook(() =>
      useRecreationBoundaryLayer(mapRef, { pinSource, hideBelowZoom: 10 }),
    );

    const layerOptions = vi.mocked(useLayerModule.useLayer).mock.calls[0][4];
    expect(layerOptions).not.toHaveProperty('pinSource');
  });

  it('drives useViewportIdFetch with the pin source, layer source and zoom threshold', () => {
    renderHook(() =>
      useRecreationBoundaryLayer(mapRef, { pinSource, hideBelowZoom: 10 }),
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

  it('fetchByIds proxies to the BCGW boundary layer (layer 5)', () => {
    const fetchSpy = vi
      .spyOn(bcgwFeatures, 'fetchBcgwFeaturesByIds')
      .mockResolvedValue([]);

    renderHook(() =>
      useRecreationBoundaryLayer(mapRef, { pinSource, hideBelowZoom: 10 }),
    );

    const { fetchByIds } = vi.mocked(viewportIdFetchModule.useViewportIdFetch)
      .mock.calls[0][0];
    fetchByIds(['AB001', 'AB002']);

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ layer: '5', ids: ['AB001', 'AB002'] }),
    );
  });

  it('returns the layer from useLayer', () => {
    const { result } = renderHook(() =>
      useRecreationBoundaryLayer(mapRef, { pinSource, hideBelowZoom: 10 }),
    );

    expect(result.current).toEqual({ layer });
  });
});
