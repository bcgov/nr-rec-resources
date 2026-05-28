import { renderHook, act } from '@testing-library/react';

import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import { useLayer } from './useLayer';
import Feature from 'ol/Feature';

describe('useLayer', () => {
  let mapMock: any;
  let mapRefMock: any;
  let createSource: Mock;
  let createLayer: Mock;
  let createStyle: Mock;

  beforeEach(() => {
    createStyle = vi.fn();

    const setVisible = vi.fn();
    const setStyle = vi.fn();
    const changed = vi.fn();
    let currentSource: any = null;
    const vectorLayerMock = {
      setVisible,
      setStyle,
      changed,
      set: vi.fn(),
      getSource: vi.fn(() => currentSource),
      setSource: vi.fn((src: any) => {
        currentSource = src;
      }),
    };
    createSource = vi.fn(() => {
      const src = {};
      currentSource = src;
      return src;
    });

    createLayer = vi.fn(() => vectorLayerMock);

    const listeners: Record<string, any[]> = {};

    mapMock = {
      getView: () => ({
        getZoom: () => 10,
      }),
      on: vi.fn((event: string, handler: (evt: any) => void) => {
        listeners[event] = listeners[event] || [];
        listeners[event].push(handler);
      }),
      un: vi.fn(),
      __triggerEvent: (event: string, arg?: any) => {
        (listeners[event] || []).forEach((handler) => handler(arg));
      },
    };

    mapRefMock = {
      current: {
        getMap: () => mapMock,
      },
    };
  });

  it('creates layer with source and returns it', () => {
    const { result } = renderHook(() =>
      useLayer(mapRefMock, createSource, createLayer, createStyle),
    );

    expect(createSource).toHaveBeenCalled();
    expect(createLayer).toHaveBeenCalled();
    expect(result.current.layer).not.toBeNull();
  });

  it('sets visibility based on zoom and hideBelowZoom', () => {
    const hideBelowZoom = 15;

    renderHook(() =>
      useLayer(mapRefMock, createSource, createLayer, createStyle, {
        hideBelowZoom,
      }),
    );

    expect(createLayer.mock.results[0].value.setVisible).toHaveBeenCalledWith(
      false,
    );

    mapMock.getView = () => ({ getZoom: () => 20 });
    act(() => {
      mapMock.__triggerEvent('moveend');
    });

    expect(createLayer.mock.results[0].value.setVisible).toHaveBeenCalledWith(
      true,
    );
  });
  it('cleans up event listeners and resets cursor on unmount', () => {
    const styleMock = { cursor: '' };
    const targetElement = { style: styleMock };
    mapMock.getTargetElement = vi.fn(() => targetElement);

    const { unmount } = renderHook(() =>
      useLayer(mapRefMock, createSource, createLayer, createStyle, {
        applyHoverStyles: true,
      }),
    );

    targetElement.style.cursor = 'pointer';

    unmount();

    expect(targetElement.style.cursor).toBe('');
  });

  it('handles pointer move and applies hover styles when applyHoverStyles=true (minimal)', () => {
    const fakeFeature = new Feature();

    const styleMock = { cursor: '' };
    mapMock.getTargetElement = vi.fn(() => ({ style: styleMock }));

    let layerInstance: any;
    let currentSource: any = null;
    createLayer = vi.fn(() => {
      layerInstance = {
        setVisible: vi.fn(),
        setStyle: vi.fn(),
        changed: vi.fn(),
        getSource: vi.fn(() => currentSource),
        setSource: vi.fn((src: any) => {
          currentSource = src;
        }),
      };
      return layerInstance;
    });
    createSource = vi.fn(() => {
      const src = {};
      currentSource = src;
      return src;
    });

    mapMock.forEachFeatureAtPixel = vi.fn((_pixel, _callback, options) => {
      if (options?.layerFilter?.(layerInstance)) {
        return fakeFeature;
      }
      return null;
    });

    renderHook(() =>
      useLayer(mapRefMock, createSource, createLayer, createStyle, {
        applyHoverStyles: true,
      }),
    );

    const pointerMoveCall = mapMock.on.mock.calls.find(
      ([event]: any[]) => event === 'pointermove',
    );
    expect(pointerMoveCall).toBeDefined();
    const pointerMoveHandler = pointerMoveCall![1] as (evt: any) => void;

    pointerMoveHandler({ pixel: [10, 10] });

    expect(styleMock.cursor).toBe('pointer');

    mapMock.forEachFeatureAtPixel = vi.fn(() => null);
    pointerMoveHandler({ pixel: [20, 20] });
    expect(styleMock.cursor).toBe('');
  });

  it('layer initialised invisible when hideBelowZoom set (even with null mapRef)', () => {
    const nullMapRef = { current: null };

    renderHook(() =>
      useLayer(nullMapRef, createSource, createLayer, createStyle, {
        hideBelowZoom: 12,
      }),
    );

    expect(createLayer.mock.results[0].value.setVisible).toHaveBeenCalledWith(
      false,
    );
    expect(createLayer.mock.results[0].value.set).toHaveBeenCalledWith(
      'hideBelowZoom',
      12,
    );
  });

  it('layer NOT set invisible when hideBelowZoom is absent', () => {
    renderHook(() =>
      useLayer(mapRefMock, createSource, createLayer, createStyle),
    );

    expect(createLayer.mock.results[0].value.setVisible).not.toHaveBeenCalled();
  });

  it('source is replaced when createSource changes', () => {
    const source1 = { id: 'src1' };
    const source2 = { id: 'src2' };

    // The layer mock tracks its own current source independently from the
    // source factories so getSource() !== source triggers setSource correctly.
    let layerCurrentSource: any = null;
    const localLayerMock = {
      setVisible: vi.fn(),
      setStyle: vi.fn(),
      changed: vi.fn(),
      set: vi.fn(),
      getSource: vi.fn(() => layerCurrentSource),
      setSource: vi.fn((src: any) => {
        layerCurrentSource = src;
      }),
    };

    const cs1 = vi.fn(() => source1);
    const cs2 = vi.fn(() => source2);

    // When createLayer is first called with source1, seed the layer's source.
    const localCreateLayer = vi.fn((src: any) => {
      layerCurrentSource = src;
      return localLayerMock;
    });

    const { rerender } = renderHook(
      ({ cs }: { cs: () => any }) =>
        useLayer(mapRefMock, cs, localCreateLayer, createStyle),
      { initialProps: { cs: cs1 } },
    );

    // After initial render layerCurrentSource === source1; setSource not called yet.
    rerender({ cs: cs2 });

    // The source effect detects source2 !== layerCurrentSource (source1) and calls setSource.
    expect(localLayerMock.setSource).toHaveBeenCalledWith(source2);
  });

  it('setSource is NOT called on initial render (source already matches)', () => {
    renderHook(() =>
      useLayer(mapRefMock, createSource, createLayer, createStyle),
    );

    // The layer's getSource() returns the same source object that was just
    // passed to createLayer, so the effect should not call setSource.
    expect(createLayer.mock.results[0].value.setSource).not.toHaveBeenCalled();
  });

  it('no moveend listener registered when hideBelowZoom is absent', () => {
    renderHook(() =>
      useLayer(mapRefMock, createSource, createLayer, createStyle),
    );

    const moveendCalls = mapMock.on.mock.calls.filter(
      ([event]: any[]) => event === 'moveend',
    );
    expect(moveendCalls).toHaveLength(0);
  });

  it('moveend listener removed on unmount when hideBelowZoom is set', () => {
    const { unmount } = renderHook(() =>
      useLayer(mapRefMock, createSource, createLayer, createStyle, {
        hideBelowZoom: 12,
      }),
    );

    unmount();

    expect(mapMock.un).toHaveBeenCalledWith('moveend', expect.any(Function));
  });

  it('setStyle and changed are called on mount when applyHoverStyles is true', () => {
    // applyHoverStyles cleanup calls map.getTargetElement(); provide a stub.
    mapMock.getTargetElement = vi.fn(() => ({ style: { cursor: '' } }));

    renderHook(() =>
      useLayer(mapRefMock, createSource, createLayer, createStyle, {
        applyHoverStyles: true,
      }),
    );

    expect(createLayer.mock.results[0].value.setStyle).toHaveBeenCalled();
    expect(createLayer.mock.results[0].value.changed).toHaveBeenCalled();
  });

  it('setStyle is NOT called when applyHoverStyles is false', () => {
    renderHook(() =>
      useLayer(mapRefMock, createSource, createLayer, createStyle, {
        applyHoverStyles: false,
      }),
    );

    expect(createLayer.mock.results[0].value.setStyle).not.toHaveBeenCalled();
  });

  it('invokes the feature transform callback inside forEachFeatureAtPixel (covers line 60)', () => {
    const fakeFeature = new Feature();
    const styleMock = { cursor: '' };
    mapMock.getTargetElement = vi.fn(() => ({ style: styleMock }));

    let capturedLayer: any;
    createLayer = vi.fn(() => {
      capturedLayer = {
        setVisible: vi.fn(),
        setStyle: vi.fn(),
        changed: vi.fn(),
        set: vi.fn(),
        getSource: vi.fn(() => null),
        setSource: vi.fn(),
      };
      return capturedLayer;
    });
    createSource = vi.fn(() => ({}));

    mapMock.forEachFeatureAtPixel = vi.fn((_pixel, callback, options) => {
      if (options?.layerFilter?.(capturedLayer)) {
        return callback(fakeFeature);
      }
      return null;
    });

    renderHook(() =>
      useLayer(mapRefMock, createSource, createLayer, createStyle, {
        applyHoverStyles: true,
      }),
    );

    const pointerMoveCall = mapMock.on.mock.calls.find(
      ([event]: any[]) => event === 'pointermove',
    );
    const handler = pointerMoveCall![1] as (evt: any) => void;
    handler({ pixel: [10, 10] });

    expect(styleMock.cursor).toBe('pointer');
  });

  it('invokes the setStyle callback with the correct hovered flag (covers line 97)', () => {
    mapMock.getTargetElement = vi.fn(() => ({ style: { cursor: '' } }));

    renderHook(() =>
      useLayer(mapRefMock, createSource, createLayer, createStyle, {
        applyHoverStyles: true,
      }),
    );

    const layer = createLayer.mock.results[0].value;
    const styleCallback = layer.setStyle.mock.calls[0][0];

    const fakeFeature = new Feature();
    styleCallback(fakeFeature, 1);

    // hoveredFeature starts null; fakeFeature !== null → isHovered = false
    expect(createStyle).toHaveBeenCalledWith(fakeFeature, false);
  });
});
