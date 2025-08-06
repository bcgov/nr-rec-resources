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
    createSource = vi.fn();
    createStyle = vi.fn();

    const setVisible = vi.fn();
    const setStyle = vi.fn();
    const changed = vi.fn();
    const vectorLayerMock = {
      setVisible,
      setStyle,
      changed,
      set: vi.fn(),
    };

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
    createLayer = vi.fn(() => {
      layerInstance = {
        setVisible: vi.fn(),
        setStyle: vi.fn(),
        changed: vi.fn(),
      };
      return layerInstance;
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
});
