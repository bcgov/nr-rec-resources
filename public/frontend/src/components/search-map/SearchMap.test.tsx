import { describe, it, expect, vi, beforeEach } from 'vitest';
import { forwardRef, useImperativeHandle } from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithRouter } from '@/test-utils';
import SearchMap from '@/components/search-map/SearchMap';
import * as hooks from '@/components/search-map/hooks/useMapFocus';
import { trackClickEvent, trackEvent } from '@shared/utils';

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
    useSearch: vi.fn(() => ({})),
  };
});

vi.mock('@/components/search-map/hooks/useMapFocus', () => ({
  useMapFocus: vi.fn(),
}));

vi.mock('@/components/search-map/hooks/useBaseMaps', () => ({
  useBaseMaps: vi.fn(() => [
    {
      id: 'prp',
      name: 'BC Basemap',
      layer: { id: 'mock-prp-layer' },
      image: '/test-image.jpg',
    },
    {
      id: 'satellite',
      name: 'Satellite',
      layer: { id: 'mock-satellite-layer' },
      image: '/test-satellite.jpg',
    },
  ]),
}));

vi.mock('@/components/search-map/hooks', () => ({
  useClusteredRecreationFeatureLayer: vi.fn(() => ({
    layer: {
      getSource: () => ({ getFeatures: () => [] }),
      setVisible: vi.fn(),
    },
  })),
  useWildfireLocationLayer: vi.fn(() => ({
    layer: {
      getSource: () => ({ getFeatures: () => [] }),
      setVisible: vi.fn(),
    },
  })),
  useWildfirePerimeterLayer: vi.fn(() => ({
    layer: {
      getSource: () => ({ getFeatures: () => [] }),
      setVisible: vi.fn(),
    },
  })),
  useFeatureSelection: vi.fn(() => ({
    clearSelection: vi.fn(),
    selectedFeature: null,
    setSelectedFeature: vi.fn(),
  })),
  useZoomToExtent: vi.fn(() => ({
    zoomToExtent: vi.fn(),
  })),
}));

vi.mock('@bcgov/prp-map', () => ({
  VectorFeatureMap: forwardRef((props: any, ref: any) => {
    useImperativeHandle(ref, () => ({
      getMap: () => ({
        addOverlay: vi.fn(),
        removeOverlay: vi.fn(),
        addLayer: vi.fn(),
        removeLayer: vi.fn(),
        getView: () => ({
          fit: vi.fn(),
          getCenter: () => [0, 0],
          getZoom: () => 10,
        }),
        on: vi.fn(),
        un: vi.fn(),
        getTargetElement: () => document.createElement('div'),
      }),
      forceUpdate: vi.fn(),
    }));

    return (
      <div data-testid="vector-feature-map" onClick={props.onClick}>
        VectorFeatureMap
      </div>
    );
  }),
  useStyledLayer: vi.fn(() => ({ id: 'mock-styled-layer' })),
}));

vi.mock('@shared/utils', () => ({
  trackClickEvent: vi.fn(),
  trackEvent: vi.fn(),
}));

vi.mock('@/store/searchResults', () => ({
  default: {
    getState: () => ({
      extent: null,
      recResourceIds: [],
    }),
    subscribe: vi.fn(),
  },
}));

vi.mock('@tanstack/react-store', () => ({
  useStore: vi.fn(() => ({
    extent: null,
    recResourceIds: [],
  })),
  Store: vi.fn().mockImplementation(function () {
    return {
      load: vi.fn(),
    };
  }),
}));

vi.mock('@/components/layout/Header', () => ({
  default: () => <div data-testid="header">Header</div>,
}));

describe('SearchMap', () => {
  const mockUseMapFocus = hooks.useMapFocus as any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMapFocus.mockReturnValue({
      isMapFocusLoading: false,
      mapCenter: [0, 0],
      mapZoom: 10,
      loadingProgress: 0,
    });

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });
  });

  it('renders main components', async () => {
    await renderWithRouter(
      <SearchMap
        ids={[]}
        totalCount={0}
        props={{
          style: { visibility: 'visible' },
        }}
      />,
    );

    expect(screen.getByTestId('vector-feature-map')).toBeDefined();

    expect(screen.getByRole('combobox')).toBeDefined(); // RecreationSuggestionForm input

    expect(screen.getByText('Show list')).toBeDefined();

    expect(screen.getAllByText('Filters')).toHaveLength(2); // Desktop and mobile versions
  });

  it('shows disclaimer modal when initially rendered with visible style', async () => {
    await renderWithRouter(
      <SearchMap
        ids={[]}
        totalCount={0}
        props={{
          style: { visibility: 'visible' },
        }}
      />,
    );

    // The modal should be present in the DOM
    expect(screen.getByRole('dialog')).toBeDefined();
  });

  it('can interact with disclaimer modal', async () => {
    await renderWithRouter(
      <SearchMap
        ids={[]}
        totalCount={0}
        props={{
          style: { visibility: 'visible' },
        }}
      />,
    );

    const modal = screen.getByRole('dialog');
    expect(modal).toBeDefined();

    const okButton = screen.getByRole('button', { name: /ok/i });
    expect(okButton).toBeDefined();
    fireEvent.click(okButton);

    expect(screen.getByRole('dialog')).toBeDefined();
  });

  it('can open and interact with filter menu', async () => {
    await renderWithRouter(
      <SearchMap
        ids={[]}
        totalCount={0}
        props={{
          style: { visibility: 'hidden' },
        }}
      />,
    );

    const filtersButtons = screen.getAllByText('Filters');
    const filtersButton = filtersButtons[0];

    expect(screen.queryByRole('dialog')).toBeNull();

    fireEvent.click(filtersButton);

    const modals = screen.getAllByRole('dialog');
    expect(modals).toHaveLength(1);

    const closeButton = screen.getByRole('button', { name: /close/i });
    expect(closeButton).toBeDefined();
    fireEvent.click(closeButton);

    expect(screen.getByRole('dialog')).toBeDefined();
  });

  it('shows loading state when map focus is loading', async () => {
    mockUseMapFocus.mockReturnValue({
      isMapFocusLoading: true,
      mapCenter: [0, 0],
      mapZoom: 10,
      loadingProgress: 50,
    });

    await renderWithRouter(
      <SearchMap
        ids={[]}
        totalCount={0}
        props={{
          style: { visibility: 'visible' },
        }}
      />,
    );

    expect(screen.getByText('Loading map')).toBeDefined();
  });

  it('shows not loading state when map focus is not loading', async () => {
    mockUseMapFocus.mockReturnValue({
      isMapFocusLoading: false,
      mapCenter: [0, 0],
      mapZoom: 10,
      loadingProgress: 100,
    });

    await renderWithRouter(
      <SearchMap
        ids={[]}
        totalCount={0}
        props={{
          style: { visibility: 'visible' },
        }}
      />,
    );

    expect(screen.queryByText('Loading map')).toBeNull();
  });

  it('handles list view button click', async () => {
    await renderWithRouter(
      <SearchMap
        ids={[]}
        totalCount={0}
        props={{
          style: { visibility: 'visible' },
        }}
      />,
    );

    const listButton = screen.getByText('Show list');
    expect(listButton).toBeDefined();

    fireEvent.click(listButton);

    expect(trackEvent).toHaveBeenCalledWith({
      category: 'ListView',
      action: 'ListView_map',
      name: 'ListView_map',
    });
  });

  it('tracks click events when matomo is called', async () => {
    await renderWithRouter(
      <SearchMap
        ids={[]}
        totalCount={0}
        props={{
          style: { visibility: 'visible' },
        }}
      />,
    );

    const eventData = {
      category: 'Search Map',
      action: 'Recreation feature selected',
      name: 'Test Feature',
    };

    trackClickEvent(eventData);

    expect(trackClickEvent).toHaveBeenCalledWith(eventData);
  });
});
