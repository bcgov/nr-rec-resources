import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRecreationTrailLayer } from './useRecreationTrailLayer';
import * as trailLayer from '@/components/search-map/layers/recreationTrailLayer';
import * as useLayerModule from './useLayer';

describe('useRecreationTrailLayer', () => {
  it('calls useLayer with the correct layer and style factories', () => {
    const mapRef = { current: {} } as any;
    const useLayerSpy = vi
      .spyOn(useLayerModule, 'useLayer')
      .mockReturnValue({} as any);

    renderHook(() => useRecreationTrailLayer(mapRef, { filteredIds: [] }));

    expect(useLayerSpy).toHaveBeenCalledWith(
      mapRef,
      expect.any(Function),
      trailLayer.createRecreationTrailLayer,
      trailLayer.createRecreationTrailStyle,
      {},
    );

    useLayerSpy.mockRestore();
  });

  it('passes filteredIds to createRecreationTrailSource via the memoized callback', () => {
    const mapRef = { current: {} } as any;
    const ids = ['AB001', 'AB002'];
    const createSourceSpy = vi
      .spyOn(trailLayer, 'createRecreationTrailSource')
      .mockReturnValue({} as any);
    const useLayerSpy = vi
      .spyOn(useLayerModule, 'useLayer')
      .mockReturnValue({} as any);

    renderHook(() => useRecreationTrailLayer(mapRef, { filteredIds: ids }));

    const createSourceArg = vi.mocked(useLayerModule.useLayer).mock.calls[0][1];
    createSourceArg();

    expect(createSourceSpy).toHaveBeenCalledWith(ids);

    createSourceSpy.mockRestore();
    useLayerSpy.mockRestore();
  });

  it('returns whatever useLayer returns', () => {
    const mapRef = { current: {} } as any;
    const mockReturn = { layer: 'mock' } as any;
    const useLayerSpy = vi
      .spyOn(useLayerModule, 'useLayer')
      .mockReturnValue(mockReturn);

    const { result } = renderHook(() =>
      useRecreationTrailLayer(mapRef, { filteredIds: [] }),
    );

    expect(result.current).toBe(mockReturn);
    useLayerSpy.mockRestore();
  });

  it('excludes filteredIds from the layerOptions forwarded to useLayer', () => {
    const mapRef = { current: {} } as any;
    const useLayerSpy = vi
      .spyOn(useLayerModule, 'useLayer')
      .mockReturnValue({} as any);

    renderHook(() =>
      useRecreationTrailLayer(mapRef, {
        filteredIds: ['AB001'],
        hideBelowZoom: 10,
      }),
    );

    expect(useLayerSpy).toHaveBeenCalledWith(
      mapRef,
      expect.any(Function),
      trailLayer.createRecreationTrailLayer,
      trailLayer.createRecreationTrailStyle,
      { hideBelowZoom: 10 },
    );

    useLayerSpy.mockRestore();
  });
});
