import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockedClass,
  type MockedFunction,
} from 'vitest';
import { renderHook } from '@testing-library/react';
import { RefObject } from 'react';
import { useFeatureSelection } from './useFeatureSelection';
import type Feature from 'ol/Feature';
import type OLMap from 'ol/Map';
import type Overlay from 'ol/Overlay';
import type { FeatureLayerConfig } from '@/components/search-map/hooks/types';
import Select from 'ol/interaction/Select';
import {
  applySelectedStyle,
  centerMapOnFeature,
  getFeatureLayerConfig,
  getPointFeatureCoordinates,
  isClusteredLayer,
} from '@/components/search-map/hooks/helpers';

vi.mock('ol/interaction/Select');
vi.mock('ol/Overlay');
vi.mock('ol/events/condition', () => ({
  click: 'click-condition',
}));

vi.mock('@/components/search-map/hooks/helpers', () => ({
  applySelectedStyle: vi.fn(),
  centerMapOnFeature: vi.fn(),
  getFeatureLayerConfig: vi.fn(),
  getPointFeatureCoordinates: vi.fn(() => [100, 200]),
  isClusteredLayer: vi.fn(),
}));

const MockSelect = Select as unknown as MockedClass<typeof Select>;
const mockApplySelectedStyle = applySelectedStyle as MockedFunction<
  typeof applySelectedStyle
>;
const mockCenterMapOnFeature = centerMapOnFeature as MockedFunction<
  typeof centerMapOnFeature
>;
const mockGetFeatureLayerConfig = getFeatureLayerConfig as MockedFunction<
  typeof getFeatureLayerConfig
>;
const mockGetPointFeatureCoordinates =
  getPointFeatureCoordinates as MockedFunction<
    typeof getPointFeatureCoordinates
  >;
const mockIsClusteredLayer = isClusteredLayer as MockedFunction<
  typeof isClusteredLayer
>;

describe('useFeatureSelection', () => {
  let mockMap: Partial<OLMap>;
  let mockOverlay: Partial<Overlay>;
  let mockFeature: Partial<Feature>;
  let mockLayer: any;
  let mockSource: any;
  let mockSelect: any;
  let mockMapRef: RefObject<{ getMap: () => OLMap } | null>;
  let mockOverlayRef: RefObject<Overlay | null>;
  let mockFeatureLayers: FeatureLayerConfig[];
  let mockView: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockFeature = {
      set: vi.fn(),
      setStyle: vi.fn(),
      get: vi.fn(),
      changed: vi.fn(),
    };

    mockSource = {
      getFeatures: vi.fn(() => [mockFeature]),
      getSource: vi.fn(() => mockSource),
    };

    mockLayer = {
      getSource: vi.fn(() => mockSource),
      setZIndex: vi.fn(),
      get: vi.fn(),
    };

    mockView = {
      getZoom: vi.fn(() => 10),
    };

    mockMap = {
      addInteraction: vi.fn(),
      removeInteraction: vi.fn(),
      on: vi.fn(),
      un: vi.fn(),
      getView: vi.fn(() => mockView),
      renderSync: vi.fn(),
      forEachFeatureAtPixel: vi.fn(),
      once: vi.fn((event, callback) => {
        if (event === 'rendercomplete') {
          callback();
        }
        return 'mock-event-key' as any;
      }),
    };

    mockOverlay = {
      setPosition: vi.fn(),
    };

    mockSelect = {
      on: vi.fn(),
      getFeatures: vi.fn(() => ({
        clear: vi.fn(),
      })),
    };

    MockSelect.mockImplementation(function () {
      return mockSelect;
    });

    mockMapRef = {
      current: { getMap: () => mockMap as OLMap },
    };

    mockOverlayRef = {
      current: mockOverlay as Overlay,
    };

    mockFeatureLayers = [
      {
        id: 'layer1',
        layer: mockLayer,
        onFeatureSelect: vi.fn(),
      },
    ];

    mockIsClusteredLayer.mockReturnValue(false);
    mockGetPointFeatureCoordinates.mockReturnValue([100, 200]);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('initialization', () => {
    it('should not initialize when mapRef is null', () => {
      const nullMapRef = { current: null };

      renderHook(() =>
        useFeatureSelection({
          mapRef: nullMapRef,
          featureLayers: mockFeatureLayers,
          overlayRef: mockOverlayRef,
        }),
      );

      expect(MockSelect).not.toHaveBeenCalled();
      expect(mockMap.addInteraction).not.toHaveBeenCalled();
    });

    it('should not initialize when featureLayers is empty', () => {
      renderHook(() =>
        useFeatureSelection({
          mapRef: mockMapRef,
          featureLayers: [],
          overlayRef: mockOverlayRef,
        }),
      );

      expect(MockSelect).not.toHaveBeenCalled();
      expect(mockMap.addInteraction).not.toHaveBeenCalled();
    });

    it('should initialize select interaction with correct parameters', () => {
      renderHook(() =>
        useFeatureSelection({
          mapRef: mockMapRef,
          featureLayers: mockFeatureLayers,
          overlayRef: mockOverlayRef,
        }),
      );

      expect(MockSelect).toHaveBeenCalledWith({
        condition: 'click-condition',
        layers: [mockLayer],
        style: null,
      });

      expect(mockMap.addInteraction).toHaveBeenCalledWith(mockSelect);
      expect(mockSelect.on).toHaveBeenCalledWith(
        'select',
        expect.any(Function),
      );
      expect(mockMap.on).toHaveBeenCalledWith('moveend', expect.any(Function));
    });

    it('should filter out falsy layers', () => {
      const layersWithNull = [
        { id: 'layer1', layer: mockLayer, onFeatureSelect: vi.fn() },
        { id: 'layer2', layer: null, onFeatureSelect: vi.fn() },
        { id: 'layer3', layer: undefined, onFeatureSelect: vi.fn() },
      ];

      renderHook(() =>
        useFeatureSelection({
          mapRef: mockMapRef,
          featureLayers: layersWithNull,
          overlayRef: mockOverlayRef,
        }),
      );

      expect(MockSelect).toHaveBeenCalledWith({
        condition: 'click-condition',
        layers: [mockLayer],
        style: null,
      });
    });
  });

  describe('clearSelection', () => {
    it('should return clearSelection function', () => {
      const { result } = renderHook(() =>
        useFeatureSelection({
          mapRef: mockMapRef,
          featureLayers: mockFeatureLayers,
          overlayRef: mockOverlayRef,
        }),
      );

      expect(result.current.clearSelection).toBeInstanceOf(Function);
    });

    it('should clear selection properly when called', () => {
      const { result } = renderHook(() =>
        useFeatureSelection({
          mapRef: mockMapRef,
          featureLayers: mockFeatureLayers,
          overlayRef: mockOverlayRef,
        }),
      );

      const selectHandler = mockSelect.on.mock.calls.find(
        ([event]: any) => event === 'select',
      )[1];

      mockGetFeatureLayerConfig.mockReturnValue(mockFeatureLayers[0]);

      (selectHandler as any)({
        deselected: [],
        selected: [mockFeature],
      });

      result.current.clearSelection();

      expect(mockFeature.set).toHaveBeenCalledWith('selected', false);
      expect(mockFeature.setStyle).toHaveBeenCalledWith();
      expect(mockOverlay.setPosition).toHaveBeenCalledWith(undefined);
      expect(mockFeatureLayers[0].onFeatureSelect).toHaveBeenCalledWith(null);
    });

    it('should handle clearSelection when no current selection exists', () => {
      const { result } = renderHook(() =>
        useFeatureSelection({
          mapRef: mockMapRef,
          featureLayers: mockFeatureLayers,
          overlayRef: mockOverlayRef,
        }),
      );

      expect(() => result.current.clearSelection()).not.toThrow();
    });

    it('should handle clearSelection when map is null', () => {
      const nullMapRef = { current: null };
      const { result } = renderHook(() =>
        useFeatureSelection({
          mapRef: nullMapRef,
          featureLayers: mockFeatureLayers,
          overlayRef: mockOverlayRef,
        }),
      );

      expect(() => result.current.clearSelection()).not.toThrow();
    });
  });

  describe('feature selection handling', () => {
    let selectHandler: any;

    beforeEach(() => {
      renderHook(() =>
        useFeatureSelection({
          mapRef: mockMapRef,
          featureLayers: mockFeatureLayers,
          overlayRef: mockOverlayRef,
        }),
      );

      selectHandler = mockSelect.on.mock.calls.find(
        ([event]: any) => event === 'select',
      )[1];
    });

    it('should handle deselected features', () => {
      const deselectedFeature = {
        ...mockFeature,
        set: vi.fn(),
        setStyle: vi.fn(),
      };

      mockGetFeatureLayerConfig.mockReturnValue(mockFeatureLayers[0]);
      mockIsClusteredLayer.mockReturnValue(false);

      (selectHandler as any)({
        deselected: [deselectedFeature],
        selected: [],
      });

      expect(deselectedFeature.set).toHaveBeenCalledWith('selected', false);
      expect(deselectedFeature.setStyle).toHaveBeenCalledWith();
    });

    it('should handle deselected clustered features', () => {
      const clusteredFeatures = [
        { set: vi.fn(), setStyle: vi.fn(), changed: vi.fn() },
        { set: vi.fn(), setStyle: vi.fn(), changed: vi.fn() },
      ];
      const deselectedFeature = {
        ...mockFeature,
        set: vi.fn(),
        setStyle: vi.fn(),
        get: vi.fn(() => clusteredFeatures),
      };

      mockGetFeatureLayerConfig.mockReturnValue(mockFeatureLayers[0]);
      mockIsClusteredLayer.mockReturnValue(true);

      (selectHandler as any)({
        deselected: [deselectedFeature],
        selected: [],
      });

      clusteredFeatures.forEach((f) => {
        expect(f.set).toHaveBeenCalledWith('selected', false);
        expect(f.setStyle).toHaveBeenCalledWith();
        expect(f.changed).toHaveBeenCalledWith();
      });
      expect(deselectedFeature.setStyle).toHaveBeenCalledWith();
    });

    it('should clear selection when no feature is selected', () => {
      mockSource.getFeatures.mockReturnValue([mockFeature]);
      mockFeatureLayers[0].layer.getSource.mockReturnValue(mockSource);
      mockIsClusteredLayer.mockReturnValue(false);

      (selectHandler as any)({
        deselected: [],
        selected: [mockFeature],
      });

      vi.clearAllMocks();

      (selectHandler as any)({
        deselected: [],
        selected: [],
      });

      expect(mockOverlay.setPosition).toHaveBeenCalledWith(undefined);
    });

    it('should focus on non-clustered feature', () => {
      mockSource.getFeatures.mockReturnValue([mockFeature]);
      mockFeatureLayers[0].layer.getSource.mockReturnValue(mockSource);
      mockIsClusteredLayer.mockReturnValue(false);

      (selectHandler as any)({
        deselected: [],
        selected: [mockFeature],
      });

      expect(mockApplySelectedStyle).toHaveBeenCalledWith(
        mockFeature,
        mockFeatureLayers[0],
      );
      expect(mockFeature.set).toHaveBeenCalledWith('selected', true);
      expect(mockCenterMapOnFeature).toHaveBeenCalledWith(
        mockMap,
        mockFeature,
        {},
      );
      expect(mockOverlay.setPosition).toHaveBeenCalledWith([100, 200]);
      expect(mockFeatureLayers[0].onFeatureSelect).toHaveBeenCalledWith(
        mockFeature,
      );
      expect(mockLayer.setZIndex).toHaveBeenCalledWith(10);
    });

    it('should focus on single feature in cluster', () => {
      const clusterFeature = [mockFeature];
      const selectedCluster = {
        get: vi.fn(() => clusterFeature),
      };

      mockSource.getFeatures.mockReturnValue([selectedCluster]);
      mockFeatureLayers[0].layer.getSource.mockReturnValue(mockSource);
      mockIsClusteredLayer.mockReturnValue(true);

      (selectHandler as any)({
        deselected: [],
        selected: [selectedCluster],
      });

      expect(mockApplySelectedStyle).toHaveBeenCalledWith(
        mockFeature,
        mockFeatureLayers[0],
      );
      expect(mockFeature.set).toHaveBeenCalledWith('selected', true);
    });

    it('should clear selection for multi-feature cluster', () => {
      const clusterFeatures = [mockFeature, { ...mockFeature }];
      const selectedCluster = {
        get: vi.fn(() => clusterFeatures),
      };

      const clearSpy = vi.fn();
      mockSelect.getFeatures.mockReturnValue({ clear: clearSpy });

      mockSource.getFeatures.mockReturnValue([selectedCluster]);
      mockFeatureLayers[0].layer.getSource.mockReturnValue(mockSource);
      mockIsClusteredLayer.mockReturnValue(true);

      (selectHandler as any)({
        deselected: [],
        selected: [selectedCluster],
      });

      expect(clearSpy).toHaveBeenCalled();
    });

    it('should clear selection when layer config not found', () => {
      mockSource.getFeatures.mockReturnValue([mockFeature]);
      mockFeatureLayers[0].layer.getSource.mockReturnValue(mockSource);
      mockIsClusteredLayer.mockReturnValue(false);

      (selectHandler as any)({
        deselected: [],
        selected: [mockFeature],
      });

      vi.clearAllMocks();

      mockFeatureLayers.forEach((config) => {
        config.layer.getSource.mockReturnValue({
          getFeatures: vi.fn(() => []),
        });
      });

      (selectHandler as any)({
        deselected: [],
        selected: [mockFeature],
      });

      expect(mockOverlay.setPosition).toHaveBeenCalledWith(undefined);
    });

    it('should handle clustered feature with empty features array', () => {
      const selectedCluster = {
        get: vi.fn(() => []),
      };

      const clearSpy = vi.fn();
      mockSelect.getFeatures.mockReturnValue({ clear: clearSpy });

      mockSource.getFeatures.mockReturnValue([selectedCluster]);
      mockFeatureLayers[0].layer.getSource.mockReturnValue(mockSource);
      mockIsClusteredLayer.mockReturnValue(true);

      (selectHandler as any)({
        deselected: [],
        selected: [selectedCluster],
      });

      expect(clearSpy).toHaveBeenCalled();
    });
  });

  describe('moveend handling', () => {
    let moveEndHandler: () => void;
    let selectHandler: () => void;

    beforeEach(() => {
      renderHook(() =>
        useFeatureSelection({
          mapRef: mockMapRef,
          featureLayers: mockFeatureLayers,
          overlayRef: mockOverlayRef,
        }),
      );

      moveEndHandler = (mockMap.on as any).mock.calls.find(
        ([event]: any) => event === 'moveend',
      )[1];

      selectHandler = (mockSelect.on as any).mock.calls.find(
        ([event]: any) => event === 'select',
      )[1];

      mockSource.getFeatures.mockReturnValue([mockFeature]);
      mockFeatureLayers[0].layer.getSource.mockReturnValue(mockSource);
      mockIsClusteredLayer.mockReturnValue(false);

      (selectHandler as any)({
        deselected: [],
        selected: [mockFeature],
      });
    });

    it('should do nothing when no feature is selected', () => {
      renderHook(() =>
        useFeatureSelection({
          mapRef: mockMapRef,
          featureLayers: mockFeatureLayers,
          overlayRef: mockOverlayRef,
        }),
      );

      const newMoveEndHandler = (mockMap.on as any).mock.calls.find(
        ([event]: any) => event === 'moveend',
      )[1];

      expect(() => newMoveEndHandler()).not.toThrow();
    });

    it('should clear selection when zoom is below threshold', () => {
      mockLayer.get.mockReturnValue(15); // hideBelowZoom
      mockView.getZoom.mockReturnValue(10); // current zoom below threshold

      moveEndHandler();

      expect(mockFeature.set).toHaveBeenCalledWith('selected', false);
      expect(mockOverlay.setPosition).toHaveBeenCalledWith(undefined);
    });

    it('should clear selection when feature is not present in source', () => {
      mockSource.getFeatures.mockReturnValue([]);

      moveEndHandler();

      expect(mockFeature.set).toHaveBeenCalledWith('selected', false);
      expect(mockOverlay.setPosition).toHaveBeenCalledWith(undefined);
    });

    it('should clear selection for clustered layer when feature not in single cluster', () => {
      mockIsClusteredLayer.mockReturnValue(true);

      const clusterFeatures = [mockFeature, { id: 'other' }];
      const clusterFeature = {
        get: vi.fn(() => clusterFeatures),
      };

      mockLayer.getSource.mockReturnValue({
        getSource: vi.fn(() => mockSource),
        getFeatures: vi.fn(() => [clusterFeature]),
      });

      moveEndHandler();

      expect(mockFeature.set).toHaveBeenCalledWith('selected', false);
      expect(mockOverlay.setPosition).toHaveBeenCalledWith(undefined);
    });

    it('should clear selection when cluster feature not found', () => {
      mockIsClusteredLayer.mockReturnValue(true);

      mockLayer.getSource.mockReturnValue({
        getSource: vi.fn(() => mockSource),
        getFeatures: vi.fn(() => []),
      });

      moveEndHandler();

      expect(mockFeature.set).toHaveBeenCalledWith('selected', false);
      expect(mockOverlay.setPosition).toHaveBeenCalledWith(undefined);
    });

    it('should maintain selection for clustered layer with single feature', () => {
      mockIsClusteredLayer.mockReturnValue(true);

      const clusterFeature = {
        get: vi.fn(() => [mockFeature]),
      };

      mockLayer.getSource.mockReturnValue({
        getSource: vi.fn(() => mockSource),
        getFeatures: vi.fn(() => [clusterFeature]),
      });

      moveEndHandler();

      expect(mockFeature.set).not.toHaveBeenCalledWith('selected', false);
    });
  });

  it('should pass options to centerMapOnFeature', () => {
    const options = {
      featureOffsetX: 10,
      featureOffsetY: 20,
    };

    renderHook(() =>
      useFeatureSelection({
        mapRef: mockMapRef,
        featureLayers: mockFeatureLayers,
        overlayRef: mockOverlayRef,
        options,
      }),
    );

    const selectHandler = mockSelect.on.mock.calls.find(
      ([event]: any) => event === 'select',
    )[1];

    mockSource.getFeatures.mockReturnValue([mockFeature]);
    mockFeatureLayers[0].layer.getSource.mockReturnValue(mockSource);
    mockIsClusteredLayer.mockReturnValue(false);

    (selectHandler as any)({
      deselected: [],
      selected: [mockFeature],
    });

    expect(mockCenterMapOnFeature).toHaveBeenCalledWith(
      mockMap,
      mockFeature,
      options,
    );
  });

  it('should use empty object as default options', () => {
    renderHook(() =>
      useFeatureSelection({
        mapRef: mockMapRef,
        featureLayers: mockFeatureLayers,
        overlayRef: mockOverlayRef,
      }),
    );

    const selectHandler = mockSelect.on.mock.calls.find(
      ([event]: any) => event === 'select',
    )[1];

    mockSource.getFeatures.mockReturnValue([mockFeature]);
    mockFeatureLayers[0].layer.getSource.mockReturnValue(mockSource);
    mockIsClusteredLayer.mockReturnValue(false);

    (selectHandler as any)({
      deselected: [],
      selected: [mockFeature],
    });

    expect(mockCenterMapOnFeature).toHaveBeenCalledWith(
      mockMap,
      mockFeature,
      {},
    );
  });

  it('should update z-index for multiple layers', () => {
    const secondLayer = {
      getSource: vi.fn(() => ({ getFeatures: vi.fn(() => []) })),
      setZIndex: vi.fn(),
    };

    const multipleLayersConfig = [
      { id: 'layer1', layer: mockLayer, onFeatureSelect: vi.fn() },
      { id: 'layer2', layer: secondLayer, onFeatureSelect: vi.fn() },
    ];

    renderHook(() =>
      useFeatureSelection({
        mapRef: mockMapRef,
        featureLayers: multipleLayersConfig,
        overlayRef: mockOverlayRef,
      }),
    );

    const selectHandler = mockSelect.on.mock.calls.find(
      ([event]: any) => event === 'select',
    )[1];

    mockSource.getFeatures.mockReturnValue([mockFeature]);
    mockLayer.getSource.mockReturnValue(mockSource);
    mockIsClusteredLayer.mockReturnValue(false);

    (selectHandler as any)({
      deselected: [],
      selected: [mockFeature],
    });

    expect(mockLayer.setZIndex).toHaveBeenCalledWith(10); // Selected layer
    expect(secondLayer.setZIndex).toHaveBeenCalledWith(1); // Non-selected layer
  });
});
