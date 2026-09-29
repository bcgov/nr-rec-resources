import { RecResourcePartnersEditPage } from '@/pages/rec-resource-page/RecResourcePartnersEditPage';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

const { mockUseLoaderData, mockUseParams, mockUseGetPartners } = vi.hoisted(
  () => ({
    mockUseLoaderData: vi.fn(),
    mockUseParams: vi.fn(),
    mockUseGetPartners: vi.fn(),
  }),
);

vi.mock('@/routes/rec-resource/$id/partners/edit', () => ({
  Route: {
    useLoaderData: mockUseLoaderData,
    useParams: mockUseParams,
  },
}));

vi.mock('@/services/hooks/recreation-resource-admin/useGetPartners', () => ({
  useGetPartners: mockUseGetPartners,
}));

vi.mock(
  '@/pages/rec-resource-page/components/RecResourcePartnersSection',
  () => ({
    RecResourcePartnersEditSection: ({
      partners,
      recResourceId,
    }: {
      partners: unknown[];
      recResourceId: string;
    }) => (
      <div data-testid="edit-section" data-resource={recResourceId}>
        {partners.length} partners
      </div>
    ),
  }),
);

const loaderPartners = [{ agreement_holder_id: 1 }];

describe('RecResourcePartnersEditPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLoaderData.mockReturnValue({ partnersInfo: loaderPartners });
    mockUseParams.mockReturnValue({ id: 'REC0002' });
  });

  it('renders the edit section with the query data and resource id', () => {
    mockUseGetPartners.mockReturnValue({
      data: [{ agreement_holder_id: 1 }, { agreement_holder_id: 2 }],
    });

    render(<RecResourcePartnersEditPage />);

    const section = screen.getByTestId('edit-section');
    expect(section).toHaveTextContent('2 partners');
    expect(section).toHaveAttribute('data-resource', 'REC0002');
  });

  // The loader result seeds the query so the page paints without a fetch.
  it('seeds the query with the loader data', () => {
    mockUseGetPartners.mockReturnValue({ data: loaderPartners });

    render(<RecResourcePartnersEditPage />);

    expect(mockUseGetPartners).toHaveBeenCalledWith('REC0002', {
      initialData: loaderPartners,
    });
  });

  it('falls back to an empty list when the query has no data', () => {
    mockUseGetPartners.mockReturnValue({ data: undefined });

    render(<RecResourcePartnersEditPage />);

    expect(screen.getByTestId('edit-section')).toHaveTextContent('0 partners');
  });
});
