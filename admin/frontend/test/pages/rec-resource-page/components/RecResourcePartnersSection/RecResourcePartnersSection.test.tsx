import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecResourcePartnersSection } from '@/pages/rec-resource-page/components/RecResourcePartnersSection/RecResourcePartnersSection';
import { useGetPartners } from '@/services/hooks/recreation-resource-admin/useGetPartners';
import { Route } from '@/routes/rec-resource/$id/partners';

// Mock TanStack Router Route hooks
vi.mock('@/routes/rec-resource/$id/partners', () => ({
  Route: {
    useLoaderData: vi.fn(),
    useParams: vi.fn(),
  },
}));

// Mock TanStack Router Link component
vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to,
    className,
  }: {
    children: React.ReactNode;
    to: string;
    className?: string;
  }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

// Mock route constants
vi.mock('@/constants/routes', () => ({
  ROUTE_PATHS: {
    REC_RESOURCE_FEES_ADD: '/rec-resource/$id/fees/add',
  },
}));

// Mock custom hook for partner query
vi.mock('@/services/hooks/recreation-resource-admin/useGetPartners', () => ({
  useGetPartners: vi.fn(),
}));

// Mock nested hook in RecResourcePartner that requires AuthContext
vi.mock(
  '@/services/hooks/recreation-resource-admin/useGetPartnerLocationsByClientId',
  () => ({
    useGetPartnerLocations: () => ({
      mutateAsync: vi.fn(),
      data: undefined,
      isPending: false,
    }),
  }),
);

describe('RecResourcePartnersSection', () => {
  const mockInitialPartners = [
    {
      clientNumber: '001',
      clientName: 'Initial Partner',
      clientTypeDescription: 'Society',
    },
  ];

  const mockUpdatedPartners = [
    {
      clientNumber: '001',
      clientName: 'Initial Partner',
      clientTypeDescription: 'Society',
    },
    {
      clientNumber: '002',
      clientName: 'New Partner',
      clientTypeDescription: 'Business',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(Route.useLoaderData).mockReturnValue({
      partnersInfo: mockInitialPartners,
    } as any);

    vi.mocked(Route.useParams).mockReturnValue({ id: 'rec-123' } as any);

    vi.mocked(useGetPartners).mockReturnValue({
      data: mockInitialPartners,
    } as any);
  });

  it('should render RecResourcePartnersContent with router parameters and hook data', () => {
    render(<RecResourcePartnersSection />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'Active Partners' }),
    ).toBeInTheDocument();
    expect(screen.getByText('001')).toBeInTheDocument();
    expect(screen.getByText('Initial Partner')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Add New' })).toHaveAttribute(
      'href',
      '/rec-resource/rec-123/fees/add',
    );
  });

  it('should pass initialPartners from loader data into useGetPartners hook', () => {
    render(<RecResourcePartnersSection />);

    expect(useGetPartners).toHaveBeenCalledWith('rec-123', {
      initialData: mockInitialPartners,
    });
  });

  it('should update rendered partners list when hook returns updated data', () => {
    vi.mocked(useGetPartners).mockReturnValue({
      data: mockUpdatedPartners,
    } as any);

    render(<RecResourcePartnersSection />);

    expect(screen.getByText('001')).toBeInTheDocument();
    expect(screen.getByText('Initial Partner')).toBeInTheDocument();
    expect(screen.getByText('002')).toBeInTheDocument();
    expect(screen.getByText('New Partner')).toBeInTheDocument();
  });

  it('should fallback to an empty array when useGetPartners returns undefined data', () => {
    vi.mocked(useGetPartners).mockReturnValue({
      data: undefined,
    } as any);

    render(<RecResourcePartnersSection />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'Active Partners' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('001')).not.toBeInTheDocument();
  });
});
