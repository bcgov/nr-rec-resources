import { useModalScrollFade } from '@/pages/rec-resource-page/components/RecResourceAssetsSection/useModalScrollFade';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

function createScrollElement({
  scrollTop = 0,
  scrollHeight = 200,
  clientHeight = 100,
} = {}) {
  const el = document.createElement('div');
  Object.defineProperty(el, 'scrollHeight', {
    value: scrollHeight,
    configurable: true,
  });
  Object.defineProperty(el, 'clientHeight', {
    value: clientHeight,
    configurable: true,
  });
  el.scrollTop = scrollTop;
  return el;
}

describe('useModalScrollFade', () => {
  it('shows neither fade before any element is attached', () => {
    const { result } = renderHook(() => useModalScrollFade());

    expect(result.current.canScrollUp).toBe(false);
    expect(result.current.canScrollDown).toBe(false);
  });

  it('shows the bottom fade when overflowing content is scrolled to the top', () => {
    const { result } = renderHook(() => useModalScrollFade());
    const el = createScrollElement({
      scrollTop: 0,
      scrollHeight: 200,
      clientHeight: 100,
    });

    act(() => {
      result.current.scrollRef(el);
    });

    expect(result.current.canScrollUp).toBe(false);
    expect(result.current.canScrollDown).toBe(true);
  });

  it('flips to the top fade and hides the bottom fade once scrolled to the bottom', () => {
    const { result } = renderHook(() => useModalScrollFade());
    const el = createScrollElement({
      scrollTop: 0,
      scrollHeight: 200,
      clientHeight: 100,
    });

    act(() => {
      result.current.scrollRef(el);
    });

    act(() => {
      el.scrollTop = 100;
      el.dispatchEvent(new Event('scroll'));
    });

    expect(result.current.canScrollUp).toBe(true);
    expect(result.current.canScrollDown).toBe(false);
  });

  it('treats sub-pixel offsets as being at the edge', () => {
    const { result } = renderHook(() => useModalScrollFade());
    const el = createScrollElement({
      scrollTop: 0.5,
      scrollHeight: 200,
      clientHeight: 100,
    });

    act(() => {
      result.current.scrollRef(el);
    });

    expect(result.current.canScrollUp).toBe(false);
  });

  it('shows no fades when content does not overflow the viewport', () => {
    const { result } = renderHook(() => useModalScrollFade());
    const el = createScrollElement({
      scrollTop: 0,
      scrollHeight: 100,
      clientHeight: 100,
    });

    act(() => {
      result.current.scrollRef(el);
    });

    expect(result.current.canScrollUp).toBe(false);
    expect(result.current.canScrollDown).toBe(false);
  });

  it('recomputes on window resize', () => {
    const { result } = renderHook(() => useModalScrollFade());
    const el = createScrollElement({
      scrollTop: 0,
      scrollHeight: 200,
      clientHeight: 100,
    });

    act(() => {
      result.current.scrollRef(el);
    });
    expect(result.current.canScrollDown).toBe(true);

    act(() => {
      Object.defineProperty(el, 'clientHeight', {
        value: 200,
        configurable: true,
      });
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.canScrollDown).toBe(false);
  });

  it('detaches listeners from the previous element when the scroll node changes', () => {
    const { result } = renderHook(() => useModalScrollFade());
    const el = createScrollElement({
      scrollTop: 0,
      scrollHeight: 200,
      clientHeight: 100,
    });
    const removeSpy = vi.spyOn(el, 'removeEventListener');

    act(() => {
      result.current.scrollRef(el);
    });

    act(() => {
      result.current.scrollRef(null);
    });

    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
  });
});
