import { forwardRef } from 'react';
import { screen } from '@testing-library/react';
import { vi, Mock } from 'vitest';
import { useStore } from '@tanstack/react-store';
import SearchMap from '@/components/search/SearchMap/SearchMap';
import { renderWithQueryClient } from '@/test-utils';

const setStyleMock = vi.fn();
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

vi.mock('ol/layer/Vector', () => ({
  default: vi.fn().mockImplementation(() => ({
    setStyle: setStyleMock,
  })),
}));

vi.mock('@/components/search/SearchMap/layers/recreationFeatureLayer', () => ({
  createClusteredRecreationFeatureSource: vi.fn(),
  createClusteredRecreationFeatureStyle: vi.fn(() => 'mock-cluster-style'),
  createClusteredRecreationFeatureLayer: vi.fn(() => ({
    setStyle: setStyleMock,
  })),
}));

vi.mock('@bcgov/prp-map', () => ({
  VectorFeatureMap: forwardRef((_, ref: any) => {
    const mapStub = {
      getView: () => ({
        fit: fitMock,
        getZoom: getZoomMock,
        setZoom: setZoomMock,
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

vi.mock('@/components/search/SearchMap/SearchViewControls', () => ({
  default: () => <div data-testid="search-view-controls" />,
}));

vi.mock('@/components/recreation-search-form/RecreationSearchForm', () => ({
  RecreationSearchForm: () => <div data-testid="recreation-search-form" />,
}));

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
    expect(screen.getByTestId('recreation-search-form')).toBeInTheDocument();
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

  it('updates layer styles on recResourceIds/pages change', () => {
    (useStore as Mock).mockReturnValue({
      extent: null,
      pages: [{ id: 1 }],
      recResourceIds: ['rec1', 'rec2'],
    });

    renderWithQueryClient(<SearchMap />);

    expect(setStyleMock).toHaveBeenCalledTimes(1);
  });

  it('zooms to extent when extent is provided', async () => {
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

    const { transformExtent } = await import('ol/proj');

    renderWithQueryClient(<SearchMap />);

    expect(transformExtent).toHaveBeenCalledWith(
      [0, 0, 100, 100],
      'EPSG:3005',
      'EPSG:3857',
    );

    expect(fitMock).toHaveBeenCalledWith([0, 0, 100, 100], {
      padding: [50, 50, 50, 50],
      maxZoom: 16,
      duration: 500,
    });

    expect(getZoomMock).toHaveBeenCalled();
    expect(setZoomMock).toHaveBeenCalledWith(8.01);
  });
});
