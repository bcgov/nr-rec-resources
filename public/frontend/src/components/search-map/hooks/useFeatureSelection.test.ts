import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, cleanup } from '@testing-library/react';
import { useFeatureSelection } from './useFeatureSelection';
import type { RefObject } from 'react';

import Point from 'ol/geom/Point';

const mockOverlay = {
  setPosition: vi.fn(),
};

const mockSelect = {
  on: vi.fn(),
  getFeatures: vi.fn(() => ({
    clear: vi.fn(),
    push: vi.fn(),
  })),
};

const mockAnimate = vi.fn();

const mockMap = {
  addOverlay: vi.fn(),
  removeOverlay: vi.fn(),
  addInteraction: vi.fn(),
  removeInteraction: vi.fn(),
  getView: vi.fn(() => ({
    animate: mockAnimate,
  })),
  getOverlays: vi.fn(() => []),
  on: vi.fn(),
  renderSync: vi.fn(),
  getPixelFromCoordinate: vi.fn((coord) => coord),
  getCoordinateFromPixel: vi.fn((pixel) => pixel),
};

const mockFeature = {
  setStyle: vi.fn(),
  set: vi.fn(),
  get: vi.fn(),
  getGeometry: vi.fn(),
};

const mockLayer = {
  getSource: vi.fn(() => ({
    getFeatures: vi.fn(() => [mockFeature]),
    on: vi.fn(),
    un: vi.fn(),
  })),
  setZIndex: vi.fn(),
};

const mockClusteredLayer = {
  getSource: vi.fn(() => ({
    getSource: vi.fn(() => ({
      on: vi.fn(),
      un: vi.fn(),
    })),
    getFeatures: vi.fn(() => [mockFeature]),
  })),
  setZIndex: vi.fn(),
};

vi.mock('ol/interaction/Select', () => ({
  default: vi.fn(() => mockSelect),
}));

vi.mock('ol/Overlay', () => ({
  default: vi.fn(() => mockOverlay),
}));

vi.mock('ol/events/condition', () => ({
  click: 'click',
}));

vi.mock('@/components/search-map/styles/icons', () => ({
  locationDotOrangeIcon: 'default-orange-icon',
}));

const createMockMapRef = (map = mockMap) =>
  ({
    current: { getMap: () => map },
  }) as RefObject<{ getMap: () => any }>;

const createMockPopupRef = () =>
  ({
    current: document.createElement('div'),
  }) as RefObject<HTMLDivElement>;

describe('useFeatureSelection', () => {
  let mockMapRef: RefObject<{ getMap: () => any }>;
  let mockPopupRef: RefObject<HTMLDivElement>;
  let mockFeatureLayer: any;
  let mockOnFeatureSelect: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockMapRef = createMockMapRef();
    mockPopupRef = createMockPopupRef();
    mockOnFeatureSelect = vi.fn();

    mockFeatureLayer = {
      id: 'test-layer',
      layer: mockLayer,
      onFeatureSelect: mockOnFeatureSelect,
    };

    mockFeature.getGeometry.mockReturnValue(new Point([0, 0]));
    mockFeature.get.mockReturnValue(false);
    mockSelect.getFeatures.mockReturnValue({
      clear: vi.fn(),
      push: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('should initialize overlay and select interaction when dependencies are available', () => {
    renderHook(() =>
      useFeatureSelection({
        mapRef: mockMapRef,
        featureLayers: [mockFeatureLayer],
        popupRef: mockPopupRef,
      }),
    );

    expect(mockMap.addOverlay).toHaveBeenCalledTimes(1);
    expect(mockMap.addInteraction).toHaveBeenCalledTimes(1);
  });

  it('should clean up interactions and overlays on unmount', () => {
    const { unmount } = renderHook(() =>
      useFeatureSelection({
        mapRef: mockMapRef,
        featureLayers: [mockFeatureLayer],
        popupRef: mockPopupRef,
      }),
    );

    unmount();

    expect(mockMap.removeInteraction).toHaveBeenCalledWith(mockSelect);
    expect(mockMap.removeOverlay).toHaveBeenCalledWith(mockOverlay);
  });

  it('should apply default style when no selectedStyle is provided', () => {
    renderHook(() =>
      useFeatureSelection({
        mapRef: mockMapRef,
        featureLayers: [mockFeatureLayer],
        popupRef: mockPopupRef,
      }),
    );

    const selectHandler = mockSelect.on.mock.calls.find(
      (call) => call[0] === 'select',
    )?.[1];

    if (selectHandler) {
      selectHandler({
        selected: [mockFeature],
        deselected: [],
      });

      expect(mockFeature.setStyle).toHaveBeenCalledWith('default-orange-icon');
      expect(mockFeature.set).toHaveBeenCalledWith('selected', true);
      expect(mockOnFeatureSelect).toHaveBeenCalledWith(mockFeature);
    }
  });

  it('should apply custom selectedStyle when provided', () => {
    const customStyle = 'custom-style';
    const featureLayerWithStyle = {
      ...mockFeatureLayer,
      selectedStyle: customStyle,
    };

    renderHook(() =>
      useFeatureSelection({
        mapRef: mockMapRef,
        featureLayers: [featureLayerWithStyle],
        popupRef: mockPopupRef,
      }),
    );

    const selectHandler = mockSelect.on.mock.calls.find(
      (call) => call[0] === 'select',
    )?.[1];

    if (selectHandler) {
      selectHandler({
        selected: [mockFeature],
        deselected: [],
      });

      expect(mockFeature.setStyle).toHaveBeenCalledWith(customStyle);
    }
  });

  it('should apply function-based selectedStyle when provided', () => {
    const customStyleFn = vi.fn(() => 'function-style');
    const featureLayerWithStyleFn = {
      ...mockFeatureLayer,
      selectedStyle: customStyleFn,
    };

    renderHook(() =>
      useFeatureSelection({
        mapRef: mockMapRef,
        featureLayers: [featureLayerWithStyleFn],
        popupRef: mockPopupRef,
      }),
    );

    const selectHandler = mockSelect.on.mock.calls.find(
      (call) => call[0] === 'select',
    )?.[1];

    if (selectHandler) {
      selectHandler({
        selected: [mockFeature],
        deselected: [],
      });

      expect(customStyleFn).toHaveBeenCalledWith(mockFeature);
      expect(mockFeature.setStyle).toHaveBeenCalledWith('function-style');
    }
  });

  it('should handle clustered layers correctly', () => {
    const clusteredFeatureLayer = {
      id: 'clustered-layer',
      layer: mockClusteredLayer,
      onFeatureSelect: mockOnFeatureSelect,
    };

    const mockClusterFeature = {
      ...mockFeature,
      get: vi.fn((key) => (key === 'features' ? [mockFeature] : false)),
    };

    const mockPushFn = vi.fn();
    mockSelect.getFeatures.mockReturnValue({
      clear: vi.fn(),
      push: mockPushFn,
    });

    mockClusteredLayer.getSource.mockReturnValue({
      getSource: vi.fn(() => ({
        on: vi.fn(),
        un: vi.fn(),
      })),
      getFeatures: vi.fn(() => [mockClusterFeature]),
    });

    renderHook(() =>
      useFeatureSelection({
        mapRef: mockMapRef,
        featureLayers: [clusteredFeatureLayer],
        popupRef: mockPopupRef,
      }),
    );

    const selectHandler = mockSelect.on.mock.calls.find(
      (call) => call[0] === 'select',
    )?.[1];

    if (selectHandler) {
      selectHandler({
        selected: [mockClusterFeature],
        deselected: [],
      });

      expect(mockOnFeatureSelect).toHaveBeenCalledWith(mockFeature);
    }
  });

  it('should clear selection when cluster has multiple features', () => {
    const clusteredFeatureLayer = {
      id: 'clustered-layer',
      layer: mockClusteredLayer,
      onFeatureSelect: mockOnFeatureSelect,
    };

    const mockClusterFeature = {
      ...mockFeature,
      get: vi.fn((key) =>
        key === 'features' ? [mockFeature, mockFeature] : false,
      ),
    };

    const mockClearFn = vi.fn();
    mockSelect.getFeatures.mockReturnValue({
      clear: mockClearFn,
      push: vi.fn(),
    });

    mockClusteredLayer.getSource.mockReturnValue({
      getSource: vi.fn(() => ({
        on: vi.fn(),
        un: vi.fn(),
      })),
      getFeatures: vi.fn(() => [mockClusterFeature]),
    });

    renderHook(() =>
      useFeatureSelection({
        mapRef: mockMapRef,
        featureLayers: [clusteredFeatureLayer],
        popupRef: mockPopupRef,
      }),
    );

    const selectHandler = mockSelect.on.mock.calls.find(
      (call) => call[0] === 'select',
    )?.[1];

    if (selectHandler) {
      selectHandler({
        selected: [mockClusterFeature],
        deselected: [],
      });

      expect(mockClearFn).toHaveBeenCalled();
    }
  });

  it('should handle deselected features correctly', () => {
    renderHook(() =>
      useFeatureSelection({
        mapRef: mockMapRef,
        featureLayers: [mockFeatureLayer],
        popupRef: mockPopupRef,
      }),
    );

    const selectHandler = mockSelect.on.mock.calls.find(
      (call) => call[0] === 'select',
    )?.[1];

    if (selectHandler) {
      selectHandler({
        selected: [],
        deselected: [mockFeature],
      });

      expect(mockFeature.set).toHaveBeenCalledWith('selected', false);
      expect(mockFeature.setStyle).toHaveBeenCalledWith();
    }
  });

  it('should handle multiple feature layers', () => {
    const secondLayer = {
      id: 'second-layer',
      layer: mockLayer,
      onFeatureSelect: vi.fn(),
    };

    renderHook(() =>
      useFeatureSelection({
        mapRef: mockMapRef,
        featureLayers: [mockFeatureLayer, secondLayer],
        popupRef: mockPopupRef,
      }),
    );

    expect(mockMap.addOverlay).toHaveBeenCalledTimes(1);
    expect(mockMap.addInteraction).toHaveBeenCalledTimes(1);
  });

  it('should animate to feature position when selected', async () => {
    renderHook(() =>
      useFeatureSelection({
        mapRef: mockMapRef,
        featureLayers: [mockFeatureLayer],
        popupRef: mockPopupRef,
      }),
    );

    const selectHandler = mockSelect.on.mock.calls.find(
      (call) => call[0] === 'select',
    )?.[1];

    if (selectHandler) {
      selectHandler({
        selected: [mockFeature],
        deselected: [],
      });

      expect(mockOverlay.setPosition).toHaveBeenCalledWith([0, 0]);
      expect(mockAnimate).toHaveBeenCalledWith({
        center: [0, 0],
        duration: 400,
      });
    }
  });
});
