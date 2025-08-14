import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BreadCrumbs from '@/components/bread-crumbs/BreadCrumbs';
import { useBreadcrumbManagement } from '@/components/bread-crumbs/hooks/useBreadcrumbManagement';

// Mock component to test breadcrumb functionality
const TestComponentWithBreadcrumbs = ({
  resourceId,
  resourceName,
}: {
  resourceId?: string;
  resourceName?: string;
}) => {
  useBreadcrumbManagement({ resourceId, resourceName });
  return <BreadCrumbs />;
};

describe('Breadcrumb System', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  const renderWithBreadcrumbProvider = (
    component: React.ReactNode,
    initialEntries = ['/'],
  ) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>{component}</MemoryRouter>,
    );
  };

  it('renders home breadcrumb for root path', () => {
    renderWithBreadcrumbProvider(<TestComponentWithBreadcrumbs />, ['/']);

    expect(screen.getByLabelText('Breadcrumb navigation')).toBeInTheDocument();
    expect(screen.getByAltText('Home')).toBeInTheDocument();
  });

  it('generates correct breadcrumbs for resource page', () => {
    renderWithBreadcrumbProvider(
      <TestComponentWithBreadcrumbs
        resourceId="REC123"
        resourceName="Test Resource"
      />,
      ['/resource/REC123'],
    );

    expect(screen.getByAltText('Home')).toBeInTheDocument();
    expect(screen.getByText('Find a site or trail')).toBeInTheDocument();
    expect(screen.getByText('Test Resource')).toBeInTheDocument();
  });

  it('generates correct breadcrumbs for contact page with resource context', () => {
    renderWithBreadcrumbProvider(
      <TestComponentWithBreadcrumbs
        resourceId="REC123"
        resourceName="Test Resource"
      />,
      ['/resource/REC123/contact'],
    );

    expect(screen.getByAltText('Home')).toBeInTheDocument();
    expect(screen.getByText('Find a site or trail')).toBeInTheDocument();
    expect(screen.getByText('Test Resource')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('handles search context from sessionStorage', () => {
    sessionStorage.setItem('lastSearch', '?filter=camping');

    renderWithBreadcrumbProvider(
      <TestComponentWithBreadcrumbs
        resourceId="REC123"
        resourceName="Test Resource"
      />,
      ['/resource/REC123'],
    );

    const searchLink = screen.getByText('Find a site or trail').closest('a');
    expect(searchLink).toHaveAttribute('href', '/search?filter=camping');
  });

  it('renders custom breadcrumb items when provided', () => {
    const customItems = [
      { label: 'Home', href: '/' },
      { label: 'Custom Page', href: '/custom' },
      { label: 'Current', isCurrent: true },
    ];

    renderWithBreadcrumbProvider(<BreadCrumbs items={customItems} />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Custom Page')).toBeInTheDocument();
    expect(screen.getByText('Current')).toBeInTheDocument();
  });

  it('handles accessibility properly', () => {
    renderWithBreadcrumbProvider(
      <TestComponentWithBreadcrumbs
        resourceId="REC123"
        resourceName="Test Resource"
      />,
      ['/resource/REC123'],
    );

    const nav = screen.getByLabelText('Breadcrumb navigation');
    expect(nav).toHaveAttribute('aria-label', 'Breadcrumb navigation');

    const currentPage = screen.getByText('Test Resource');
    expect(currentPage).toHaveAttribute('aria-current', 'page');
  });
});
