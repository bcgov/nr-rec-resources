import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, it, expect, vi } from 'vitest';
import { RouteChangeScrollReset } from './RouteChangeScrollReset';

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true,
});

describe('RouteChangeScrollReset', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children correctly', () => {
    const { getByText } = render(
      <MemoryRouter>
        <RouteChangeScrollReset>
          <div>Test Content</div>
        </RouteChangeScrollReset>
      </MemoryRouter>,
    );

    expect(getByText('Test Content')).toBeInTheDocument();
  });

  it('should scroll to top on mount', () => {
    render(
      <MemoryRouter>
        <RouteChangeScrollReset>
          <div>Test Content</div>
        </RouteChangeScrollReset>
      </MemoryRouter>,
    );

    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('should scroll to top when location changes', () => {
    const TestComponent = ({ pathname }: { pathname: string }) => (
      <MemoryRouter initialEntries={[pathname]} key={pathname}>
        <RouteChangeScrollReset>
          <div>Test Content</div>
        </RouteChangeScrollReset>
      </MemoryRouter>
    );

    const { rerender } = render(<TestComponent pathname="/" />);

    // Clear the initial scroll call
    vi.clearAllMocks();

    // Re-render with different location - the key prop will force a re-mount
    rerender(<TestComponent pathname="/search" />);

    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('should handle multiple children', () => {
    const { getByText } = render(
      <MemoryRouter>
        <RouteChangeScrollReset>
          <div>First Child</div>
          <div>Second Child</div>
        </RouteChangeScrollReset>
      </MemoryRouter>,
    );

    expect(getByText('First Child')).toBeInTheDocument();
    expect(getByText('Second Child')).toBeInTheDocument();
  });

  it('should handle no children (null)', () => {
    const { container } = render(
      <MemoryRouter>
        <RouteChangeScrollReset children={null} />
      </MemoryRouter>,
    );

    // The component should still render without errors
    expect(container.querySelector('div')).toBeNull();
  });
});
