import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LinkWithQueryParams } from '@shared/components/link-with-query-params/LinkWithQueryParams';

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, search, className, children, ...props }: any) => {
    const href = search ? `${to}${search}` : to;
    return (
      <a href={href} className={className} {...props}>
        {children}
      </a>
    );
  },
  useLocation: vi.fn(),
}));

describe('LinkWithQueryParams', () => {
  it('appends current location.search to string `to`', async () => {
    const { useLocation } = await import('@tanstack/react-router');
    vi.mocked(useLocation).mockReturnValue({
      search: '?flag=true',
    } as any);

    render(<LinkWithQueryParams to="/target">Click</LinkWithQueryParams>);

    const link = screen.getByRole('link', { name: /click/i });
    expect(link).toBeInTheDocument();
    expect(link.getAttribute('href')).toBe('/target?flag=true');
  });

  it('passes through other Link props like className', async () => {
    const { useLocation } = await import('@tanstack/react-router');
    vi.mocked(useLocation).mockReturnValue({
      search: '?c=1',
    } as any);

    render(
      <LinkWithQueryParams to="/abc" className="my-link">
        Label
      </LinkWithQueryParams>,
    );

    const link = screen.getByRole('link', { name: /label/i });
    expect(link).toHaveClass('my-link');
    expect(link.getAttribute('href')).toBe('/abc?c=1');
  });

  it('works when there are no query params', async () => {
    const { useLocation } = await import('@tanstack/react-router');
    vi.mocked(useLocation).mockReturnValue({
      search: '',
    } as any);

    render(<LinkWithQueryParams to="/target">Click</LinkWithQueryParams>);

    const link = screen.getByRole('link', { name: /click/i });
    expect(link).toBeInTheDocument();
    expect(link.getAttribute('href')).toBe('/target');
  });
});
