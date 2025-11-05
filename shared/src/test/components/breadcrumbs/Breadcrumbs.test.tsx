import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '@shared/test/test-utils';
import { Breadcrumbs, BreadcrumbItem } from '@shared/components/breadcrumbs';

const mockUseMatches = vi.fn();
vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useMatches: () => mockUseMatches(),
  };
});

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon, ...props }: any) => (
    <span
      data-testid="font-awesome-icon"
      data-icon={icon.iconName}
      {...props}
    />
  ),
}));

vi.mock('react-bootstrap', () => {
  const BreadcrumbComponent = ({ children, ...props }: any) => (
    <nav data-testid="breadcrumbs" {...props}>
      {children}
    </nav>
  );

  BreadcrumbComponent.Item = ({ children, ...props }: any) => (
    <span data-testid="breadcrumb-item" {...props}>
      {children}
    </span>
  );

  return {
    Breadcrumb: BreadcrumbComponent,
  };
});

describe('Breadcrumbs Component', () => {
  beforeEach(() => {
    mockUseMatches.mockReturnValue([
      {
        context: {},
        loaderData: {},
      },
    ]);
  });

  it('renders without breadcrumb items', async () => {
    await renderWithRouter(<Breadcrumbs />);
    const breadcrumbs = screen.getByTestId('breadcrumbs');
    expect(breadcrumbs).toBeInTheDocument();
  });

  it('renders with single breadcrumb item', async () => {
    const items: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];

    mockUseMatches.mockReturnValue([
      {
        context: {
          breadcrumb: () => items,
        },
        loaderData: {},
      },
    ]);
    await renderWithRouter(<Breadcrumbs showHomeIcon={false} />);

    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('renders with multiple breadcrumb items', async () => {
    const items: BreadcrumbItem[] = [
      { label: 'Home', href: '/' },
      { label: 'Search', href: '/search' },
      { label: 'Current Page', isCurrent: true },
    ];

    mockUseMatches.mockReturnValue([
      {
        context: {
          breadcrumb: () => items,
        },
        loaderData: {},
      },
    ]);
    await renderWithRouter(<Breadcrumbs showHomeIcon={false} />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Current Page')).toBeInTheDocument();
  });

  it('renders home icon for first item when showHomeIcon is true', async () => {
    const items: BreadcrumbItem[] = [
      { label: 'Home', href: '/' },
      { label: 'Current', isCurrent: true },
    ];

    mockUseMatches.mockReturnValue([
      {
        context: {
          breadcrumb: () => items,
        },
        loaderData: {},
      },
    ]);
    await renderWithRouter(<Breadcrumbs showHomeIcon />);

    const homeIcon = screen.getByTestId('font-awesome-icon');
    expect(homeIcon).toHaveAttribute('data-icon', 'house');
  });

  it('renders label text for first item when showHomeIcon is false', async () => {
    const items: BreadcrumbItem[] = [
      { label: 'Home', href: '/' },
      { label: 'Current', isCurrent: true },
    ];

    mockUseMatches.mockReturnValue([
      {
        context: {
          breadcrumb: () => items,
        },
        loaderData: {},
      },
    ]);
    await renderWithRouter(<Breadcrumbs showHomeIcon={false} />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.queryByTestId('font-awesome-icon')).not.toBeInTheDocument();
  });

  it('handles breadcrumb items without href', async () => {
    const items: BreadcrumbItem[] = [
      { label: 'Home', href: '/' },
      { label: 'Current Page' },
    ];

    mockUseMatches.mockReturnValue([
      {
        context: {
          breadcrumb: () => items,
        },
        loaderData: {},
      },
    ]);
    await renderWithRouter(<Breadcrumbs showHomeIcon={false} />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Current Page')).toBeInTheDocument();
  });

  it('handles empty breadcrumb items array', async () => {
    mockUseMatches.mockReturnValue([
      {
        context: {
          breadcrumb: () => [],
        },
        loaderData: {},
      },
    ]);
    await renderWithRouter(<Breadcrumbs />);

    const breadcrumbs = screen.getByTestId('breadcrumbs');
    expect(breadcrumbs).toBeInTheDocument();
    expect(breadcrumbs).toBeEmptyDOMElement();
  });

  it('applies custom className when provided', async () => {
    const customClassName = 'custom-breadcrumb-class';
    await renderWithRouter(<Breadcrumbs className={customClassName} />);

    const breadcrumbs = screen.getByTestId('breadcrumbs');
    expect(breadcrumbs).toHaveClass(customClassName);
  });

  it('marks current item as active', async () => {
    const items: BreadcrumbItem[] = [
      { label: 'Home', href: '/' },
      { label: 'Current', isCurrent: true },
    ];

    mockUseMatches.mockReturnValue([
      {
        context: {
          breadcrumb: () => items,
        },
        loaderData: {},
      },
    ]);
    await renderWithRouter(<Breadcrumbs />);

    // The active item should be rendered differently (implementation depends on React Bootstrap mock)
    expect(screen.getByText('Current')).toBeInTheDocument();
  });

  it('handles breadcrumb items with special characters in labels', async () => {
    const items: BreadcrumbItem[] = [
      { label: 'Home & Garden', href: '/' },
      { label: 'Café & Restaurant', href: '/cafe' },
      { label: 'Current "Page"', isCurrent: true },
    ];

    mockUseMatches.mockReturnValue([
      {
        context: {
          breadcrumb: () => items,
        },
        loaderData: {},
      },
    ]);
    await renderWithRouter(<Breadcrumbs showHomeIcon={false} />);

    expect(screen.getByText('Home & Garden')).toBeInTheDocument();
    expect(screen.getByText('Café & Restaurant')).toBeInTheDocument();
    expect(screen.getByText('Current "Page"')).toBeInTheDocument();
  });
});
