import { render } from '@testing-library/react';
import { useOpenLayersTracking } from './useOpenLayersTracking';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import Map from 'ol/Map';
import { trackEvent } from '@/utils/matomo';

vi.mock('@/utils/matomo', () => ({
  trackEvent: vi.fn(),
}));

const createMockMap = () => {
  const viewport = document.createElement('div');

  const handlers: Record<string, any[]> = {};
  return {
    on: vi.fn((event, handler) => {
      handlers[event] = handlers[event] || [];
      handlers[event].push(handler);
    }),
    un: vi.fn(),
    getViewport: vi.fn(() => viewport),
    trigger: (event: string) => {
      handlers[event]?.forEach((handler) => handler());
    },
    viewport,
  } as any;
};

const TestComponent = ({
  map,
}: {
  map: Map & { trigger: (event: string) => void };
}) => {
  useOpenLayersTracking(map);

  return null;
};

describe('useOpenLayersTracking', () => {
  let map: ReturnType<typeof createMockMap>;

  beforeEach(() => {
    vi.clearAllMocks();
    map = createMockMap();
  });

  it('should track panning when pointerdrag is triggered', () => {
    render(<TestComponent map={map} />);
    map.trigger('pointerdrag');
    map.trigger('moveend');

    expect(trackEvent).toHaveBeenCalledWith({
      category: 'Map',
      action: 'Touch event',
      name: 'Panned',
    });
  });

  it('should track zooming on wheel scroll', () => {
    render(<TestComponent map={map} />);

    map.viewport.dispatchEvent(new WheelEvent('wheel'));
    map.trigger('moveend');

    expect(trackEvent).toHaveBeenCalledTimes(1);
    expect(trackEvent).toHaveBeenCalledWith({
      category: 'Map',
      action: 'Touch event',
      name: 'Zoomed in/out',
    });
  });
});
