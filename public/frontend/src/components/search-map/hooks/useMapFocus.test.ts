import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { useMapFocus } from './useMapFocus';
import { SearchMapFocusModes } from '@/components/search-map/constants';
import { useMapFocusParam } from '@/components/search-map/hooks/useMapFocusParam';
import { useGetRecreationResourceById } from '@/service/queries/recreation-resource';
import { focusRecResourceOnMap } from '@/components/search-map/hooks/helpers';

// Mock all dependencies
vi.mock('@/components/search-map/hooks/useMapFocusParam');
vi.mock('@/service/queries/recreation-resource');
vi.mock('@/components/search-map/hooks/helpers');

describe('useMapFocus', () => {
  // Mock setup
  const mockMap = { getView: vi.fn() };
  const mockMapView = { fit: vi.fn() };
  const mockOverlay = { setPosition: vi.fn() };
  const mockOnFocusedFeatureChange = vi.fn();

  const mockUseMapFocusParam = useMapFocusParam as Mock;
  const mockUseGetRecreationResourceById = useGetRecreationResourceById as Mock;
  const mockFocusRecResourceOnMap = focusRecResourceOnMap as Mock;

  // Test data
  const defaultProps = {
    mapRef: { current: { getMap: vi.fn(() => mockMap) } },
    onFocusedFeatureChange: mockOnFocusedFeatureChange,
    overlayRef: { current: mockOverlay },
  };

  const validFocusResult = {
    focusCenter: [100, 200],
    focusExtent: [50, 150, 150, 250],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    mockMap.getView.mockReturnValue(mockMapView);
    mockUseMapFocusParam.mockReturnValue({
      mode: SearchMapFocusModes.REC_RESOURCE_ID,
      value: 'test-id',
      resetParams: vi.fn(),
    });
    mockUseGetRecreationResourceById.mockReturnValue({
      data: { id: 'test-id', name: 'Test Resource' },
    });
    mockFocusRecResourceOnMap.mockReturnValue(validFocusResult);
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it.each([
      {
        mode: SearchMapFocusModes.REC_RESOURCE_ID,
        expectedLoading: true,
        expectedProgress: 60,
      },
      { mode: 'OTHER_MODE', expectedLoading: false, expectedProgress: 0 },
    ])(
      'should handle mode $mode correctly',
      ({ mode, expectedLoading, expectedProgress }) => {
        mockUseMapFocusParam.mockReturnValue({
          mode,
          value: 'test-id',
          resetParams: vi.fn(),
        });

        const { result } = renderHook(() => useMapFocus(defaultProps as any));

        expect(result.current.isMapFocusLoading).toBe(expectedLoading);
        expect(result.current.loadingProgress).toBe(expectedProgress);

        if (expectedLoading) {
          expect(result.current.focusCenter).toEqual(
            validFocusResult.focusCenter,
          );
          expect(result.current.focusExtent).toEqual(
            validFocusResult.focusExtent,
          );
        } else {
          expect(result.current.focusCenter).toBeUndefined();
          expect(result.current.focusExtent).toBeUndefined();
        }
      },
    );
  });

  describe('focus conditions', () => {
    it.each([
      {
        scenario: 'already focused',
        setup: () => {
          const hook = renderHook(() => useMapFocus(defaultProps as any));
          act(() => {
            const fitCallback = mockMapView.fit.mock.calls[0][1].callback;
            fitCallback(true);
            vi.advanceTimersByTime(300);
          });
          vi.clearAllMocks();
          return hook;
        },
      },
      {
        scenario: 'wrong mode',
        setup: () => {
          mockUseMapFocusParam.mockReturnValue({
            mode: 'OTHER_MODE',
            value: 'test-id',
            resetParams: vi.fn(),
          });
          return renderHook(() => useMapFocus(defaultProps as any));
        },
      },
      {
        scenario: 'empty value',
        setup: () => {
          mockUseMapFocusParam.mockReturnValue({
            mode: SearchMapFocusModes.REC_RESOURCE_ID,
            value: '',
            resetParams: vi.fn(),
          });
          return renderHook(() => useMapFocus(defaultProps as any));
        },
      },
      {
        scenario: 'null resource',
        setup: () => {
          mockUseGetRecreationResourceById.mockReturnValue({ data: null });
          return renderHook(() => useMapFocus(defaultProps as any));
        },
      },
      {
        scenario: 'null map',
        setup: () => {
          const props = { ...defaultProps, mapRef: { current: null } };
          return renderHook(() => useMapFocus(props as any));
        },
      },
      {
        scenario: 'getMap returns null',
        setup: () => {
          const props = {
            ...defaultProps,
            mapRef: { current: { getMap: vi.fn(() => null) } },
          };
          return renderHook(() => useMapFocus(props as any));
        },
      },
    ])('should not focus when $scenario', ({ setup }) => {
      setup();
      expect(mockFocusRecResourceOnMap).not.toHaveBeenCalled();
    });

    it.each([null, undefined])('should not focus when value is %s', (value) => {
      mockUseMapFocusParam.mockReturnValue({
        mode: SearchMapFocusModes.REC_RESOURCE_ID,
        value,
        resetParams: vi.fn(),
      });

      renderHook(() => useMapFocus(defaultProps as any));
      expect(mockFocusRecResourceOnMap).not.toHaveBeenCalled();
    });
  });

  describe('successful focus flow', () => {
    it('should complete full focus flow', () => {
      const mockResetParams = vi.fn();
      mockUseMapFocusParam.mockReturnValue({
        mode: SearchMapFocusModes.REC_RESOURCE_ID,
        value: 'test-id',
        resetParams: mockResetParams,
      });

      const { result } = renderHook(() => useMapFocus(defaultProps as any));

      expect(result.current.isMapFocusLoading).toBe(true);
      expect(result.current.loadingProgress).toBe(60);
      expect(result.current.focusCenter).toEqual(validFocusResult.focusCenter);
      expect(result.current.focusExtent).toEqual(validFocusResult.focusExtent);

      expect(mockFocusRecResourceOnMap).toHaveBeenCalledWith(
        mockMap,
        { id: 'test-id', name: 'Test Resource' },
        mockOnFocusedFeatureChange,
      );

      expect(mockOverlay.setPosition).toHaveBeenCalledWith(
        validFocusResult.focusCenter,
      );

      expect(mockMapView.fit).toHaveBeenCalledWith(
        validFocusResult.focusExtent,
        expect.objectContaining({
          maxZoom: 12,
          duration: 1000,
          callback: expect.any(Function),
        }),
      );

      // Complete focus
      act(() => {
        const fitCallback = mockMapView.fit.mock.calls[0][1].callback;
        fitCallback(true);
        vi.advanceTimersByTime(300);
      });

      expect(result.current.isMapFocusLoading).toBe(false);
      expect(result.current.loadingProgress).toBe(0);
      expect(mockResetParams).toHaveBeenCalled();
    });

    it('should handle failed fit callback', () => {
      const { result } = renderHook(() => useMapFocus(defaultProps as any));

      act(() => {
        const fitCallback = mockMapView.fit.mock.calls[0][1].callback;
        fitCallback(false);
      });

      expect(result.current.isMapFocusLoading).toBe(true);
      expect(result.current.loadingProgress).toBe(60);
    });
  });

  describe('overlay handling', () => {
    it('should handle null overlay gracefully', () => {
      const props = { ...defaultProps, overlayRef: { current: null } };

      expect(() => {
        renderHook(() => useMapFocus(props as any));
      }).not.toThrow();
    });

    it('should position overlay when available', () => {
      renderHook(() => useMapFocus(defaultProps as any));
      expect(mockOverlay.setPosition).toHaveBeenCalledWith(
        validFocusResult.focusCenter,
      );
    });
  });

  describe('progress tracking', () => {
    it('should track loading progress through stages', () => {
      const { result } = renderHook(() => useMapFocus(defaultProps as any));

      expect(result.current.loadingProgress).toBe(60);

      act(() => {
        const fitCallback = mockMapView.fit.mock.calls[0][1].callback;
        fitCallback(true);
      });

      expect(result.current.loadingProgress).toBe(100);

      act(() => vi.advanceTimersByTime(300));
      expect(result.current.loadingProgress).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle null focus result', () => {
      mockFocusRecResourceOnMap.mockReturnValue(null);

      const { result } = renderHook(() => useMapFocus(defaultProps as any));

      expect(mockOverlay.setPosition).not.toHaveBeenCalled();
      expect(result.current.loadingProgress).toBe(0);
    });

    it('should handle undefined resource data', () => {
      mockUseGetRecreationResourceById.mockReturnValue({ data: undefined });

      const { result } = renderHook(() => useMapFocus(defaultProps as any));

      expect(result.current.isMapFocusLoading).toBe(true);
      expect(result.current.loadingProgress).toBe(0);
      expect(mockFocusRecResourceOnMap).not.toHaveBeenCalled();
    });

    it('should re-run effect when dependencies change', () => {
      const { rerender } = renderHook(() => useMapFocus(defaultProps as any));

      // Clear initial calls
      vi.clearAllMocks();

      // Update mock to trigger re-run
      mockUseMapFocusParam.mockReturnValue({
        mode: SearchMapFocusModes.REC_RESOURCE_ID,
        value: 'new-value',
        resetParams: vi.fn(),
      });

      mockUseGetRecreationResourceById.mockReturnValue({
        data: { id: 'new-value', name: 'New Resource' },
      });

      rerender();
      expect(mockFocusRecResourceOnMap).toHaveBeenCalled();
    });
  });
});
