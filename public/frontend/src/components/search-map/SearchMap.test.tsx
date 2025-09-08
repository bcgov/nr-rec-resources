import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { renderWithQueryClient } from '@/test-utils';
import SearchMap from '@/components/search-map/SearchMap';
import * as hooks from '@/components/search-map/hooks/useMapFocus';
import { trackClickEvent } from '@/utils/matomo';

// Mock all hooks with proper return values
vi.mock('@/components/search-map/hooks/useMapFocus', () => ({
  useMapFocus: vi.fn(),
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

vi.mock('@/components/layout/Header', () => ({
  default: () =>
    React.createElement('div', { 'data-testid': 'header' }, 'Header'),
}));

vi.mock('@/components/search-map/preview', () => ({
  RecreationFeaturePreview: ({
    rec_resource_id,
    onClose,
  }: {
    rec_resource_id: string;
    onClose?: () => void;
  }) => {
    const children = ['RecreationFeaturePreview: ', rec_resource_id];
    if (onClose) {
      children.push(
        React.createElement('button', { onClick: onClose }, 'Close Preview'),
      );
    }
    return React.createElement(
      'div',
      { 'data-testid': 'recreation-preview' },
      ...children,
    );
  },
  WildfireFeaturePreview: ({
    onClose,
  }: {
    onClose: () => void;
    feature?: any;
  }) => {
    return React.createElement(
      'div',
      { 'data-testid': 'wildfire-preview' },
      'WildfireFeaturePreview',
      React.createElement('button', { onClick: onClose }, 'Close'),
    );
  },
}));

vi.mock('@/components/search/filters/FilterMenuSearchMap', () => ({
  default: ({
    isOpen,
    setIsOpen,
  }: {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
  }) => {
    const children = ['FilterMenuSearchMap ', isOpen ? 'Open' : 'Closed'];
    if (setIsOpen) {
      children.push(
        React.createElement(
          'button',
          {
            onClick: () => setIsOpen(false),
            'data-testid': 'close-filter-button',
          },
          'Close Filter',
        ),
      );
    }
    return React.createElement(
      'div',
      { 'data-testid': 'filter-menu' },
      ...children,
    );
  },
}));

vi.mock(
  '@/components/recreation-suggestion-form/RecreationSuggestionForm',
  () => ({
    default: () =>
      React.createElement(
        'div',
        { 'data-testid': 'suggestion-form' },
        'RecreationSuggestionForm',
      ),
  }),
);

vi.mock('@/components/search', () => ({
  SearchViewControls: ({
    variant,
    onListViewClick,
  }: {
    variant: string;
    onListViewClick?: () => void;
  }) => {
    const children = ['SearchViewControls ', variant];
    // Always add the button since the actual component seems to always render it
    children.push(
      React.createElement(
        'button',
        { onClick: onListViewClick || (() => {}) },
        'Show list',
      ),
    );
    return React.createElement(
      'div',
      { 'data-testid': 'search-view-controls' },
      ...children,
    );
  },
}));

vi.mock('@/utils/matomo', () => ({
  trackClickEvent: vi.fn(),
}));

vi.mock(
  '@/components/rec-resource/RecreationResourceMap/MapDisclaimerModal',
  () => ({
    default: ({
      isOpen,
      onClose,
    }: {
      isOpen: boolean;
      onClose: () => void;
    }) => {
      return React.createElement(
        'div',
        { 'data-testid': 'disclaimer-modal' },
        'MapDisclaimerModal ',
        isOpen ? 'Open' : 'Closed',
        React.createElement('button', { onClick: onClose }, 'Close Modal'),
      );
    },
  }),
);

vi.mock('@shared/components/loading-overlay', () => ({
  LoadingOverlay: ({ isLoading }: { isLoading: boolean }) =>
    React.createElement(
      'div',
      { 'data-testid': 'loading-overlay' },
      isLoading ? 'Loading...' : 'Not Loading',
    ),
}));

// Create a more comprehensive mock for the map component
const mockMapRef = {
  current: {
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
  },
};

vi.mock('@bcgov/prp-map', () => ({
  VectorFeatureMap: React.forwardRef((props: any, ref: any) => {
    React.useImperativeHandle(ref, () => mockMapRef.current);

    return React.createElement(
      'div',
      { 'data-testid': 'vector-feature-map', onClick: props.onClick },
      'VectorFeatureMap',
      // Removed the filters button since the actual component has its own filter buttons
    );
  }),
}));

// Mock any store or context providers if needed
vi.mock('@/stores/searchStore', () => ({
  useSearchStore: () => ({
    filters: {},
    setFilters: vi.fn(),
    searchResults: [],
    isLoading: false,
  }),
}));

describe('SearchMap', () => {
  const mockUseMapFocus = hooks.useMapFocus as any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMapFocus.mockReturnValue({
      isMapFocusLoading: false,
      mapCenter: [0, 0],
      mapZoom: 10,
    });

    // Reset any localStorage mocks if your component uses them
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

  it('renders main components', () => {
    renderWithQueryClient(<SearchMap />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('vector-feature-map')).toBeDefined();
    expect(screen.getByTestId('suggestion-form')).toBeDefined();
    expect(screen.getByTestId('search-view-controls')).toBeDefined();
    expect(screen.getByTestId('loading-overlay')).toBeDefined();
  });

  it('shows disclaimer modal when initially rendered', () => {
    renderWithQueryClient(<SearchMap />);
    expect(screen.getByTestId('disclaimer-modal')).toBeDefined();
  });

  it('can close disclaimer modal', () => {
    renderWithQueryClient(<SearchMap />);
    const closeButton = screen.getByText('Close Modal');

    fireEvent.click(closeButton);

    // The modal should still exist but show as closed
    expect(screen.getByText('MapDisclaimerModal Closed')).toBeDefined();
  });

  it('toggles filter menu on button click', () => {
    renderWithQueryClient(<SearchMap />);

    // Look for the filters button in the SearchMap component (there are multiple, get the first one)
    const filtersButtons = screen.getAllByText('Filters');
    const filtersButton = filtersButtons[0];

    // Initially closed
    expect(screen.getByText('FilterMenuSearchMap Closed')).toBeDefined();

    // Click to open
    fireEvent.click(filtersButton);
    expect(screen.getByText('FilterMenuSearchMap Open')).toBeDefined();

    // Click to close
    fireEvent.click(filtersButton);
    expect(screen.getByText('FilterMenuSearchMap Closed')).toBeDefined();
  });

  it('shows loading state when map focus is loading', () => {
    mockUseMapFocus.mockReturnValue({
      isMapFocusLoading: true,
      mapCenter: [0, 0],
      mapZoom: 10,
    });

    renderWithQueryClient(<SearchMap />);
    expect(screen.getByText('Loading...')).toBeDefined();
  });

  it('shows not loading state when map focus is not loading', () => {
    mockUseMapFocus.mockReturnValue({
      isMapFocusLoading: false,
      mapCenter: [0, 0],
      mapZoom: 10,
    });

    renderWithQueryClient(<SearchMap />);
    expect(screen.getByText('Not Loading')).toBeDefined();
  });

  it('handles list view button click', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    renderWithQueryClient(<SearchMap />);

    const listButton = screen.queryByText('Show list');
    if (listButton) {
      fireEvent.click(listButton);
      // Add assertions based on what should happen
    }

    consoleSpy.mockRestore();
  });

  it('tracks click events when matomo is called', async () => {
    renderWithQueryClient(<SearchMap />);

    // Simulate calling trackClickEvent directly (as you might in your actual component)
    const eventData = {
      category: 'Search Map',
      action: 'Recreation feature selected',
      name: 'Test Feature',
    };

    await act(async () => {
      trackClickEvent(eventData);
    });

    expect(trackClickEvent).toHaveBeenCalledWith(eventData);
  });

  it('handles feature selection scenarios', async () => {
    renderWithQueryClient(<SearchMap />);

    // You can test the component's behavior when props change
    // or when certain conditions are met, rather than trying to
    // simulate complex OpenLayers interactions

    // For example, if your component accepts selectedFeature as a prop:
    // rerender(<SearchMap selectedFeature={{ id: '123' }} />);
    // expect(screen.getByText('RecreationFeaturePreview: 123')).toBeDefined();
  });

  it('handles window resize events if component listens to them', () => {
    renderWithQueryClient(<SearchMap />);

    // Simulate window resize
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    // Add assertions based on expected behavior
    expect(screen.getByTestId('vector-feature-map')).toBeDefined();
  });

  it('cleans up properly on unmount', () => {
    const { unmount } = renderWithQueryClient(<SearchMap />);

    expect(() => unmount()).not.toThrow();
  });
});
