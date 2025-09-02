import { renderHook, act, waitFor } from '@testing-library/react';
import Feature from 'ol/Feature';
import Select from 'ol/interaction/Select';
import * as recreationLayer from '@/components/search-map/layers/recreationFeatureLayer';
import { useClusteredRecreationFeatureLayer } from './useClusteredRecreationFeatureLayer';
import { Style } from 'ol/style';

// Mock AnimatedCluster
vi.mock('ol-ext/layer/AnimatedCluster', () => ({
  default: vi.fn().mockImplementation((options) => ({
    setSource: vi.fn(),
    setStyle: vi.fn(),
    changed: vi.fn(),
    getSource: vi.fn(),
    ...options,
  })),
}));

vi.mock('ol/interaction/Select');
vi.mock('ol/extent', () => ({
  extend: vi.fn(() => [0, 0, 100, 100]),
  createEmpty: vi.fn(() => [0, 0, 0, 0]),
}));

describe('useClusteredRecreationFeatureLayer', () => {
  const mockView = {
    getProjection: vi.fn(() => 'EPSG:3857'),
    getZoom: vi.fn(() => 10),
    on: vi.fn(),
    un: vi.fn(),
    fit: vi.fn(),
  };

  const styleObj = { cursor: '' };
  const mockTargetElement = { style: styleObj };

  const mockMap = {
    getView: vi.fn(() => mockView),
    on: vi.fn(),
    un: vi.fn(),
    addInteraction: vi.fn(),
    removeInteraction: vi.fn(),
    getTargetElement: vi.fn(() => mockTargetElement),
    forEachFeatureAtPixel: vi.fn(),
  };

  const mapRef = { current: { getMap: () => mockMap } } as any;

  const mockSource = { 
    setDistance: vi.fn(),
    addFeatures: vi.fn(),
    clear: vi.fn(),
  };
  
  const mockLayer = {
    getSource: () => mockSource,
    setStyle: vi.fn(),
    changed: vi.fn(),
    setSource: vi.fn(),
  };

  const mockSelectInstance = {
    on: vi.fn(),
    un: vi.fn(),
    getFeatures: () => ({ clear: vi.fn() }),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    // Mock AnimatedCluster constructor to return our mock layer
    const AnimatedCluster = vi.mocked(await import('ol-ext/layer/AnimatedCluster')).default;
    AnimatedCluster.mockImplementation(() => mockLayer as any);

    vi.spyOn(recreationLayer, 'createRecreationFeatureSource').mockReturnValue(
      mockSource as any,
    );
    vi.spyOn(
      recreationLayer,
      'createClusteredRecreationFeatureStyle',
    ).mockReturnValue(new Style());
    vi.spyOn(recreationLayer, 'createFilteredClusterSource').mockReturnValue(
      mockSource as any,
    );
    (Select as any).mockImplementation(() => mockSelectInstance);
  });

  it('returns layer and style', () => {
    const { result } = renderHook(() =>
      useClusteredRecreationFeatureLayer(['1', '2'], mapRef),
    );
    expect(result.current.layer).toBe(mockLayer);
    expect(result.current.style).toBe(
      recreationLayer.createClusteredRecreationFeatureStyle,
    );
  });

  it('creates filtered vector source when recResourceIds change', () => {
    const { rerender } = renderHook(
      ({ recResourceIds }) =>
        useClusteredRecreationFeatureLayer(recResourceIds, mapRef),
      { initialProps: { recResourceIds: ['1'] } },
    );
    expect(recreationLayer.createFilteredClusterSource).toHaveBeenCalledWith(
      ['1'],
      undefined,
    );

    rerender({ recResourceIds: ['2'] });
    expect(recreationLayer.createFilteredClusterSource).toHaveBeenCalledWith(
      ['2'],
      undefined,
    );
  });

  it('creates layer with cluster options', () => {
    renderHook(() =>
      useClusteredRecreationFeatureLayer(['1'], mapRef, {
        clusterOptions: { distance: 50 },
        animatedClusterOptions: { animationDuration: 700 },
      }),
    );

    expect(recreationLayer.createFilteredClusterSource).toHaveBeenCalledWith(
      ['1'],
      { distance: 50 },
    );
  });

  it('updates cursor and applies hover style on pointermove', async () => {
    const styleSpy = vi.spyOn(
      recreationLayer,
      'createClusteredRecreationFeatureStyle',
    );

    renderHook(() => useClusteredRecreationFeatureLayer(['1'], mapRef));

    const pointerMoveCall = mockMap.on.mock.calls.find(
      (call) => call[0] === 'pointermove',
    );
    expect(pointerMoveCall).toBeDefined();
    const handler = pointerMoveCall![1];

    const mockFeature = new Feature();
    mockMap.forEachFeatureAtPixel.mockReturnValue(mockFeature);

    act(() => {
      handler({ pixel: [0, 0] });
    });

    await waitFor(() => {
      expect(mockLayer.setStyle).toHaveBeenCalled();
    });

    const styleFn =
      mockLayer.setStyle.mock.calls[
        mockLayer.setStyle.mock.calls.length - 1
      ][0];

    styleFn(mockFeature, 10);
    expect(styleSpy).toHaveBeenCalledWith(
      mockFeature,
      10,
      expect.objectContaining({
        iconOpacity: 0.7,
        clusterOpacity: 0.7,
        haloOpacity: 0.5,
      }),
    );

    const otherFeature = new Feature();
    styleFn(otherFeature, 10);
    expect(styleSpy).toHaveBeenCalledWith(
      otherFeature,
      10,
      expect.objectContaining({
        iconOpacity: 1,
        clusterOpacity: 0.85,
        haloOpacity: 0.7,
      }),
    );

    mockMap.forEachFeatureAtPixel.mockReturnValue(null);
    act(() => {
      handler({ pixel: [0, 0] });
    });
    expect(mockTargetElement.style.cursor).toBe('');
  });

  it('does not apply hover styles when applyHoverStyles is false', () => {
    renderHook(() =>
      useClusteredRecreationFeatureLayer(['1'], mapRef, {
        applyHoverStyles: false,
      }),
    );

    // Should not register pointermove event
    const pointerMoveCall = mockMap.on.mock.calls.find(
      (call) => call[0] === 'pointermove',
    );
    expect(pointerMoveCall).toBeUndefined();
  });

  it('handles empty recResourceIds array', () => {
    renderHook(() => useClusteredRecreationFeatureLayer([], mapRef));

    expect(recreationLayer.createFilteredClusterSource).toHaveBeenCalledWith(
      [],
      undefined,
    );
  });

  it('handles single feature selection (no zoom)', () => {
    renderHook(() => useClusteredRecreationFeatureLayer(['1'], mapRef));

    const selectCall = mockSelectInstance.on.mock.calls.find(
      (call) => call[0] === 'select',
    );
    const selectHandler = selectCall![1];

    // Mock single feature (should not zoom)
    const mockSingleFeature = {
      get: () => [new Feature()], // Single feature array
    };

    selectHandler({ selected: [mockSingleFeature] });

    // Should not call fit when only one feature
    expect(mockView.fit).not.toHaveBeenCalled();
  });

  it('handles selection with no features', () => {
    renderHook(() => useClusteredRecreationFeatureLayer(['1'], mapRef));

    const selectCall = mockSelectInstance.on.mock.calls.find(
      (call) => call[0] === 'select',
    );
    const selectHandler = selectCall![1];

    // Mock empty selection
    selectHandler({ selected: [] });

    expect(mockView.fit).not.toHaveBeenCalled();
  });

  it('adds and removes select interaction on mount/unmount', () => {
    const { unmount } = renderHook(() =>
      useClusteredRecreationFeatureLayer(['1'], mapRef),
    );

    expect(mockMap.addInteraction).toHaveBeenCalledWith(mockSelectInstance);
    expect(mockSelectInstance.on).toHaveBeenCalledWith(
      'select',
      expect.any(Function),
    );

    unmount();

    expect(mockSelectInstance.un).toHaveBeenCalledWith(
      'select',
      expect.any(Function),
    );
    expect(mockMap.removeInteraction).toHaveBeenCalledWith(mockSelectInstance);
  });

  it('handles cluster selection and zooms to cluster extent', () => {
    renderHook(() => useClusteredRecreationFeatureLayer(['1'], mapRef));

    const selectCall = mockSelectInstance.on.mock.calls.find(
      (call) => call[0] === 'select',
    );
    expect(selectCall).toBeDefined();
    const selectHandler = selectCall![1];

    // Mock two features with geometries returning extents
    const mockFeature1 = new Feature();
    mockFeature1.getGeometry = () =>
      ({ getExtent: () => [0, 0, 50, 50] }) as any;
    const mockFeature2 = new Feature();
    mockFeature2.getGeometry = () =>
      ({ getExtent: () => [50, 50, 100, 100] }) as any;

    const mockClusterFeature = {
      get: () => [mockFeature1, mockFeature2],
    };

    selectHandler({ selected: [mockClusterFeature] });

    expect(mockView.fit).toHaveBeenCalledWith([0, 0, 100, 100], {
      padding: [200, 200, 200, 200],
      duration: 500,
    });
  });
});
