import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppRoutes from '@/routes/index';
import * as routerDom from 'react-router-dom';
import { SITE_TITLE } from '@/components/layout/PageTitle';
import * as recreationResourceQueries from '@/service/queries/recreation-resource';
import { mockSearchResultsData } from '@/components/search/test/mock-data';

vi.mock('@/service/queries/recreation-resource', () => ({
  useGetRecreationResourceById: vi.fn(),
  useSearchRecreationResourcesPaginated: vi.fn(),
}));
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useParams: vi.fn(),
  useNavigate: vi.fn(() => vi.fn()),
}));

describe('Page Titles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should set title for Landing Page', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(document.title).toBe(SITE_TITLE);
  });

  it('should set title for 404 Page', () => {
    render(
      <MemoryRouter initialEntries={['/non-existent-route']}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(document.title).toBe(`404 | ${SITE_TITLE}`);
  });

  it('should set title for Search Page', () => {
    const mockQueryResult = {
      data: mockSearchResultsData,
      fetchNextPage: vi.fn().mockResolvedValue({}),
      fetchPreviousPage: vi.fn(),
      hasNextPage: true,
      hasPreviousPage: false,
    };
    vi.spyOn(
      recreationResourceQueries,
      'useSearchRecreationResourcesPaginated',
    ).mockReturnValue(mockQueryResult as any);

    render(
      <MemoryRouter initialEntries={['/search']}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(document.title).toBe(`Find a site or trail | ${SITE_TITLE}`);
  });

  it('should set title dynamically for Rec Resource Page', () => {
    vi.spyOn(
      recreationResourceQueries,
      'useGetRecreationResourceById',
    ).mockReturnValue({
      // @ts-ignore
      data: {
        name: '0 K SNOWMOBILE PARKING LOT',
      },
    });
    vi.mocked(routerDom.useParams).mockReturnValue({ id: 'REC1234' });
    render(
      <MemoryRouter initialEntries={['/resource/123']}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(document.title).toBe(`0 K Snowmobile Parking Lot | ${SITE_TITLE}`);
  });
});
