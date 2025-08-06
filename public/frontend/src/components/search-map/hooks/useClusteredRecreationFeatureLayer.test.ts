import { renderHook, act, waitFor } from '@testing-library/react';
import Feature from 'ol/Feature';
import Select from 'ol/interaction/Select';
import * as recreationLayer from '@/components/search-map/layers/recreationFeatureLayer';
import { useClusteredRecreationFeatureLayer } from './useClusteredRecreationFeatureLayer';
import { Style } from 'ol/style';

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

  const mockSource = { setDistance: vi.fn() };
  const mockLayer = {
    getSource: () => mockSource,
    setStyle: vi.fn(),
    changed: vi.fn(),
  };

  const mockSelectInstance = {
    on: vi.fn(),
    un: vi.fn(),
    getFeatures: () => ({ clear: vi.fn() }),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(
      recreationLayer,
      'createClusteredRecreationFeatureSource',
    ).mockReturnValue(mockSource as any);
    vi.spyOn(
      recreationLayer,
      'createClusteredRecreationFeatureLayer',
    ).mockReturnValue(mockLayer);
    vi.spyOn(
      recreationLayer,
      'createClusteredRecreationFeatureStyle',
    ).mockReturnValue(new Style());
    vi.spyOn(recreationLayer, 'loadFeaturesForFilteredIds').mockImplementation(
      vi.fn(),
    );
    (Select as any).mockImplementation(() => mockSelectInstance);
  });

  it('returns layer, source, and style', () => {
    const { result } = renderHook(() =>
      useClusteredRecreationFeatureLayer(['1', '2'], mapRef),
    );
    expect(result.current.layer).toBe(mockLayer);
    expect(result.current.source).toBe(mockSource);
    expect(result.current.style).toBe(
      recreationLayer.createClusteredRecreationFeatureStyle,
    );
  });

  it('does not load features if projection is falsy', () => {
    mockView.getProjection.mockReturnValue('');
    renderHook(() => useClusteredRecreationFeatureLayer(['1'], mapRef));
    expect(recreationLayer.loadFeaturesForFilteredIds).not.toHaveBeenCalled();
  });

  it('loads features when recResourceIds and projection are set', () => {
    mockView.getProjection.mockReturnValue('EPSG:3857');
    const { rerender } = renderHook(
      ({ recResourceIds }) =>
        useClusteredRecreationFeatureLayer(recResourceIds, mapRef),
      { initialProps: { recResourceIds: ['1'] } },
    );
    expect(recreationLayer.loadFeaturesForFilteredIds).toHaveBeenCalledTimes(1);

    rerender({ recResourceIds: ['2'] });
    expect(recreationLayer.loadFeaturesForFilteredIds).toHaveBeenCalledTimes(2);
  });

  it('updates cluster distance on zoom change when zooming past threshold', () => {
    renderHook(() =>
      useClusteredRecreationFeatureLayer(['1'], mapRef, {
        clusterOptions: { distance: 50, clusterZoomThreshold: 15 },
      }),
    );

    expect(mockView.on).toHaveBeenCalledWith(
      'change:resolution',
      expect.any(Function),
    );
    const handler = mockView.on.mock.calls.find(
      (call) => call[0] === 'change:resolution',
    )?.[1];

    mockView.getZoom.mockReturnValue(16);
    handler();
    expect(mockSource.setDistance).toHaveBeenCalledWith(0);

    mockView.getZoom.mockReturnValue(10);
    handler();
    expect(mockSource.setDistance).toHaveBeenCalledWith(50);
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

    const clearSpy = vi.fn();
    mockSelectInstance.getFeatures = () => ({ clear: clearSpy });

    selectHandler({ selected: [mockClusterFeature] });

    expect(mockView.fit).toHaveBeenCalledWith([0, 0, 100, 100], {
      padding: [100, 100, 100, 100],
      duration: 500,
      maxZoom: 16,
    });
    expect(clearSpy).toHaveBeenCalled();
  });
});
