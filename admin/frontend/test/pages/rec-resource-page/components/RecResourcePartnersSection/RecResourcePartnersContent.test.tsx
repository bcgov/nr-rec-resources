import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RecResourcePartnersContent } from '@/pages/rec-resource-page/components/RecResourcePartnersSection/RecResourcePartnersContent';
import { AgreementHolderClientPublicViewDto } from '@/services/recreation-resource-admin/models/AgreementHolderClientPublicViewDto';

// Mock the hook that triggers the AuthContext dependency
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

// Mock @tanstack/react-router Link component
vi.mock('@tanstack/react-router', () => ({
  Link: ({
    to,
    children,
    className,
  }: {
    to: string;
    children: React.ReactNode;
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

describe('RecResourcePartnersContent', () => {
  const mockPartners: AgreementHolderClientPublicViewDto[] = [
    {
      clientNumber: '001',
      clientName: 'Partner One',
      clientTypeDescription: 'Society',
    },
    {
      clientNumber: '002',
      clientName: 'Partner Two',
      clientTypeDescription: 'Business',
    },
  ];

  it('should render section header and partner list correctly', () => {
    render(<RecResourcePartnersContent partners={mockPartners} />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'Active Partners' }),
    ).toBeInTheDocument();
    expect(screen.getByText('001')).toBeInTheDocument();
    expect(screen.getByText('Partner One')).toBeInTheDocument();
    expect(screen.getByText('002')).toBeInTheDocument();
    expect(screen.getByText('Partner Two')).toBeInTheDocument();
  });

  it('should not render "Add New" or "Edit" buttons when recResourceId is not provided', () => {
    render(<RecResourcePartnersContent partners={mockPartners} />);

    expect(
      screen.queryByRole('link', { name: 'Add New' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Edit' }),
    ).not.toBeInTheDocument();
  });

  it('should render "Add New" and "Edit" buttons with correct hrefs when recResourceId is provided', () => {
    const recResourceId = '12345';
    render(
      <RecResourcePartnersContent
        partners={mockPartners}
        recResourceId={recResourceId}
      />,
    );

    const addNewLink = screen.getByRole('link', { name: 'Add New' });
    const editLink = screen.getByRole('link', { name: 'Edit' });

    expect(addNewLink).toBeInTheDocument();
    expect(addNewLink).toHaveAttribute('href', '/rec-resource/12345/fees/add');

    expect(editLink).toBeInTheDocument();
    expect(editLink).toHaveAttribute('href', '/rec-resource/12345/fees/add');
  });

  it('should render gracefully when partners array is empty', () => {
    render(<RecResourcePartnersContent partners={[]} />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'Active Partners' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('001')).not.toBeInTheDocument();
  });
});
