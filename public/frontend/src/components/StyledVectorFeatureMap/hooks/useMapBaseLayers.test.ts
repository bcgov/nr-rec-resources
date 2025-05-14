import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import VectorTileLayer from 'ol/layer/VectorTile';
import { applyStyle } from 'ol-mapbox-style';
import { TestQueryClientProvider } from '@/test-utils';
import {
  useGetMapStyles,
  useMapBaseLayers,
} from '@/components/StyledVectorFeatureMap/hooks';

// Mock dependencies
vi.mock('@/components/StyledVectorFeatureMap/hooks/useGetMapStyles', () => ({
  useGetMapStyles: vi.fn(),
}));

vi.mock('ol-mapbox-style', () => ({
  applyStyle: vi.fn(),
}));

describe('useMapBaseLayers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return base layers array', () => {
    (useGetMapStyles as Mock).mockReturnValue({ data: null });

    const { result } = renderHook(() => useMapBaseLayers(), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current).toHaveLength(1);
    expect(result.current[0]).toBeInstanceOf(VectorTileLayer);
  });

  it('should apply styles when glStyles data is available', () => {
    const mockStyles = { version: 8, layers: [] };
    (useGetMapStyles as Mock).mockReturnValue({ data: mockStyles });

    renderHook(() => useMapBaseLayers(), {
      wrapper: TestQueryClientProvider,
    });

    expect(applyStyle).toHaveBeenCalledTimes(1);
    expect(applyStyle).toHaveBeenCalledWith(
      expect.any(VectorTileLayer),
      mockStyles,
      'esri',
    );
  });

  it('should not apply styles when glStyles data is null', () => {
    (useGetMapStyles as Mock).mockReturnValue({ data: null });

    renderHook(() => useMapBaseLayers(), {
      wrapper: TestQueryClientProvider,
    });

    expect(applyStyle).not.toHaveBeenCalled();
  });

  it('should create VectorTileLayer with correct source configuration', () => {
    (useGetMapStyles as Mock).mockReturnValue({ data: null });

    const { result } = renderHook(() => useMapBaseLayers(), {
      wrapper: TestQueryClientProvider,
    });
    const layer = result.current[0];
    const source = layer.getSource();

    expect(source).toBeDefined();
    expect(source?.getUrls()?.[0]).toContain('BC_BASEMAP_20240307');
  });
});
