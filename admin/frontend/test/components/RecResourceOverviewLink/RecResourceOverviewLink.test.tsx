import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecResourceOverviewLink } from '@/components/RecResourceOverviewLink';
import { useLocation } from '@tanstack/react-router';

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useLocation: vi.fn(),
    Link: ({ to, children, ...props }: any) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  };
});

describe('RecResourceOverviewLink', () => {
  beforeEach(() => {
    vi.mocked(useLocation).mockReturnValue({
      search: '',
    } as any);
  });

  it('should render children correctly', () => {
    render(
      <RecResourceOverviewLink rec_resource_id="123">
        <button>View Resource</button>
      </RecResourceOverviewLink>,
    );

    expect(
      screen.getByRole('button', { name: 'View Resource' }),
    ).toBeInTheDocument();
  });

  it('should generate correct link path with resource id', () => {
    render(
      <RecResourceOverviewLink rec_resource_id="456">
        <span>Test Link</span>
      </RecResourceOverviewLink>,
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/rec-resource/456/overview');
  });

  it('should handle string resource ids', () => {
    render(
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
    render(
      <RecResourceOverviewLink rec_resource_id="789">
        <span>Link Content</span>
      </RecResourceOverviewLink>,
    );

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe('A');
  });

  it('should pass through complex children', () => {
    render(
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
