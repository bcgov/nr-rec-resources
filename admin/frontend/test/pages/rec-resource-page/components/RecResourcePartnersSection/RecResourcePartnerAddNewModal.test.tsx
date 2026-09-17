import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecResourcePartnerAddNewModal } from '@/pages/rec-resource-page/components/RecResourcePartnersSection/RecResourcePartnerAddNewModal';

// --- Mocks ---

const mockFetchPartnerInfo = vi.fn();
const mockFetchPartnerLocations = vi.fn();
const mockMutate = vi.fn();
const mockResetPartnerInfo = vi.fn();

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
    reset: mockResetPartnerInfo,
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

  const VALID_CLIENT_NUM = '12345678';

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

  const advanceToStep1 = async (clientNum = VALID_CLIENT_NUM) => {
    mockFetchPartnerInfo.mockResolvedValueOnce({});
    mockFetchPartnerLocations.mockResolvedValueOnce({});

    const input = screen.getByLabelText(/CLIENT #/i);
    fireEvent.change(input, { target: { value: clientNum } });

    fireEvent.click(screen.getByRole('button', { name: /Next/i }));

    await waitFor(() => {
      expect(screen.getByText(/Partner Information/i)).toBeInTheDocument();
    });
  };

  it('renders Step 0 initially when modal is shown', () => {
    render(<RecResourcePartnerAddNewModal {...defaultProps} />);

    expect(screen.getByText('Add new partner')).toBeInTheDocument();
    expect(screen.getByText('Partner details')).toBeInTheDocument();
    expect(screen.getByLabelText(/CLIENT #/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Cancel/i }),
    ).not.toBeInTheDocument();
  });

  it('shows validation error on Step 0 if client number is not 8 characters', () => {
    render(<RecResourcePartnerAddNewModal {...defaultProps} />);

    const input = screen.getByLabelText(/CLIENT #/i);
    fireEvent.change(input, { target: { value: '12345' } });

    fireEvent.click(screen.getByRole('button', { name: /Next/i }));

    expect(
      screen.getByText('Client # needs to have 8 characters.'),
    ).toBeInTheDocument();
    expect(mockFetchPartnerInfo).not.toHaveBeenCalled();
  });

  it('clears client number error when user enters an 8-character string', () => {
    render(<RecResourcePartnerAddNewModal {...defaultProps} />);

    const input = screen.getByLabelText(/CLIENT #/i);

    // Trigger error first
    fireEvent.change(input, { target: { value: '12345' } });
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    expect(
      screen.getByText('Client # needs to have 8 characters.'),
    ).toBeInTheDocument();

    // Type 8 characters to trigger clear condition
    fireEvent.change(input, { target: { value: VALID_CLIENT_NUM } });
    expect(
      screen.queryByText('Client # needs to have 8 characters.'),
    ).not.toBeInTheDocument();
    expect(mockResetPartnerInfo).toHaveBeenCalled();
  });

  it('successfully transitions from Step 0 to Step 1 upon valid Next click', async () => {
    render(<RecResourcePartnerAddNewModal {...defaultProps} />);

    await advanceToStep1(VALID_CLIENT_NUM);

    expect(mockFetchPartnerInfo).toHaveBeenCalledWith(VALID_CLIENT_NUM);
    expect(mockFetchPartnerLocations).toHaveBeenCalledWith(VALID_CLIENT_NUM);
    expect(
      screen.getByRole('button', { name: /Add Partner/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
  });

  it('renders location loading indicator when only locations query is pending', async () => {
    mockIsLocationsPending = true;

    render(<RecResourcePartnerAddNewModal {...defaultProps} />);
    await advanceToStep1();

    expect(screen.getByText('Loading locations...')).toBeInTheDocument();
  });

  it('displays partner error message when isPartnerInfoError is true', () => {
    mockIsPartnerInfoError = true;

    render(<RecResourcePartnerAddNewModal {...defaultProps} />);

    expect(
      screen.getByText(/Error loading partner information/i),
    ).toBeInTheDocument();
  });

  it('renders fallbacks ("N/A") when partner info/location properties are missing', async () => {
    mockPartnerInfo = { clientName: null, clientTypeDescription: null };
    mockPartnerLocations = [
      {
        email: null,
        businessPhone: null,
        address1: null,
        city: null,
        province: null,
        postalCode: null,
      },
    ];

    render(<RecResourcePartnerAddNewModal {...defaultProps} />);
    await advanceToStep1();

    const nas = screen.getAllByText('N/A');
    expect(nas.length).toBeGreaterThan(0);
  });

  it('validates empty start and end dates on Step 1 submission', async () => {
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

  it('validates start date positioned after end date', async () => {
    render(<RecResourcePartnerAddNewModal {...defaultProps} />);
    await advanceToStep1();

    const startDateInput = screen.getByLabelText(/Agreement start date/i);
    const endDateInput = screen.getByLabelText(/Agreement end date/i);

    fireEvent.change(startDateInput, { target: { value: '2099-12-31' } });
    fireEvent.change(endDateInput, { target: { value: '2099-12-01' } });

    fireEvent.click(screen.getByRole('button', { name: /Add Partner/i }));

    expect(
      screen.getByText('Start date cannot be after the end date.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('End date cannot be before the start date.'),
    ).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('clears date validation errors on input change', async () => {
    render(<RecResourcePartnerAddNewModal {...defaultProps} />);
    await advanceToStep1();

    fireEvent.click(screen.getByRole('button', { name: /Add Partner/i }));
    expect(
      screen.getByText('Agreement start date is required.'),
    ).toBeInTheDocument();

    const startDateInput = screen.getByLabelText(/Agreement start date/i);
    fireEvent.change(startDateInput, { target: { value: '2099-01-01' } });

    expect(
      screen.queryByText('Agreement start date is required.'),
    ).not.toBeInTheDocument();
  });

  it('submits payload successfully when validation passes and executes onSuccess handler', async () => {
    render(<RecResourcePartnerAddNewModal {...defaultProps} />);
    await advanceToStep1();

    const startDateInput = screen.getByLabelText(/Agreement start date/i);
    const endDateInput = screen.getByLabelText(/Agreement end date/i);

    fireEvent.change(startDateInput, { target: { value: '2099-01-01' } });
    fireEvent.change(endDateInput, { target: { value: '2099-12-31' } });

    fireEvent.click(screen.getByRole('button', { name: /Add Partner/i }));

    expect(mockMutate).toHaveBeenCalledWith(
      {
        recResourceId: 'rec-123',
        partner: {
          clientNumber: VALID_CLIENT_NUM,
          agreementStartDate: '2099-01-01',
          agreementEndDate: '2099-12-31',
        },
      },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );

    // Trigger onSuccess callback to test reset/close sequence
    const mutationOptions = mockMutate.mock.calls[0][1];
    mutationOptions.onSuccess();

    expect(mockResetPartnerInfo).toHaveBeenCalled();
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it('resets state and triggers onCancel when Cancel button is clicked on Step 1', async () => {
    render(<RecResourcePartnerAddNewModal {...defaultProps} />);
    await advanceToStep1();

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(mockResetPartnerInfo).toHaveBeenCalled();
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });
});
