import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import App from './App';

// Mock the components and dependencies
vi.mock('@/components/layout/Header', () => ({
  default: () => <div data-testid="mock-header">Header</div>,
}));
vi.mock('@/components/layout/Footer', () => ({
  default: () => <div data-testid="mock-footer">Footer</div>,
}));
vi.mock('@/routes', () => ({
  default: () => <div data-testid="mock-routes">Routes</div>,
}));

describe('App', () => {
  it('renders the app structure correctly', () => {
    const { getByTestId } = render(<App />);

    expect(getByTestId('mock-header')).toBeInTheDocument();
    expect(getByTestId('mock-routes')).toBeInTheDocument();
    expect(getByTestId('mock-footer')).toBeInTheDocument();
  });

  it('initializes QueryClient', () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });
});
