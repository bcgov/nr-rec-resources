import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { useMapFocus } from './useMapFocus';
import { SearchMapFocusModes } from '@/components/search-map/constants';
import { useMapFocusParam } from '@/components/search-map/hooks/useMapFocusParam';
import { useGetRecreationResourceById } from '@/service/queries/recreation-resource';
import { focusRecResourceOnMap } from '@/components/search-map/hooks/helpers';

// --- mocks ---
vi.mock('@/components/search-map/hooks/useMapFocusParam', () => ({
  useMapFocusParam: vi.fn(),
}));

vi.mock('@/service/queries/recreation-resource', () => ({
  useGetRecreationResourceById: vi.fn(),
}));

vi.mock('@/components/search-map/hooks/helpers', () => ({
  focusRecResourceOnMap: vi.fn(),
}));

describe('useMapFocus', () => {
  let mockMap: any;
  let mockView: any;
  let mockOverlay: any;
  let mockOnFocusedFeatureChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockView = { fit: vi.fn() };
    mockMap = {
      getView: vi.fn(() => mockView),
      once: vi.fn((event, cb) => {
        if (event === 'rendercomplete') cb(); // immediately call for test
      }),
    };
    mockOverlay = { setPosition: vi.fn() };
    mockOnFocusedFeatureChange = vi.fn();

    (useMapFocusParam as unknown as Mock).mockReturnValue({
      mode: SearchMapFocusModes.REC_RESOURCE_ID,
      value: '123',
      resetParams: vi.fn(),
    });

    (useGetRecreationResourceById as unknown as Mock).mockReturnValue({
      data: { rec_resource_id: '123', name: 'Test Site' },
    });

    (focusRecResourceOnMap as unknown as Mock).mockReturnValue({
      focusCenter: [1, 2],
      focusExtent: [0, 0, 10, 10],
    });
  });

  it('returns loading state initially when mode is REC_RESOURCE_ID', () => {
    mockMap.once = vi.fn();
    const { result } = renderHook(() =>
      useMapFocus({
        mapRef: { current: { getMap: () => mockMap } },
        onFocusedFeatureChange: mockOnFocusedFeatureChange,
        overlayRef: { current: mockOverlay },
      }),
    );

    expect(result.current.isMapFocusLoading).toBe(true);
  });

  it('focuses resource on map and updates state after rendercomplete', () => {
    const resetParams = vi.fn();
    (useMapFocusParam as unknown as Mock).mockReturnValue({
      mode: SearchMapFocusModes.REC_RESOURCE_ID,
      value: '123',
      resetParams,
    });

    const { result } = renderHook(() =>
      useMapFocus({
        mapRef: { current: { getMap: () => mockMap } },
        onFocusedFeatureChange: mockOnFocusedFeatureChange,
        overlayRef: { current: mockOverlay },
      }),
    );

    // after effect runs and rendercomplete triggers
    expect(focusRecResourceOnMap).toHaveBeenCalledWith(
      mockMap,
      { rec_resource_id: '123', name: 'Test Site' },
      mockOnFocusedFeatureChange,
    );

    expect(mockOverlay.setPosition).toHaveBeenCalledWith([1, 2]);
    expect(mockView.fit).toHaveBeenCalledWith([0, 0, 10, 10], { maxZoom: 12 });

    expect(result.current.focusCenter).toEqual([1, 2]);
    expect(result.current.focusExtent).toEqual([0, 0, 10, 10]);
    expect(result.current.isMapFocusLoading).toBe(false);
    expect(resetParams).toHaveBeenCalled();
  });

  it('does nothing if focusRecResourceOnMap returns null', () => {
    (focusRecResourceOnMap as unknown as Mock).mockReturnValue(null);

    const { result } = renderHook(() =>
      useMapFocus({
        mapRef: { current: { getMap: () => mockMap } },
        onFocusedFeatureChange: mockOnFocusedFeatureChange,
        overlayRef: { current: mockOverlay },
      }),
    );

    expect(result.current.focusCenter).toBeUndefined();
    expect(result.current.focusExtent).toBeUndefined();
  });

  it('does nothing if mode is not REC_RESOURCE_ID', () => {
    (useMapFocusParam as unknown as Mock).mockReturnValue({
      mode: 'OTHER_MODE',
      value: '123',
      resetParams: vi.fn(),
    });

    const { result } = renderHook(() =>
      useMapFocus({
        mapRef: { current: { getMap: () => mockMap } },
        onFocusedFeatureChange: mockOnFocusedFeatureChange,
        overlayRef: { current: mockOverlay },
      }),
    );

    expect(focusRecResourceOnMap).not.toHaveBeenCalled();
    expect(result.current.focusCenter).toBeUndefined();
    expect(result.current.focusExtent).toBeUndefined();
  });

  it('does nothing if mapRef.current.getMap() returns null', () => {
    const { result } = renderHook(() =>
      useMapFocus({
        mapRef: { current: { getMap: () => null as any } },
        onFocusedFeatureChange: mockOnFocusedFeatureChange,
        overlayRef: { current: mockOverlay },
      }),
    );

    expect(focusRecResourceOnMap).not.toHaveBeenCalled();
    expect(result.current.focusCenter).toBeUndefined();
    expect(result.current.focusExtent).toBeUndefined();
  });

  it('does nothing if focusRecResourceOnMap returns null', () => {
    (focusRecResourceOnMap as unknown as Mock).mockReturnValue(null);

    const { result } = renderHook(() =>
      useMapFocus({
        mapRef: { current: { getMap: () => mockMap } },
        onFocusedFeatureChange: mockOnFocusedFeatureChange,
        overlayRef: { current: mockOverlay },
      }),
    );

    expect(mockOverlay.setPosition).not.toHaveBeenCalled();
    expect(result.current.focusCenter).toBeUndefined();
    expect(result.current.focusExtent).toBeUndefined();
  });
});
