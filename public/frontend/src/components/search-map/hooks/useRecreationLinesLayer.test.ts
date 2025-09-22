import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRecreationLinesLayer } from '@/components/search-map/hooks/useRecreationLinesLayer';
import * as recLinesLayer from '@/components/search-map/layers/recreationLinesLayer';
import * as useLayerModule from '@/components/search-map/hooks/useLayer';

vi.mock('react', () => ({
  ...vi.importActual('react'),
  useEffect: vi.fn(),
}));

vi.mock('@/components/search-map/hooks/useLayer', () => ({
  useLayer: vi.fn(),
}));

describe('useRecreationLinesLayer', () => {
  const mockUseLayer = vi.mocked(useLayerModule.useLayer);
  const mapRef = { current: { getMap: () => ({}) } } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLayer.mockReturnValue({ layer: 'mockLayer' } as any);
  });

  it('calls useLayer with the correct arguments', () => {
    const recResourceIds = ['REC123', 'REC456'];
    const options = { applyHoverStyles: true };

    const { result } = renderHook(() =>
      useRecreationLinesLayer(recResourceIds, mapRef, options),
    );

    expect(mockUseLayer).toHaveBeenCalledWith(
      mapRef,
      recLinesLayer.createRecreationLinesSource,
      recLinesLayer.createRecreationLinesLayer,
      recLinesLayer.createRecreationLineStyle,
      options,
    );
    expect(result.current).toEqual({ layer: 'mockLayer' });
  });

  it('calls useLayer with default options when none provided', () => {
    const recResourceIds = ['REC123'];

    renderHook(() => useRecreationLinesLayer(recResourceIds, mapRef));

    expect(mockUseLayer).toHaveBeenCalledWith(
      mapRef,
      recLinesLayer.createRecreationLinesSource,
      recLinesLayer.createRecreationLinesLayer,
      recLinesLayer.createRecreationLineStyle,
      undefined,
    );
  });
});
