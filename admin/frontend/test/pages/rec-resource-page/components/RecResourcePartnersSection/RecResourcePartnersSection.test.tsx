import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RecResourcePartnersSection } from '@/pages/rec-resource-page/components/RecResourcePartnersSection/RecResourcePartnersSection';
import { Route } from '@/routes/rec-resource/$id/partners';
import { useGetPartners } from '@/services/hooks/recreation-resource-admin/useGetPartners';

// 1. Mock child component using the EXACT module path used by the component
vi.mock(
  '@/pages/rec-resource-page/components/RecResourcePartnersSection/RecResourcePartnersContent',
  () => ({
    RecResourcePartnersContent: vi.fn(({ partners, recResourceId }: any) => (
      <div data-testid="partners-content">
        <span data-testid="resource-id">{recResourceId ?? 'undefined'}</span>
        <span data-testid="partners-count">{partners?.length ?? 0}</span>
      </div>
    )),
  }),
);

// 2. Mock external dependencies
vi.mock('@/routes/rec-resource/$id/partners', () => ({
  Route: {
    useParams: vi.fn(),
  },
}));

vi.mock('@/services/hooks/recreation-resource-admin/useGetPartners', () => ({
  useGetPartners: vi.fn(),
}));

describe('RecResourcePartnersSection', () => {
  it('renders correctly with params and fetched partners data', () => {
    const mockId = '123';
    const mockPartners = [{ id: 'p1', name: 'Partner 1' }];

    vi.mocked(Route.useParams).mockReturnValue({ id: mockId } as any);
    vi.mocked(useGetPartners).mockReturnValue({ data: mockPartners } as any);

    render(<RecResourcePartnersSection />);

    expect(useGetPartners).toHaveBeenCalledWith(mockId);
    expect(screen.getByTestId('resource-id')).toHaveTextContent('123');
    expect(screen.getByTestId('partners-count')).toHaveTextContent('1');
  });

  it('handles undefined params and defaults partners to an empty array', () => {
    vi.mocked(Route.useParams).mockReturnValue(undefined as any);
    vi.mocked(useGetPartners).mockReturnValue({ data: undefined } as any);

    render(<RecResourcePartnersSection />);

    expect(useGetPartners).toHaveBeenCalledWith(undefined);
    expect(screen.getByTestId('resource-id')).toHaveTextContent('undefined');
    expect(screen.getByTestId('partners-count')).toHaveTextContent('0');
  });
});
