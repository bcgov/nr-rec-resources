import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRecreationBoundaryLayer } from './useRecreationBoundaryLayer';
import * as boundaryLayer from '@/components/search-map/layers/recreationBoundaryLayer';
import * as useLayerModule from './useLayer';

describe('useRecreationBoundaryLayer', () => {
  it('calls useLayer with the correct layer and style factories', () => {
    const mapRef = { current: {} } as any;
    const useLayerSpy = vi
      .spyOn(useLayerModule, 'useLayer')
      .mockReturnValue({} as any);

    renderHook(() => useRecreationBoundaryLayer(mapRef, { filteredIds: [] }));

    expect(useLayerSpy).toHaveBeenCalledWith(
      mapRef,
      expect.any(Function),
      boundaryLayer.createRecreationBoundaryLayer,
      boundaryLayer.createRecreationBoundaryStyle,
      {},
    );

    useLayerSpy.mockRestore();
  });

  it('passes filteredIds to createRecreationBoundarySource via the memoized callback', () => {
    const mapRef = { current: {} } as any;
    const ids = ['AB001', 'AB002'];
    const createSourceSpy = vi
      .spyOn(boundaryLayer, 'createRecreationBoundarySource')
      .mockReturnValue({} as any);
    const useLayerSpy = vi
      .spyOn(useLayerModule, 'useLayer')
      .mockReturnValue({} as any);

    renderHook(() => useRecreationBoundaryLayer(mapRef, { filteredIds: ids }));

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
      useRecreationBoundaryLayer(mapRef, { filteredIds: [] }),
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
      useRecreationBoundaryLayer(mapRef, {
        filteredIds: ['AB001'],
        hideBelowZoom: 10,
      }),
    );

    expect(useLayerSpy).toHaveBeenCalledWith(
      mapRef,
      expect.any(Function),
      boundaryLayer.createRecreationBoundaryLayer,
      boundaryLayer.createRecreationBoundaryStyle,
      { hideBelowZoom: 10 },
    );

    useLayerSpy.mockRestore();
  });
});
