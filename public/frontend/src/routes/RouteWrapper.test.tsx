import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, it, expect, vi } from 'vitest';
import { RouteWrapper } from './RouteWrapper';

// Mock the components
vi.mock('@/components/layout/Header', () => ({
  default: () => <header data-testid="header">Header Component</header>,
}));

vi.mock('@/components/layout/Footer', () => ({
  default: () => <footer data-testid="footer">Footer Component</footer>,
}));

vi.mock('@/routes/RouteChangeScrollReset', () => ({
  RouteChangeScrollReset: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="scroll-reset">{children}</div>
  ),
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet">Outlet Content</div>,
  };
});

// Mock window.scrollTo for RouteChangeScrollReset
Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true,
});

describe('RouteWrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render header, main content, and footer', () => {
    const { getByTestId } = render(
      <MemoryRouter>
        <RouteWrapper />
      </MemoryRouter>,
    );

    expect(getByTestId('header')).toBeInTheDocument();
    expect(getByTestId('footer')).toBeInTheDocument();
    expect(getByTestId('outlet')).toBeInTheDocument();
  });

  it('should render main element with correct id', () => {
    const { container } = render(
      <MemoryRouter>
        <RouteWrapper />
      </MemoryRouter>,
    );

    const mainElement = container.querySelector('main');
    expect(mainElement).toBeInTheDocument();
    expect(mainElement).toHaveAttribute('id', 'main-content');
  });

  it('should wrap outlet in RouteChangeScrollReset', () => {
    const { getByTestId } = render(
      <MemoryRouter>
        <RouteWrapper />
      </MemoryRouter>,
    );

    const scrollReset = getByTestId('scroll-reset');
    const outlet = getByTestId('outlet');

    expect(scrollReset).toBeInTheDocument();
    expect(scrollReset).toContainElement(outlet);
  });

  it('should have correct layout structure', () => {
    const { container } = render(
      <MemoryRouter>
        <RouteWrapper />
      </MemoryRouter>,
    );

    // Check that the structure contains header, main, and footer
    const header = container.querySelector('header');
    const main = container.querySelector('main');
    const footer = container.querySelector('footer');

    expect(header).toBeInTheDocument();
    expect(main).toBeInTheDocument();
    expect(footer).toBeInTheDocument();

    // Check that main has the correct id
    expect(main).toHaveAttribute('id', 'main-content');
  });

  it('should render without errors', () => {
    expect(() => {
      render(
        <MemoryRouter>
          <RouteWrapper />
        </MemoryRouter>,
      );
    }).not.toThrow();
  });
});
