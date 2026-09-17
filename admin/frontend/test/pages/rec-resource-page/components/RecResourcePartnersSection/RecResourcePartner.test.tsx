import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecResourcePartner } from '@/pages/rec-resource-page/components/RecResourcePartnersSection/RecResourcePartner';
import { useGetPartnerLocations } from '@/services/hooks/recreation-resource-admin/useGetPartnerLocationsByClientId';
import { AgreementHolderClientPublicViewDto } from '@/services/recreation-resource-admin/models/AgreementHolderClientPublicViewDto';

const RECREATION_OPERATOR_HELP_TEXT =
  'A person or organization authorized under the';

const FOREST_RECREATION_REGULATION_URL =
  'https://www.bclaws.gov.bc.ca/civix/document/id/lc/statreg/16_2004#section22';

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
    agreementStartDate: '2023-01-01',
    agreementEndDate: '2099-12-31',
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
    expect(screen.getByText('Society')).toBeInTheDocument();
    expect(screen.getByText('Start date')).toBeInTheDocument();
    expect(screen.getByText('End date')).toBeInTheDocument();
    expect(screen.getByText('Show additional information')).toBeInTheDocument();
  });

  it('shows recreation operator pill when backend marks relationship as recreation operator', () => {
    render(
      <RecResourcePartner
        partner={{
          ...mockPartner,
          partner_relationship_type_code: 'RECREATION_OPERATOR',
        }}
      />,
    );

    const recreationOperatorLabel = screen.getByText('Recreation operator');

    expect(recreationOperatorLabel).toBeInTheDocument();
    expect(
      recreationOperatorLabel.closest('.recreation-operator-pill'),
    ).toHaveStyle({
      backgroundColor: 'rgb(199, 227, 253)',
      color: 'rgb(0, 51, 102)',
    });
    expect(screen.getByRole('button', { name: 'Help' })).toBeInTheDocument();
  });

  it('shows recreation operator help text when the help icon is clicked', async () => {
    render(
      <RecResourcePartner
        partner={{
          ...mockPartner,
          partner_relationship_type_code: 'RECREATION_OPERATOR',
        }}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Help' }));

    const tooltip = await screen.findByRole('tooltip');

    expect(tooltip).toHaveTextContent(RECREATION_OPERATOR_HELP_TEXT);
    expect(tooltip).toHaveTextContent(
      /to manage and operate at a recreation resource\. "Recreation Operator" is displayed when a volunteer partner is authorized to collect fees\./,
    );
    expect(
      screen.getByRole('link', { name: 'Forest Recreation Regulation' }),
    ).toHaveAttribute('href', FOREST_RECREATION_REGULATION_URL);
  });

  it('does not show recreation operator pill when backend marks as site operator', () => {
    render(
      <RecResourcePartner
        partner={{
          ...mockPartner,
          partner_relationship_type_code: 'SITE_OPERATOR',
        }}
      />,
    );

    expect(screen.queryByText('Recreation operator')).not.toBeInTheDocument();
  });

  it('does not show recreation operator pill when relationship code is missing', () => {
    render(<RecResourcePartner partner={mockPartner} />);

    expect(screen.queryByText('Recreation operator')).not.toBeInTheDocument();
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
