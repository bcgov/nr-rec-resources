import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { RecResourceOverviewLink } from '@/components/RecResourceOverviewLink';

describe('RecResourceOverviewLink', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: component,
        },
        {
          path: '/rec-resource/:id',
          element: <div>Resource Overview Page</div>,
        },
      ],
      {
        initialEntries: ['/'],
      },
    );
    return render(<RouterProvider router={router} />);
  };

  it('should render children correctly', () => {
    renderWithRouter(
      <RecResourceOverviewLink rec_resource_id="123">
        <button>View Resource</button>
      </RecResourceOverviewLink>,
    );

    expect(
      screen.getByRole('button', { name: 'View Resource' }),
    ).toBeInTheDocument();
  });

  it('should generate correct link path with resource id', () => {
    renderWithRouter(
      <RecResourceOverviewLink rec_resource_id="456">
        <span>Test Link</span>
      </RecResourceOverviewLink>,
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/rec-resource/456/overview');
  });

  it('should handle string resource ids', () => {
    renderWithRouter(
      <RecResourceOverviewLink rec_resource_id="test-resource-id">
        <div>Resource Link</div>
      </RecResourceOverviewLink>,
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute(
      'href',
      '/rec-resource/test-resource-id/overview',
    );
  });

  it('should render as a proper link element', () => {
    renderWithRouter(
      <RecResourceOverviewLink rec_resource_id="789">
        <span>Link Content</span>
      </RecResourceOverviewLink>,
    );

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe('A');
  });

  it('should pass through complex children', () => {
    renderWithRouter(
      <RecResourceOverviewLink rec_resource_id="complex">
        <div>
          <h3>Complex Content</h3>
          <p>With multiple elements</p>
        </div>
      </RecResourceOverviewLink>,
    );

    expect(screen.getByText('Complex Content')).toBeInTheDocument();
    expect(screen.getByText('With multiple elements')).toBeInTheDocument();
  });
});
