import { screen } from '@testing-library/react';
import { vi } from 'vitest';
import { renderWithQueryClient } from '@/test-utils';
import SearchMap from '@/components/search/SearchMap/SearchMap';

vi.mock('@bcgov/prp-map', () => ({
  createRecreationFeatureSource: vi.fn(),
  createRecreationFeatureLayer: vi.fn(),
  VectorFeatureMap: vi.fn(() => <div data-testid="vector-feature-map" />),
}));

vi.mock('@/components/search/SearchMap/SearchViewControls', () => ({
  default: () => <div data-testid="search-view-controls" />,
}));

describe('SearchMap', () => {
  it('renders the map container with VectorFeatureMap and SearchViewControls', () => {
    renderWithQueryClient(<SearchMap />);

    expect(screen.getByTestId('vector-feature-map')).toBeInTheDocument();
    expect(screen.getByTestId('search-view-controls')).toBeInTheDocument();
  });

  it('applies custom styles to the container', () => {
    renderWithQueryClient(<SearchMap style={{ height: '400px' }} />);
    const container = document.querySelector('.search-map-container');

    expect(container).toHaveStyle('height: 400px');
  });
});
