import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { useRecResource } from '@/pages/rec-resource-page/hooks/useRecResource';
import { RecResourcePageLayout } from '@/pages/rec-resource-page/RecResourcePageLayout';
import { RecResourceRouteContext } from '@/routes/types';
import { useBreadcrumbs } from '@shared/index';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useMatches, useParams } from 'react-router-dom';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

// Mock all the child components
vi.mock(
  '@/pages/rec-resource-page/components/RecResourceVerticalNav/RecResourceVerticalNav',
  () => ({
    RecResourceVerticalNav: ({
      activeTab,
      resourceId,
    }: {
      activeTab: string;
      resourceId: string;
    }) => (
      <div
        data-testid="rec-resource-vertical-nav"
        data-active-tab={activeTab}
        data-resource-id={resourceId}
      >
        Mock RecResourceVerticalNav
      </div>
    ),
  }),
);

vi.mock('@/pages/rec-resource-page/components/ResourceHeaderSection', () => {
  return {
    ResourceHeaderSection: ({ recResource }: { recResource: any }) => (
      <div
        data-testid="resource-header-section"
        data-resource-name={recResource?.name}
      >
        Mock ResourceHeaderSection
      </div>
    ),
  };
});

vi.mock('@/pages/rec-resource-page/hooks/useRecResource', () => ({
  useRecResource: vi.fn(),
}));

vi.mock('@shared/index', () => ({
  Breadcrumbs: () => <div data-testid="breadcrumbs">Mock Breadcrumbs</div>,
  useBreadcrumbs: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(),
    useMatches: vi.fn(),
    Outlet: () => <div data-testid="outlet">Mock Outlet</div>,
  };
});

const mockUseRecResource = useRecResource as Mock;
const mockUseParams = useParams as Mock;
const mockUseMatches = useMatches as Mock;
const mockUseBreadcrumbs = useBreadcrumbs as Mock;

const createWrapper = (initialEntries = ['/rec-resource/123']) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe('RecResourcePageLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ id: '123' });
    mockUseMatches.mockReturnValue([
      {
        handle: { tab: RecResourceNavKey.OVERVIEW },
      },
    ]);
    mockUseBreadcrumbs.mockImplementation(() => {});
  });

  it('renders loading spinner when data is loading', () => {
    mockUseRecResource.mockReturnValue({
      recResource: null,
      isLoading: true,
      error: null,
    });

    render(<RecResourcePageLayout />, { wrapper: createWrapper() });

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Loading recreation resource'),
    ).toBeInTheDocument();
  });

  it('renders null when there is an error', () => {
    mockUseRecResource.mockReturnValue({
      recResource: null,
      isLoading: false,
      error: new Error('Test error'),
    });

    const { container } = render(<RecResourcePageLayout />, {
      wrapper: createWrapper(),
    });

    expect(container.firstChild).toBeNull();
  });

  it('renders null when rec_resource_id is not provided', () => {
    mockUseParams.mockReturnValue({ id: undefined });
    mockUseRecResource.mockReturnValue({
      recResource: { name: 'Test Resource', rec_resource_id: '123' },
      isLoading: false,
      error: null,
    });

    const { container } = render(<RecResourcePageLayout />, {
      wrapper: createWrapper(),
    });

    expect(container.firstChild).toBeNull();
  });

  it('renders full layout when data is loaded successfully', async () => {
    const mockResource = {
      name: 'Test Resource',
      rec_resource_id: '123',
    };

    mockUseRecResource.mockReturnValue({
      recResource: mockResource,
      isLoading: false,
      error: null,
    });

    render(<RecResourcePageLayout />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
      expect(screen.getByTestId('resource-header-section')).toBeInTheDocument();
      expect(
        screen.getByTestId('rec-resource-vertical-nav'),
      ).toBeInTheDocument();
      expect(screen.getByTestId('outlet')).toBeInTheDocument();
    });
  });

  it('calls useBreadcrumbs with correct context', () => {
    const mockResource = {
      name: 'Test Resource',
      rec_resource_id: '123',
    };

    mockUseRecResource.mockReturnValue({
      recResource: mockResource,
      isLoading: false,
      error: null,
    });

    render(<RecResourcePageLayout />, { wrapper: createWrapper() });

    expect(mockUseBreadcrumbs).toHaveBeenCalledWith({
      context: {
        resourceName: 'Test Resource',
        resourceId: '123',
      } as RecResourceRouteContext,
    });
  });

  it('updates active tab based on route matches', async () => {
    const mockResource = {
      name: 'Test Resource',
      rec_resource_id: '123',
    };

    mockUseRecResource.mockReturnValue({
      recResource: mockResource,
      isLoading: false,
      error: null,
    });

    mockUseMatches.mockReturnValue([
      {
        handle: { tab: RecResourceNavKey.FILES },
      },
    ]);

    render(<RecResourcePageLayout />, { wrapper: createWrapper() });

    await waitFor(() => {
      const verticalNav = screen.getByTestId('rec-resource-vertical-nav');
      expect(verticalNav).toHaveAttribute(
        'data-active-tab',
        RecResourceNavKey.FILES,
      );
    });
  });

  it('passes correct props to RecResourceVerticalNav', async () => {
    const mockResource = {
      name: 'Test Resource',
      rec_resource_id: '123',
    };

    mockUseRecResource.mockReturnValue({
      recResource: mockResource,
      isLoading: false,
      error: null,
    });

    render(<RecResourcePageLayout />, { wrapper: createWrapper() });

    await waitFor(() => {
      const verticalNav = screen.getByTestId('rec-resource-vertical-nav');
      expect(verticalNav).toHaveAttribute(
        'data-active-tab',
        RecResourceNavKey.OVERVIEW,
      );
      expect(verticalNav).toHaveAttribute('data-resource-id', '123');
    });
  });

  it('passes correct props to ResourceHeaderSection', async () => {
    const mockResource = {
      name: 'Test Resource',
      rec_resource_id: '123',
    };

    mockUseRecResource.mockReturnValue({
      recResource: mockResource,
      isLoading: false,
      error: null,
    });

    render(<RecResourcePageLayout />, { wrapper: createWrapper() });

    await waitFor(() => {
      const headerSection = screen.getByTestId('resource-header-section');
      expect(headerSection).toHaveAttribute(
        'data-resource-name',
        'Test Resource',
      );
    });
  });

  it('has correct layout structure and accessibility attributes', async () => {
    const mockResource = {
      name: 'Test Resource',
      rec_resource_id: '123',
    };

    mockUseRecResource.mockReturnValue({
      recResource: mockResource,
      isLoading: false,
      error: null,
    });

    render(<RecResourcePageLayout />, { wrapper: createWrapper() });

    await waitFor(() => {
      const mainContainer = screen.getByRole('main');
      expect(mainContainer).toHaveAttribute(
        'aria-label',
        'Recreation resource content',
      );
      expect(mainContainer).toHaveClass('rec-resource-page');
    });
  });

  it('renders loading spinner with correct accessibility attributes', () => {
    mockUseRecResource.mockReturnValue({
      recResource: null,
      isLoading: true,
      error: null,
    });

    render(<RecResourcePageLayout />, { wrapper: createWrapper() });

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute(
      'aria-label',
      'Loading recreation resource',
    );
    expect(spinner).toHaveClass('rec-resource-page__loading-spinner');
  });

  it('loading container has correct CSS class', () => {
    mockUseRecResource.mockReturnValue({
      recResource: null,
      isLoading: true,
      error: null,
    });

    const { container } = render(<RecResourcePageLayout />, {
      wrapper: createWrapper(),
    });

    const loadingContainer = container.querySelector(
      '.rec-resource-page__loading-container',
    );
    expect(loadingContainer).toBeInTheDocument();
  });

  it('handles multiple route matches correctly', async () => {
    const mockResource = {
      name: 'Test Resource',
      rec_resource_id: '123',
    };

    mockUseRecResource.mockReturnValue({
      recResource: mockResource,
      isLoading: false,
      error: null,
    });

    mockUseMatches.mockReturnValue([
      {
        handle: { tab: RecResourceNavKey.OVERVIEW },
      },
      {
        handle: { tab: RecResourceNavKey.FILES },
      },
    ]);

    render(<RecResourcePageLayout />, { wrapper: createWrapper() });

    await waitFor(() => {
      const verticalNav = screen.getByTestId('rec-resource-vertical-nav');
      // Should use the last match
      expect(verticalNav).toHaveAttribute(
        'data-active-tab',
        RecResourceNavKey.FILES,
      );
    });
  });

  it('handles resource with undefined name in breadcrumbs', () => {
    const mockResource = {
      rec_resource_id: '123',
      // name is undefined
    };

    mockUseRecResource.mockReturnValue({
      recResource: mockResource,
      isLoading: false,
      error: null,
    });

    render(<RecResourcePageLayout />, { wrapper: createWrapper() });

    expect(mockUseBreadcrumbs).toHaveBeenCalledWith({
      context: {
        resourceName: undefined,
        resourceId: '123',
      } as RecResourceRouteContext,
    });
  });

  it('updates activeTab when matches change', async () => {
    const mockResource = {
      name: 'Test Resource',
      rec_resource_id: '123',
    };

    mockUseRecResource.mockReturnValue({
      recResource: mockResource,
      isLoading: false,
      error: null,
    });

    const { rerender } = render(<RecResourcePageLayout />, {
      wrapper: createWrapper(),
    });

    // Change the matches
    mockUseMatches.mockReturnValue([
      {
        handle: { tab: RecResourceNavKey.FILES },
      },
    ]);

    rerender(<RecResourcePageLayout />);

    await waitFor(() => {
      const verticalNav = screen.getByTestId('rec-resource-vertical-nav');
      expect(verticalNav).toHaveAttribute(
        'data-active-tab',
        RecResourceNavKey.FILES,
      );
    });
  });
});
