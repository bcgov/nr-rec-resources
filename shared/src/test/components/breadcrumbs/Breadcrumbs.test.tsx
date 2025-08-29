import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import {
  setBreadcrumbs,
  Breadcrumbs,
  BreadcrumbItem,
} from '@shared/components/breadcrumbs';

// Mock FontAwesome components
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon, ...props }: any) => (
    <span
      data-testid="font-awesome-icon"
      data-icon={icon.iconName}
      {...props}
    />
  ),
}));

// Mock React Bootstrap components
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

// Helper function to render component with router
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Breadcrumbs Component', () => {
  beforeEach(() => {
    // Clear breadcrumbs before each test
    setBreadcrumbs([]);
  });

  it('renders without breadcrumb items', () => {
    renderWithRouter(<Breadcrumbs />);
    const breadcrumbs = screen.getByTestId('breadcrumbs');
    expect(breadcrumbs).toBeInTheDocument();
  });

  it('renders with single breadcrumb item', () => {
    const items: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];

    setBreadcrumbs(items);
    renderWithRouter(<Breadcrumbs showHomeIcon={false} />);

    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('renders with multiple breadcrumb items', () => {
    const items: BreadcrumbItem[] = [
      { label: 'Home', href: '/' },
      { label: 'Search', href: '/search' },
      { label: 'Current Page', isCurrent: true },
    ];

    setBreadcrumbs(items);
    renderWithRouter(<Breadcrumbs showHomeIcon={false} />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Current Page')).toBeInTheDocument();
  });

  it('renders home icon for first item when showHomeIcon is true', () => {
    const items: BreadcrumbItem[] = [
      { label: 'Home', href: '/' },
      { label: 'Current', isCurrent: true },
    ];

    setBreadcrumbs(items);
    renderWithRouter(<Breadcrumbs showHomeIcon />);

    const homeIcon = screen.getByTestId('font-awesome-icon');
    expect(homeIcon).toHaveAttribute('data-icon', 'house');
  });

  it('renders label text for first item when showHomeIcon is false', () => {
    const items: BreadcrumbItem[] = [
      { label: 'Home', href: '/' },
      { label: 'Current', isCurrent: true },
    ];

    setBreadcrumbs(items);
    renderWithRouter(<Breadcrumbs showHomeIcon={false} />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.queryByTestId('font-awesome-icon')).not.toBeInTheDocument();
  });

  it('handles breadcrumb items without href', () => {
    const items: BreadcrumbItem[] = [
      { label: 'Home', href: '/' },
      { label: 'Current Page' },
    ];

    setBreadcrumbs(items);
    renderWithRouter(<Breadcrumbs showHomeIcon={false} />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Current Page')).toBeInTheDocument();
  });

  it('handles empty breadcrumb items array', () => {
    setBreadcrumbs([]);
    renderWithRouter(<Breadcrumbs />);

    const breadcrumbs = screen.getByTestId('breadcrumbs');
    expect(breadcrumbs).toBeInTheDocument();
    expect(breadcrumbs).toBeEmptyDOMElement();
  });

  it('applies custom className when provided', () => {
    const customClassName = 'custom-breadcrumb-class';
    renderWithRouter(<Breadcrumbs className={customClassName} />);

    const breadcrumbs = screen.getByTestId('breadcrumbs');
    expect(breadcrumbs).toHaveClass(customClassName);
  });

  it('marks current item as active', () => {
    const items: BreadcrumbItem[] = [
      { label: 'Home', href: '/' },
      { label: 'Current', isCurrent: true },
    ];

    setBreadcrumbs(items);
    renderWithRouter(<Breadcrumbs />);

    // The active item should be rendered differently (implementation depends on React Bootstrap mock)
    expect(screen.getByText('Current')).toBeInTheDocument();
  });

  it('handles breadcrumb items with special characters in labels', () => {
    const items: BreadcrumbItem[] = [
      { label: 'Home & Garden', href: '/' },
      { label: 'Café & Restaurant', href: '/cafe' },
      { label: 'Current "Page"', isCurrent: true },
    ];

    setBreadcrumbs(items);
    renderWithRouter(<Breadcrumbs showHomeIcon={false} />);

    expect(screen.getByText('Home & Garden')).toBeInTheDocument();
    expect(screen.getByText('Café & Restaurant')).toBeInTheDocument();
    expect(screen.getByText('Current "Page"')).toBeInTheDocument();
  });
});
