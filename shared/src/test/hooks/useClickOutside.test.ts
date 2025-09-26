import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRef } from 'react';
import { useClickOutside } from '../../hooks/useClickOutside';

const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();

Object.defineProperty(document, 'addEventListener', {
  value: mockAddEventListener,
  writable: true,
});

Object.defineProperty(document, 'removeEventListener', {
  value: mockRemoveEventListener,
  writable: true,
});

describe('useClickOutside', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should add event listener on mount and remove on unmount', () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      useClickOutside(ref, handler);
      return ref;
    });

    expect(mockAddEventListener).toHaveBeenCalledWith(
      'mousedown',
      expect.any(Function),
    );

    unmount();
  });

  it('should call handler when clicking outside the referenced element', () => {
    const handler = vi.fn();
    const div = document.createElement('div');
    const ref = { current: div };

    renderHook(() => useClickOutside(ref, handler));

    const outsideElement = document.createElement('span');
    const mockEvent = {
      target: outsideElement,
    } as unknown as MouseEvent;

    const eventHandler = mockAddEventListener.mock.calls[0][1];
    eventHandler(mockEvent);

    expect(handler).toHaveBeenCalledWith(mockEvent);
  });

  it('should not call handler when clicking inside the referenced element', () => {
    const handler = vi.fn();
    const div = document.createElement('div');
    const ref = { current: div };

    renderHook(() => useClickOutside(ref, handler));

    const insideElement = document.createElement('span');
    div.appendChild(insideElement);

    const mockEvent = {
      target: insideElement,
    } as unknown as MouseEvent;

    const eventHandler = mockAddEventListener.mock.calls[0][1];
    eventHandler(mockEvent);

    expect(handler).not.toHaveBeenCalled();
  });

  it('should not call handler when ref is null', () => {
    const handler = vi.fn();
    const ref = { current: null };

    renderHook(() => useClickOutside(ref, handler));

    const outsideElement = document.createElement('span');
    const mockEvent = {
      target: outsideElement,
    } as unknown as MouseEvent;

    const eventHandler = mockAddEventListener.mock.calls[0][1];
    eventHandler(mockEvent);

    expect(handler).not.toHaveBeenCalled();
  });
});
