import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecResourcePartner } from '@/pages/rec-resource-page/components/RecResourcePartnersSection/RecResourcePartner';
import { useGetPartnerLocations } from '@/services/hooks/recreation-resource-admin/useGetPartnerLocationsByClientId';
import { AgreementHolderClientPublicViewDto } from '@/services/recreation-resource-admin/models/AgreementHolderClientPublicViewDto';

// Mock the custom hook
vi.mock(
  '@/services/hooks/recreation-resource-admin/useGetPartnerLocationsByClientId',
  () => ({
    useGetPartnerLocations: vi.fn(),
  }),
);

describe('RecResourcePartner', () => {
  const mockMutateAsync = vi.fn();

  const mockPartner: AgreementHolderClientPublicViewDto = {
    clientNumber: '00123456',
    clientName: 'acme corporation',
    clientStatusDescription: 'Active',
    clientTypeDescription: 'Society',
    agreementStartDate: '2023-01-01T00:00:00Z',
    agreementEndDate: '2025-12-31T00:00:00Z',
  };

  const mockLocations = [
    {
      clientNumber: '00123456',
      email: 'contact@acme.com',
      businessPhone: '5555550199',
      address1: '123 main st',
      city: 'vancouver',
      province: 'BC',
      postalCode: 'V6B 2W9',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation
    vi.mocked(useGetPartnerLocations).mockReturnValue({
      mutateAsync: mockMutateAsync,
      data: undefined,
      isPending: false,
    } as any);
  });

  it('should render partner summary information correctly', () => {
    render(<RecResourcePartner partner={mockPartner} />);

    expect(screen.getByText('00123456')).toBeInTheDocument();
    expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Society')).toBeInTheDocument();
    expect(screen.getByText('Start date')).toBeInTheDocument();
    expect(screen.getByText('End date')).toBeInTheDocument();
    expect(screen.getByText('Show additional information')).toBeInTheDocument();
  });

  it('should toggle additional information and trigger fetchLocations on expand', async () => {
    render(<RecResourcePartner partner={mockPartner} />);

    const toggleButton = screen.getByRole('button', {
      name: /additional information/i,
    });

    // Initial state: details hidden
    expect(screen.queryByText('Contact Information')).not.toBeInTheDocument();

    // Expand section
    fireEvent.click(toggleButton);

    expect(screen.getByText('Hide additional information')).toBeInTheDocument();
    expect(screen.getByText('Contact Information')).toBeInTheDocument();
    expect(mockMutateAsync).toHaveBeenCalledWith('00123456');
  });

  it('should display loading state when locations query is pending', () => {
    vi.mocked(useGetPartnerLocations).mockReturnValue({
      mutateAsync: mockMutateAsync,
      data: undefined,
      isPending: true,
    } as any);

    render(<RecResourcePartner partner={mockPartner} />);

    const toggleButton = screen.getByRole('button', {
      name: /additional information/i,
    });
    fireEvent.click(toggleButton);

    expect(screen.getByText('Loading locations...')).toBeInTheDocument();
  });

  it('should render partner locations and CopyButton components when loaded', () => {
    vi.mocked(useGetPartnerLocations).mockReturnValue({
      mutateAsync: mockMutateAsync,
      data: mockLocations,
      isPending: false,
    } as any);

    render(<RecResourcePartner partner={mockPartner} />);

    const toggleButton = screen.getByRole('button', {
      name: /additional information/i,
    });
    fireEvent.click(toggleButton);

    // Verify contact details
    expect(screen.getByText('contact@acme.com')).toBeInTheDocument();
    expect(screen.getByText('555-555-0199')).toBeInTheDocument();

    // Verify formatted address and city capitalization
    expect(
      screen.getAllByText('123 Main St, Vancouver')[0],
    ).toBeInTheDocument();
    expect(screen.getAllByText('BC, V6B 2W9')[0]).toBeInTheDocument();
  });

  it('should not re-fetch locations when collapsing and expanding if data already exists', async () => {
    vi.mocked(useGetPartnerLocations).mockReturnValue({
      mutateAsync: mockMutateAsync,
      data: mockLocations,
      isPending: false,
    } as any);

    render(<RecResourcePartner partner={mockPartner} />);

    const toggleButton = screen.getByRole('button', {
      name: /additional information/i,
    });

    // Expand
    fireEvent.click(toggleButton);
    // Collapse
    fireEvent.click(toggleButton);
    // Expand again
    fireEvent.click(toggleButton);

    // mutateAsync should not be called because locations data is already present
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });
});
