import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import BreadCrumbs from './BreadCrumbs';

describe('BreadCrumbs', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('renders breadcrumb with default links and current path', () => {
    render(
      <MemoryRouter initialEntries={['/resource/REC123']}>
        <Routes>
          <Route path="/resource/:id" element={<BreadCrumbs />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByAltText('Home')).toBeInTheDocument();
    expect(screen.getAllByAltText('chevron icon')).toHaveLength(2);
    expect(screen.getByText('Find a site or trail')).toHaveAttribute(
      'href',
      '/search',
    );
    expect(screen.getByText('REC123')).toBeInTheDocument();
  });

  it('appends lastSearch from sessionStorage to search link if available', () => {
    sessionStorage.setItem('lastSearch', '?filter=abc');

    render(
      <MemoryRouter initialEntries={['/resource/REC456']}>
        <Routes>
          <Route path="/resource/:id" element={<BreadCrumbs />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Find a site or trail')).toHaveAttribute(
      'href',
      '/search?filter=abc',
    );
    expect(screen.getByText('REC456')).toBeInTheDocument();
  });
});
