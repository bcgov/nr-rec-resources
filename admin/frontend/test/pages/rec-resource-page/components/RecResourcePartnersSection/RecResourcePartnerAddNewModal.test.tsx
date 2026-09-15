import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecResourcePartnerAddNewModal } from '@/pages/rec-resource-page/components/RecResourcePartnersSection/RecResourcePartnerAddNewModal';

// --- Mocks ---

const mockFetchPartnerInfo = vi.fn();
const mockFetchPartnerLocations = vi.fn();
const mockMutate = vi.fn();
const mockReset = vi.fn();

let mockIsPending = false;
let mockIsLocationsPending = false;
let mockIsPartnerInfoError = false;
let mockPartnerInfo: any = null;
let mockPartnerLocations: any = null;

vi.mock('@/services/hooks', () => ({
  useGetPartnerByClientId: () => ({
    mutateAsync: mockFetchPartnerInfo,
    data: mockPartnerInfo,
    isError: mockIsPartnerInfoError,
    isPending: mockIsPending,
    reset: mockReset,
  }),
}));

vi.mock(
  '@/services/hooks/recreation-resource-admin/useGetPartnerLocationsByClientId',
  () => ({
    useGetPartnerLocations: () => ({
      mutateAsync: mockFetchPartnerLocations,
      data: mockPartnerLocations,
      isPending: mockIsLocationsPending,
    }),
  }),
);

vi.mock(
  '@/services/hooks/recreation-resource-admin/useCreateRecreationResourceAgreementHolder',
  () => ({
    useCreateRecreationResourceAgreementHolder: () => ({
      mutate: mockMutate,
    }),
  }),
);

vi.mock('@shared/utils/capitalizeWords', () => ({
  capitalizeWords: (val: string) => val?.toUpperCase() || '',
}));

vi.mock('./helpers', () => ({
  formatPhoneNumber: (phone: string) => `Formatted: ${phone}`,
}));

vi.mock('@/components', () => ({
  CustomButton: ({ children, onClick, disabled, variant }: any) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant}>
      {children}
    </button>
  ),
}));

describe('RecResourcePartnerAddNewModal', () => {
  const defaultProps = {
    show: true,
    rec_resource_id: 'rec-123',
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsPending = false;
    mockIsLocationsPending = false;
    mockIsPartnerInfoError = false;
    mockPartnerInfo = {
      clientName: 'acme corp',
      clientTypeDescription: 'business',
    };
    mockPartnerLocations = [
      {
        email: 'info@acme.com',
        businessPhone: '1234567890',
        address1: '123 main st',
        city: 'vancouver',
        province: 'BC',
        postalCode: 'V6B 1A1',
      },
    ];
  });

  // Helper to quickly advance to step 1
  const advanceToStep1 = async () => {
    mockFetchPartnerInfo.mockResolvedValueOnce({});
    mockFetchPartnerLocations.mockResolvedValueOnce({});
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    await waitFor(() => {
      expect(screen.getByText(/Partner Information/i)).toBeInTheDocument();
    });
  };

  it('renders Step 0 initially when shown', () => {
    render(<RecResourcePartnerAddNewModal {...defaultProps} />);
    expect(screen.getByText('Add new partner')).toBeInTheDocument();
    expect(screen.getByLabelText(/CLIENT #/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument();
  });

  it('handles client number change in Step 0', () => {
    render(<RecResourcePartnerAddNewModal {...defaultProps} />);
    const input = screen.getByLabelText(/CLIENT #/i) as HTMLInputElement;

    fireEvent.change(input, { target: { value: '999999' } });

    expect(mockReset).toHaveBeenCalled();
    expect(input.value).toBe('999999');
  });

  it('navigates from Step 0 to Step 1 on Next click', async () => {
    render(<RecResourcePartnerAddNewModal {...defaultProps} />);

    await advanceToStep1();

    expect(mockFetchPartnerInfo).toHaveBeenCalledWith('00167392');
    expect(mockFetchPartnerLocations).toHaveBeenCalledWith('00167392');
    expect(
      screen.getByRole('button', { name: /Add Partner/i }),
    ).toBeInTheDocument();
  });

  it('displays partner error message when isPartnerInfoError is true', () => {
    mockIsPartnerInfoError = true;
    render(<RecResourcePartnerAddNewModal {...defaultProps} />);

    expect(
      screen.getByText(/Error loading partner information/i),
    ).toBeInTheDocument();

    // Verify Add Partner button is disabled when in error on step 1
    // We force step 1 rendering by mocking state if needed, or by Next click
  });

  it('renders loading indicators during pendings in Step 1', async () => {
    mockIsPending = true;
    mockIsLocationsPending = true;
    render(<RecResourcePartnerAddNewModal {...defaultProps} />);

    await advanceToStep1();

    expect(screen.getByText('Loading information...')).toBeInTheDocument();
  });

  it('renders fallback values ("N/A") when partner info/location details are missing', async () => {
    mockPartnerInfo = { clientName: null, clientTypeDescription: null };
    mockPartnerLocations = [
      {
        email: null,
        businessPhone: null,
        address1: null,
        city: null,
        province: 'BC',
        postalCode: 'V6B 1A1',
      },
    ];

    render(<RecResourcePartnerAddNewModal {...defaultProps} />);
    await advanceToStep1();

    const nas = screen.getAllByText('N/A');
    expect(nas.length).toBeGreaterThan(0);
  });

  it('renders locations loading text when isLocationsPending is true', async () => {
    mockIsLocationsPending = true;
    render(<RecResourcePartnerAddNewModal {...defaultProps} />);
    await advanceToStep1();

    expect(screen.getByText('Loading locations...')).toBeInTheDocument();
  });

  it('validates empty start and end dates', async () => {
    render(<RecResourcePartnerAddNewModal {...defaultProps} />);
    await advanceToStep1();

    fireEvent.click(screen.getByRole('button', { name: /Add Partner/i }));

    expect(
      screen.getByText('Agreement start date is required.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Agreement end date is required.'),
    ).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('validates when only start date is provided', async () => {
    render(<RecResourcePartnerAddNewModal {...defaultProps} />);
    await advanceToStep1();

    const startDateInput = screen.getByLabelText(/Agreement start date/i);
    fireEvent.change(startDateInput, { target: { value: '2026-01-01' } });

    fireEvent.click(screen.getByRole('button', { name: /Add Partner/i }));

    expect(
      screen.getByText('Agreement end date is required.'),
    ).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('validates end date earlier than today', async () => {
    render(<RecResourcePartnerAddNewModal {...defaultProps} />);
    await advanceToStep1();

    const startDateInput = screen.getByLabelText(/Agreement start date/i);
    const endDateInput = screen.getByLabelText(/Agreement end date/i);

    fireEvent.change(startDateInput, { target: { value: '2000-01-01' } });
    fireEvent.change(endDateInput, { target: { value: '2000-01-02' } });

    fireEvent.click(screen.getByRole('button', { name: /Add Partner/i }));

    expect(
      screen.getByText('End date cannot be earlier than today.'),
    ).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('validates start date after end date', async () => {
    render(<RecResourcePartnerAddNewModal {...defaultProps} />);
    await advanceToStep1();

    const startDateInput = screen.getByLabelText(/Agreement start date/i);
    const endDateInput = screen.getByLabelText(/Agreement end date/i);

    const futureDate1 = '2099-12-31';
    const futureDate2 = '2099-12-01';

    fireEvent.change(startDateInput, { target: { value: futureDate1 } });
    fireEvent.change(endDateInput, { target: { value: futureDate2 } });

    fireEvent.click(screen.getByRole('button', { name: /Add Partner/i }));

    expect(
      screen.getByText('Start date cannot be after the end date.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('End date cannot be before the start date.'),
    ).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('clears errors when input date changes', async () => {
    render(<RecResourcePartnerAddNewModal {...defaultProps} />);
    await advanceToStep1();

    fireEvent.click(screen.getByRole('button', { name: /Add Partner/i }));
    expect(
      screen.getByText('Agreement start date is required.'),
    ).toBeInTheDocument();

    const startDateInput = screen.getByLabelText(/Agreement start date/i);
    fireEvent.change(startDateInput, { target: { value: '2026-05-01' } });

    expect(
      screen.queryByText('Agreement start date is required.'),
    ).not.toBeInTheDocument();
  });

  it('submits successfully when validation passes and executes onSuccess callback', async () => {
    render(<RecResourcePartnerAddNewModal {...defaultProps} />);
    await advanceToStep1();

    const startDateInput = screen.getByLabelText(/Agreement start date/i);
    const endDateInput = screen.getByLabelText(/Agreement end date/i);

    const futureStart = '2099-01-01';
    const futureEnd = '2099-12-31';

    fireEvent.change(startDateInput, { target: { value: futureStart } });
    fireEvent.change(endDateInput, { target: { value: futureEnd } });

    fireEvent.click(screen.getByRole('button', { name: /Add Partner/i }));

    expect(mockMutate).toHaveBeenCalledWith(
      {
        recResourceId: 'rec-123',
        partner: {
          clientNumber: '00167392',
          agreementStartDate: futureStart,
          agreementEndDate: futureEnd,
        },
      },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );

    // Simulate onSuccess call
    const options = mockMutate.mock.calls[0][1];
    options.onSuccess();

    expect(mockReset).toHaveBeenCalled();
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it('calls clearAndCancel when Modal onHide or Cancel button is clicked', async () => {
    render(<RecResourcePartnerAddNewModal {...defaultProps} />);
    await advanceToStep1();

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(mockReset).toHaveBeenCalled();
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });
});
