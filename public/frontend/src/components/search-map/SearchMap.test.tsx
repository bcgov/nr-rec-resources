import { forwardRef } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, Mock } from 'vitest';
import { useStore } from '@tanstack/react-store';
import SearchMap from '@/components/search-map/SearchMap';
import { useZoomToExtent } from '@/components/search-map/hooks/useZoomToExtent';
import { renderWithQueryClient } from '@/test-utils';

const fitMock = vi.fn();
const getZoomMock = vi.fn(() => 8);
const setZoomMock = vi.fn();
const getExtentMock = vi.fn(() => [0, 0, 100, 100]);

vi.mock('@tanstack/react-store', async () => {
  const actual = await vi.importActual('@tanstack/react-store');
  return {
    ...actual,
    useStore: vi.fn(),
  };
});

vi.mock('ol/proj', () => ({
  transformExtent: vi.fn((extent) => {
    return extent;
  }),
}));

vi.mock('ol/format/GeoJSON', () => ({
  default: vi.fn().mockImplementation(() => ({
    readGeometry: vi.fn(() => ({
      getExtent: getExtentMock,
    })),
  })),
}));

vi.mock('@/components/search-map/hooks/useZoomToExtent', () => ({
  useZoomToExtent: vi.fn(),
}));

vi.mock('@/components/search-map/layers/recreationFeatureLayer', () => ({
  createClusteredRecreationFeatureSource: vi.fn(),
  createClusteredRecreationFeatureStyle: vi.fn(() => 'mock-cluster-style'),
  createClusteredRecreationFeatureLayer: vi.fn(),
  loadFeaturesForFilteredIds: vi.fn(() => Promise.resolve()),
  recreationSource: {
    clear: vi.fn(),
    addFeatures: vi.fn(),
  },
}));

vi.mock('@bcgov/prp-map', () => ({
  VectorFeatureMap: forwardRef((_, ref: any) => {
    const mapStub = {
      getView: () => ({
        fit: fitMock,
        getZoom: getZoomMock,
        setZoom: setZoomMock,
        getProjection: vi.fn(),
      }),
      once: vi.fn((event, callback) => {
        if (event === 'moveend') {
          callback();
        }
      }),
    };

    if (ref) {
      ref.current = {
        getMap: () => mapStub,
      };
    }

    return <div data-testid="vector-feature-map" />;
  }),
}));

vi.mock('@/components/search-map/SearchViewControls', () => ({
  default: () => <div data-testid="search-view-controls" />,
}));

vi.mock(
  '@/components/recreation-suggestion-form/RecreationSuggestionForm',
  () => ({
    default: () => <div data-testid="recreation-suggestion-form" />,
  }),
);

describe('SearchMap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders VectorFeatureMap and search controls', () => {
    (useStore as Mock).mockReturnValue({
      extent: null,
      pages: [],
      recResourceIds: [],
    });

    renderWithQueryClient(<SearchMap />);

    expect(screen.getByTestId('vector-feature-map')).toBeInTheDocument();
    expect(screen.getByTestId('search-view-controls')).toBeInTheDocument();
    expect(
      screen.getByTestId('recreation-suggestion-form'),
    ).toBeInTheDocument();
  });

  it('renders the search fields', () => {
    (useStore as Mock).mockReturnValue({
      extent: null,
      pages: [],
      recResourceIds: [],
    });

    renderWithQueryClient(<SearchMap style={{ height: '400px' }} />);

    const container = document.querySelector('.search-map-container');
    expect(container).toHaveStyle('height: 400px');
  });

  it('calls useZoomToExtent with correct args', () => {
    const mockExtent = JSON.stringify({
      type: 'Polygon',
      coordinates: [
        [
          [0, 0],
          [100, 0],
          [100, 100],
          [0, 100],
          [0, 0],
        ],
      ],
    });

    (useStore as Mock).mockReturnValue({
      extent: mockExtent,
      pages: [],
      recResourceIds: [],
    });

    renderWithQueryClient(<SearchMap />);

    expect(useZoomToExtent).toHaveBeenCalledWith(
      expect.any(Object),
      mockExtent,
    );
  });

  it('renders filter toggle button and toggles filter menu open/close', async () => {
    (useStore as Mock).mockReturnValue({
      extent: null,
      pages: [],
      recResourceIds: [],
    });

    renderWithQueryClient(<SearchMap />);

    const toggleBtn = screen.getByRole('button', {
      name: /toggle filter menu/i,
    });
    expect(toggleBtn).toBeInTheDocument();
    expect(toggleBtn).toHaveClass('btn-secondary');
    expect(
      screen.queryByRole('button', { name: /apply/i }),
    ).not.toBeInTheDocument();

    await userEvent.click(toggleBtn);
    expect(toggleBtn).toHaveClass('btn-primary');
    expect(await screen.findByRole('button', { name: /apply/i })).toBeVisible();

    await userEvent.click(toggleBtn);
    expect(toggleBtn).toHaveClass('btn-secondary');
    expect(
      screen.queryByRole('button', { name: /apply/i }),
    ).not.toBeInTheDocument();
  });
});
