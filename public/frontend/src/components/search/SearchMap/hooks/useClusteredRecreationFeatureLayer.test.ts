import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import * as recreationLayer from '@/components/search/SearchMap/layers/recreationFeatureLayer';
import { useClusteredRecreationFeatureLayer } from '@/components/search/SearchMap/hooks/useClusteredRecreationFeatureLayer';

describe('useClusteredRecreationFeatureLayer', () => {
  const mockSetSource = vi.fn();

  beforeEach(() => {
    vi.spyOn(
      recreationLayer,
      'createClusteredRecreationFeatureSource',
    ).mockImplementation(() => ({ source: 'mockSource' }) as any);
    vi.spyOn(
      recreationLayer,
      'createClusteredRecreationFeatureLayer',
    ).mockImplementation(
      () => ({ layer: 'mockLayer', setSource: mockSetSource }) as any,
    );
  });

  it('returns clustered layer, source, and style', () => {
    const { result } = renderHook(() =>
      useClusteredRecreationFeatureLayer(['1', '2']),
    );

    expect(
      recreationLayer.createClusteredRecreationFeatureSource,
    ).toHaveBeenCalledTimes(2);
    expect(
      recreationLayer.createClusteredRecreationFeatureLayer,
    ).toHaveBeenCalledTimes(1);
    expect(mockSetSource).toHaveBeenCalled();

    expect(result.current.source).toEqual({ source: 'mockSource' });
    expect(result.current.layer).toEqual({
      layer: 'mockLayer',
      setSource: mockSetSource,
    });
  });

  it('recreates source when recResourceIds change', () => {
    const { rerender } = renderHook(
      ({ ids }) => useClusteredRecreationFeatureLayer(ids),
      {
        initialProps: { ids: ['1', '2'] },
      },
    );

    rerender({ ids: ['3', '4'] });

    expect(
      recreationLayer.createClusteredRecreationFeatureSource,
    ).toHaveBeenCalledTimes(4);
  });
});
