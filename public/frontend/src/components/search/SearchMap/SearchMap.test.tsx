import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
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
    render(<SearchMap />);

    expect(screen.getByTestId('vector-feature-map')).toBeInTheDocument();
    expect(screen.getByTestId('search-view-controls')).toBeInTheDocument();
  });

  it('applies custom styles to the container', () => {
    render(<SearchMap style={{ height: '400px' }} />);
    const container = document.querySelector('.search-map-container');

    expect(container).toHaveStyle('height: 400px');
  });
});
