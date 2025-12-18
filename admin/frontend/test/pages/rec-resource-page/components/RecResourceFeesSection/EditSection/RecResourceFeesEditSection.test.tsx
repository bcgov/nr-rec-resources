import { RecResourceFeesEditSection } from '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/RecResourceFeesEditSection';
import { Route } from '@/routes/rec-resource/$id/fees/$feeId/edit';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('@shared/hooks', () => ({
  useNavigateWithQueryParams: () => ({ navigate: vi.fn() }),
}));

vi.mock('@/contexts/feature-flags', () => ({
  FeatureFlagGuard: ({ children }: any) => <>{children}</>,
}));

const mockFees = [
  {
    fee_id: 1,
    fee_amount: 15,
    fee_start_date: new Date('2024-05-15'),
    fee_end_date: new Date('2024-10-15'),
    recreation_fee_code: 'D',
    fee_type_description: 'Day use',
    monday_ind: 'Y',
    tuesday_ind: 'Y',
    wednesday_ind: 'Y',
    thursday_ind: 'Y',
    friday_ind: 'Y',
    saturday_ind: 'Y',
    sunday_ind: 'N',
    fee_start_date_readable_utc: 'May 15, 2024',
    fee_end_date_readable_utc: 'October 15, 2024',
  },
];

vi.mock('@/routes/rec-resource/$id/fees/$feeId/edit', () => {
  return {
    Route: {
      useLoaderData: vi.fn(() => ({
        fees: mockFees,
      })),
      useParams: vi.fn(() => ({
        id: 'test-id',
        feeId: '1',
      })),
    },
  };
});

vi.mock('@tanstack/react-query', async () => {
  const actual: any = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: vi.fn(({ initialData }: any) => ({ data: initialData })),
  };
});

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceFeesSection/RecResourceFeesTable',
  () => ({
    RecResourceFeesTable: ({ fees }: any) => (
      <div data-testid="fees-table">{fees.length} fees</div>
    ),
  }),
);

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/RecResourceFeeFormModal',
  () => ({
    RecResourceFeeFormModal: ({ mode, initialFee }: any) => (
      <div data-testid="fee-form-modal">
        {mode === 'create' ? 'Add Fee' : 'Edit Fee'}
        {mode === 'edit' && !initialFee ? ' - Fee not found.' : null}
      </div>
    ),
  }),
);

vi.mock('@shared/components/link-with-query-params', () => ({
  LinkWithQueryParams: ({ to, children, className }: any) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

describe('RecResourceFeesEditSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(Route.useLoaderData).mockReturnValue({
      fees: mockFees,
    });
    vi.mocked(Route.useParams).mockReturnValue({
      id: 'test-id',
      feeId: '1',
    });
  });

  it('renders Edit Fee modal', () => {
    render(<RecResourceFeesEditSection />);

    expect(screen.getByText('Edit Fee')).toBeInTheDocument();
  });

  it('renders RecResourceFeesTable with fees data', () => {
    render(<RecResourceFeesEditSection />);

    const feesTable = screen.getByTestId('fees-table');
    expect(feesTable).toBeInTheDocument();
    expect(feesTable).toHaveTextContent('1 fees');
  });

  it('handles empty fees array', () => {
    vi.mocked(Route.useLoaderData).mockReturnValueOnce({
      fees: [],
    });

    render(<RecResourceFeesEditSection />);

    const feesTable = screen.getByTestId('fees-table');
    expect(feesTable).toHaveTextContent('0 fees');
  });

  it('uses rec resource id from params in Add Fee link', () => {
    vi.mocked(Route.useParams).mockReturnValueOnce({
      id: 'REC999',
      feeId: '1',
    });

    render(<RecResourceFeesEditSection />);

    const addFeeLink = screen.getByRole('link', { name: /add fee/i });
    expect(addFeeLink).toHaveAttribute('href', '/rec-resource/REC999/fees/add');
  });
});
