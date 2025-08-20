/**
 * Comprehensive test suite for the breadcrumb system
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Breadcrumbs, BreadcrumbItem } from './index';
import { setBreadcrumbs } from './store/breadcrumbStore';

describe('Breadcrumb System', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  const renderWithRouter = (
    component: React.ReactNode,
    initialEntries = ['/'],
  ) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>{component}</MemoryRouter>,
    );
  };

  describe('Breadcrumbs Component', () => {
    it('renders nothing when no breadcrumb items are provided', () => {
      renderWithRouter(<Breadcrumbs items={[]} />);
      expect(screen.queryByTestId('breadcrumbs')).not.toBeInTheDocument();
    });

    it('renders breadcrumbs from store when items prop is not provided', () => {
      setBreadcrumbs([
        { label: 'Store Home', href: '/' },
        { label: 'Store Page', isCurrent: true },
      ]);
      renderWithRouter(<Breadcrumbs />);
      expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
      expect(screen.getByText('Store Page')).toBeInTheDocument();
    });

    it('renders custom breadcrumb items when provided', () => {
      const customItems: BreadcrumbItem[] = [
        { label: 'Home', href: '/' },
        { label: 'Custom Page', href: '/custom' },
        { label: 'Current', isCurrent: true },
      ];

      renderWithRouter(<Breadcrumbs items={customItems} />);

      expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
      // Home icon is shown for first item by default
      expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();

      expect(screen.getByText('Custom Page')).toBeInTheDocument();
      expect(screen.getByText('Current')).toBeInTheDocument();
    });

    it('applies custom className and aria-label', () => {
      const items = [{ label: 'Test', isCurrent: true }];

      renderWithRouter(
        <Breadcrumbs
          items={items}
          className="custom-class"
          ariaLabel="Custom navigation"
        />,
      );

      const breadcrumb = screen.getByTestId('breadcrumbs');
      expect(breadcrumb).toHaveClass('custom-class');
      expect(breadcrumb).toHaveAttribute('aria-label', 'Custom navigation');
    });

    it('shows home icon by default for first item', () => {
      const items = [
        { label: 'Home', href: '/' },
        { label: 'Page', isCurrent: true },
      ];

      renderWithRouter(<Breadcrumbs items={items} />);

      const homeIcon = screen.getByRole('link', { name: 'Home' });
      expect(homeIcon).toBeInTheDocument();
    });

    it('sets proper aria-current attribute for current page', () => {
      const items = [
        { label: 'Home', href: '/' },
        { label: 'Current Page', isCurrent: true },
      ];

      renderWithRouter(<Breadcrumbs items={items} />);

      const currentItem = screen.getByText('Current Page');
      expect(currentItem).toHaveAttribute('aria-current', 'page');
    });

    it('sets proper navigation aria-label', () => {
      const items = [{ label: 'Test', isCurrent: true }];

      renderWithRouter(<Breadcrumbs items={items} />);

      const nav = screen.getByTestId('breadcrumbs');
      expect(nav).toHaveAttribute('aria-label', 'Breadcrumb navigation');
    });
  });
});
