import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useRecreationFeatureLayerPreview } from './useRecreationFeatureLayerPreview';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { locationDotOrangeIcon } from '@/components/search-map/styles/icons';

const mockAddOverlay = vi.fn();
const mockRemoveOverlay = vi.fn();
const mockAddInteraction = vi.fn();
const mockRemoveInteraction = vi.fn();
const mockSetPosition = vi.fn();
const mockAnimate = vi.fn();
const mockClear = vi.fn();

const mockSelectOn = vi.fn();
const mockMapOn = vi.fn();

const mockClusterFeature = { get: vi.fn(), setStyle: vi.fn() };

const mockLayer = {
  getSource: () => ({
    getFeatures: () => [mockClusterFeature],
    getSource: () => ({
      on: vi.fn(),
      un: vi.fn(),
    }),
  }),
  setStyle: vi.fn(),
};

vi.mock('ol/interaction/Select', () => ({
  default: vi.fn().mockImplementation(() => ({
    on: mockSelectOn,
    getFeatures: () => ({ clear: mockClear, push: vi.fn() }),
  })),
}));

vi.mock('ol/Overlay', () => ({
  default: vi.fn().mockImplementation(() => ({
    setPosition: mockSetPosition,
  })),
}));

vi.mock('ol/events/condition', () => ({
  click: vi.fn(),
}));

const mockMap = {
  addOverlay: mockAddOverlay,
  removeOverlay: mockRemoveOverlay,
  addInteraction: mockAddInteraction,
  removeInteraction: mockRemoveInteraction,
  on: mockMapOn,
  getView: () => ({ animate: mockAnimate }),
  forEachFeatureAtPixel: vi.fn(),
  getTargetElement: () => ({ style: { cursor: '' } }),
};

describe('useRecreationFeatureLayerPreview hook', () => {
  let onFeatureSelect: ReturnType<typeof vi.fn>;
  let popupRef: { current: HTMLDivElement | null };
  let mapRef: any;

  beforeEach(() => {
    vi.clearAllMocks();

    onFeatureSelect = vi.fn();
    popupRef = { current: document.createElement('div') };
    mapRef = { current: { getMap: () => mockMap } };

    global.requestAnimationFrame = (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    };
  });

  it('adds overlay and select interaction on mount and cleans up on unmount', () => {
    const { unmount } = renderHook(() => {
      const ref = useRecreationFeatureLayerPreview({
        mapRef,
        layer: mockLayer,
        onFeatureSelect,
      });
      ref.current = popupRef.current;
      return ref;
    });

    expect(mockAddOverlay).toHaveBeenCalled();
    expect(mockAddInteraction).toHaveBeenCalled();
    expect(mockSelectOn).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Function),
    );
    expect(mockMapOn).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Function),
    );

    unmount();

    expect(mockRemoveOverlay).toHaveBeenCalled();
    expect(mockRemoveInteraction).toHaveBeenCalled();
  });

  it('clears selection and calls onFeatureSelect(null) when no feature is selected', () => {
    renderHook(() => {
      const ref = useRecreationFeatureLayerPreview({
        mapRef,
        layer: mockLayer,
        onFeatureSelect,
      });
      ref.current = popupRef.current;
      return ref;
    });

    const selectCallback = mockSelectOn.mock.calls.find(
      ([event]) => event === 'select',
    )?.[1];
    expect(selectCallback).toBeDefined();

    act(() => {
      selectCallback({ selected: [], deselected: [] });
    });

    expect(onFeatureSelect).toHaveBeenCalledWith(null);
  });

  it('styles a feature and centers it on the map on selection', () => {
    const singleFeature = new Feature();
    singleFeature.getGeometry = vi.fn().mockReturnValue(new Point([10, 20]));
    singleFeature.set = vi.fn();
    singleFeature.setStyle = vi.fn();

    const selectedClusterFeature = {
      get: vi.fn().mockReturnValue([singleFeature]),
      setStyle: vi.fn(),
    };

    renderHook(() => {
      const ref = useRecreationFeatureLayerPreview({
        mapRef,
        layer: mockLayer,
        onFeatureSelect,
      });
      ref.current = popupRef.current;
      return ref;
    });

    const selectCallback = mockSelectOn.mock.calls.find(
      ([event]) => event === 'select',
    )?.[1];
    expect(selectCallback).toBeDefined();

    act(() => {
      selectCallback({
        selected: [selectedClusterFeature],
        deselected: [],
      });
    });

    expect(selectedClusterFeature.setStyle).toHaveBeenCalled();
    expect(singleFeature.set).toHaveBeenCalledWith('selected', true);
    expect(onFeatureSelect).toHaveBeenCalledWith(singleFeature);
    expect(mockSetPosition).toHaveBeenCalledWith([10, 20]);
    expect(mockAnimate).toHaveBeenCalledWith({
      center: [10, 20],
      duration: 400,
    });
  });

  it('clears selection when selecting a cluster with multiple features', () => {
    const cluster = {
      get: vi.fn().mockReturnValue([new Feature(), new Feature()]),
      setStyle: vi.fn(),
    };

    renderHook(() => {
      const ref = useRecreationFeatureLayerPreview({
        mapRef,
        layer: mockLayer,
        onFeatureSelect,
      });
      ref.current = popupRef.current;
      return ref;
    });

    const selectCallback = mockSelectOn.mock.calls.find(
      ([event]) => event === 'select',
    )?.[1];
    expect(selectCallback).toBeDefined();

    act(() => {
      selectCallback({
        selected: [cluster],
        deselected: [],
      });
    });

    expect(mockClear).toHaveBeenCalled();
    expect(onFeatureSelect).toHaveBeenCalledWith(null);
  });

  it('clears selection on moveend when selected feature is part of a cluster with multiple features', () => {
    const singleFeature = new Feature();

    const clusterWithMultipleFeatures = {
      get: vi.fn().mockReturnValue([singleFeature, new Feature()]),
      setStyle: vi.fn(),
    };

    const layerWithBigCluster = {
      getSource: () => ({
        getFeatures: () => [clusterWithMultipleFeatures],
      }),
      setStyle: vi.fn(),
    };

    renderHook(() => {
      const ref = useRecreationFeatureLayerPreview({
        mapRef,
        layer: layerWithBigCluster,
        onFeatureSelect,
      });
      ref.current = popupRef.current;
      return ref;
    });

    const selectCallback = mockSelectOn.mock.calls.find(
      ([event]) => event === 'select',
    )?.[1];
    expect(selectCallback).toBeDefined();

    act(() => {
      selectCallback({
        selected: [
          {
            get: () => [singleFeature],
            setStyle: vi.fn(),
          },
        ],
        deselected: [],
      });
    });

    const moveEndCallback = mockMapOn.mock.calls.find(
      ([event]) => event === 'moveend',
    )?.[1];
    expect(moveEndCallback).toBeDefined();

    act(() => {
      moveEndCallback();
    });

    expect(onFeatureSelect).toHaveBeenCalledWith(null);
  });

  it('auto-selects and focuses the only feature when the layer contains only one feature', () => {
    const singleFeature = new Feature();
    singleFeature.getGeometry = vi.fn().mockReturnValue(new Point([30, 40]));
    singleFeature.set = vi.fn();
    singleFeature.setStyle = vi.fn();

    const singleClusterFeature = {
      get: vi.fn().mockReturnValue([singleFeature]),
      setStyle: vi.fn(),
    };

    const layerWithSingleFeature = {
      getSource: () => ({
        getFeatures: () => [singleClusterFeature],
        getSource: () => ({
          on: vi.fn(),
          un: vi.fn(),
        }),
      }),
      setStyle: vi.fn(),
    };

    renderHook(() => {
      const ref = useRecreationFeatureLayerPreview({
        mapRef,
        layer: layerWithSingleFeature,
        onFeatureSelect,
      });
      ref.current = popupRef.current;
      return ref;
    });

    expect(singleClusterFeature.setStyle).toHaveBeenCalledWith(
      locationDotOrangeIcon,
    );
    expect(singleFeature.set).toHaveBeenCalledWith('selected', true);
    expect(mockSetPosition).toHaveBeenCalledWith([30, 40]);
    expect(onFeatureSelect).toHaveBeenCalledWith(singleFeature);
  });

  it('adjusts cluster source distance based on zoom level threshold', () => {
    const mockSetDistance = vi.fn();
    const layerWithSetDistance = {
      ...mockLayer,
      getSource: () => ({
        ...mockLayer.getSource(),
        setDistance: mockSetDistance,
      }),
    };

    const mockView = {
      getZoom: vi.fn(),
    };

    const clusterZoomThreshold = 12;

    mockView.getZoom.mockReturnValue(13);
    const zoomAbove = mockView.getZoom();
    if (zoomAbove >= clusterZoomThreshold) {
      layerWithSetDistance.getSource().setDistance(0);
    }
    expect(mockSetDistance).toHaveBeenCalledWith(0);

    mockView.getZoom.mockReturnValue(10);
    layerWithSetDistance.getSource().setDistance(40);
    expect(mockSetDistance).toHaveBeenCalledWith(40);
  });
});
