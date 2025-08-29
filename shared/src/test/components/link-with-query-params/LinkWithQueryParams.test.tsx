import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { LinkWithQueryParams } from '../../../components/link-with-query-params/LinkWithQueryParams';

describe('LinkWithQueryParams', () => {
  it('appends current location.search to string `to`', () => {
    render(
      <MemoryRouter initialEntries={['/somewhere?flag=true']}>
        <LinkWithQueryParams to="/target">Click</LinkWithQueryParams>
      </MemoryRouter>,
    );

    const link = screen.getByRole('link', { name: /click/i });
    expect(link).toBeInTheDocument();
    // href will include the search string
    expect(link.getAttribute('href')).toBe('/target?flag=true');
  });

  it('overwrites object `to` search with current location.search', () => {
    render(
      <MemoryRouter initialEntries={['/somewhere?x=1']}>
        <LinkWithQueryParams to={{ pathname: '/path', search: '?ignored=1' }}>
          Go
        </LinkWithQueryParams>
      </MemoryRouter>,
    );

    const link = screen.getByRole('link', { name: /go/i });
    expect(link).toBeInTheDocument();
    expect(link.getAttribute('href')).toBe('/path?x=1');
  });

  it('passes through other Link props like className', () => {
    render(
      <MemoryRouter initialEntries={['/base?c=1']}>
        <LinkWithQueryParams to="/abc" className="my-link">
          Label
        </LinkWithQueryParams>
      </MemoryRouter>,
    );

    const link = screen.getByRole('link', { name: /label/i });
    expect(link).toHaveClass('my-link');
    expect(link.getAttribute('href')).toBe('/abc?c=1');
  });
});
