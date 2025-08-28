import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRecreationSiteBoundaryLayer } from '@/components/search-map/hooks/useRecreationSiteBoundaryLayer';
import * as recSiteBoundaryLayer from '@/components/search-map/layers/recreationSiteBoundaryLayer';
import * as useLayerModule from '@/components/search-map/hooks/useLayer';

vi.mock('react', () => ({
  ...vi.importActual('react'),
  useEffect: vi.fn(),
}));

vi.mock('@/components/search-map/hooks/useLayer', () => ({
  useLayer: vi.fn(),
}));

describe('useRecreationSiteBoundaryLayer', () => {
  const mockUseLayer = vi.mocked(useLayerModule.useLayer);
  const mapRef = { current: { getMap: () => ({}) } } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLayer.mockReturnValue({ layer: 'mockLayer' } as any);
  });

  it('calls useLayer with the correct arguments', () => {
    const recResourceIds = ['REC123', 'REC456'];
    const options = { hideBelowZoom: 10 };

    const { result } = renderHook(() =>
      useRecreationSiteBoundaryLayer(recResourceIds, mapRef, options),
    );

    expect(mockUseLayer).toHaveBeenCalledWith(
      mapRef,
      recSiteBoundaryLayer.createRecreationSiteBoundarySource,
      recSiteBoundaryLayer.createRecreationSiteBoundaryLayer,
      recSiteBoundaryLayer.createRecreationSiteBoundaryStyle,
      options,
    );
    expect(result.current).toEqual({ layer: 'mockLayer' });
  });

  it('calls useLayer with default options when none provided', () => {
    const recResourceIds = ['REC123'];

    renderHook(() => useRecreationSiteBoundaryLayer(recResourceIds, mapRef));

    expect(mockUseLayer).toHaveBeenCalledWith(
      mapRef,
      recSiteBoundaryLayer.createRecreationSiteBoundarySource,
      recSiteBoundaryLayer.createRecreationSiteBoundaryLayer,
      recSiteBoundaryLayer.createRecreationSiteBoundaryStyle,
      undefined,
    );
  });
});
