import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useViewportIdFetch } from './useViewportIdFetch';

const makeFeature = (id: string | undefined) => ({ getId: () => id }) as any;

describe('useViewportIdFetch', () => {
  let currentZoom: number;
  let view: any;
  let map: any;
  let mapRef: any;
  let pinSource: any;
  let source: any;
  let fetchByIds: ReturnType<typeof vi.fn>;

  const getHandler = (mock: any, name: string) =>
    mock.mock.calls.find((c: any[]) => c[0] === name)?.[1];

  beforeEach(() => {
    currentZoom = 12;
    view = {
      getZoom: () => currentZoom,
      calculateExtent: vi.fn(() => [0, 0, 100, 100]),
    };
    map = {
      getView: () => view,
      getSize: () => [800, 600],
      on: vi.fn(),
      un: vi.fn(),
    };
    mapRef = { current: { getMap: () => map } };
    pinSource = {
      getFeaturesInExtent: vi.fn(() => [makeFeature('A'), makeFeature('B')]),
      on: vi.fn(),
      un: vi.fn(),
    };
    source = { clear: vi.fn(), addFeatures: vi.fn() };
    fetchByIds = vi.fn().mockResolvedValue([{ feat: 1 }]);
  });

  afterEach(() => vi.restoreAllMocks());

  const render = (overrides: Record<string, unknown> = {}) =>
    renderHook(() =>
      useViewportIdFetch({
        mapRef,
        pinSource,
        source,
        minZoom: 10,
        fetchByIds,
        ...overrides,
      } as any),
    );

  it('is a no-op when the pin source is not ready', () => {
    render({ pinSource: null });
    expect(source.clear).not.toHaveBeenCalled();
    expect(map.on).not.toHaveBeenCalled();
  });

  it('clears the source and registers moveend + pin-source listeners', () => {
    render();
    expect(source.clear).toHaveBeenCalledTimes(1);
    expect(map.on).toHaveBeenCalledWith('moveend', expect.any(Function));
    expect(pinSource.on).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('fetches the ids visible in the viewport and adds the geometry', async () => {
    render();
    await waitFor(() => expect(fetchByIds).toHaveBeenCalledWith(['A', 'B']));
    await waitFor(() =>
      expect(source.addFeatures).toHaveBeenCalledWith([{ feat: 1 }]),
    );
  });

  it('does not fetch below the zoom threshold', async () => {
    currentZoom = 5;
    render();
    await act(async () => {});
    expect(fetchByIds).not.toHaveBeenCalled();
  });

  it('skips features without an id', async () => {
    pinSource.getFeaturesInExtent.mockReturnValue([
      makeFeature('A'),
      makeFeature(undefined),
    ]);
    render();
    await waitFor(() => expect(fetchByIds).toHaveBeenCalledWith(['A']));
  });

  it('dedupes: re-running with the same visible ids does not refetch', async () => {
    render();
    await waitFor(() => expect(fetchByIds).toHaveBeenCalledTimes(1));

    const moveend = getHandler(map.on, 'moveend');
    await act(async () => {
      await moveend();
    });

    expect(fetchByIds).toHaveBeenCalledTimes(1);
  });

  it('fetches only newly-revealed ids when the viewport changes', async () => {
    pinSource.getFeaturesInExtent.mockReturnValueOnce([makeFeature('A')]);
    render();
    await waitFor(() => expect(fetchByIds).toHaveBeenCalledWith(['A']));

    pinSource.getFeaturesInExtent.mockReturnValue([
      makeFeature('A'),
      makeFeature('B'),
    ]);
    const moveend = getHandler(map.on, 'moveend');
    await act(async () => {
      await moveend();
    });

    expect(fetchByIds).toHaveBeenLastCalledWith(['B']);
  });

  it('rolls back reserved ids on fetch failure so a later pan retries', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    fetchByIds.mockRejectedValueOnce(new Error('boom'));
    render();
    await waitFor(() => expect(fetchByIds).toHaveBeenCalledTimes(1));

    const moveend = getHandler(map.on, 'moveend');
    await act(async () => {
      await moveend();
    });

    expect(fetchByIds).toHaveBeenCalledTimes(2);
    expect(fetchByIds).toHaveBeenLastCalledWith(['A', 'B']);
  });

  it('removes listeners on unmount', () => {
    const { unmount } = render();
    unmount();
    expect(map.un).toHaveBeenCalledWith('moveend', expect.any(Function));
    expect(pinSource.un).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
