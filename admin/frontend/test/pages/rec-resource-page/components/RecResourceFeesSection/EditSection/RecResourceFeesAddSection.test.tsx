import { RecResourceFeesAddSection } from '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/RecResourceFeesAddSection';
import { Route } from '@/routes/rec-resource/$id/fees/add';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

const navigateMock = vi.fn();

vi.mock('@shared/hooks', () => ({
  useNavigateWithQueryParams: () => ({ navigate: navigateMock }),
}));

const mockFees = [{ fee_id: 1 } as any];

vi.mock('@/routes/rec-resource/$id/fees/add', () => ({
  Route: {
    useLoaderData: vi.fn(() => ({ fees: mockFees })),
    useParams: vi.fn(() => ({ id: 'REC123' })),
  },
}));

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceFeesSection/RecResourceFeesContent',
  () => ({
    RecResourceFeesContent: ({ fees, recResourceId }: any) => (
      <div data-testid="fees-content">
        {recResourceId} - {fees.length} fees
      </div>
    ),
  }),
);

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/RecResourceFeeFormModal',
  () => ({
    RecResourceFeeFormModal: ({ mode, onClose }: any) => (
      <div data-testid="fee-form-modal">
        {mode}
        <button type="button" onClick={onClose}>
          close
        </button>
      </div>
    ),
  }),
);

describe('RecResourceFeesAddSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigateMock.mockClear();
    vi.mocked(Route.useLoaderData).mockReturnValue({ fees: mockFees } as any);
    vi.mocked(Route.useParams).mockReturnValue({ id: 'REC123' } as any);
  });

  it('renders the fees background content', () => {
    render(<RecResourceFeesAddSection />);
    expect(screen.getByTestId('fees-content')).toHaveTextContent(
      'REC123 - 1 fees',
    );
  });

  it('renders the create modal', () => {
    render(<RecResourceFeesAddSection />);
    expect(screen.getByTestId('fee-form-modal')).toHaveTextContent('create');
  });

  it('navigates back to Fees on close', () => {
    render(<RecResourceFeesAddSection />);
    screen.getByRole('button', { name: 'close' }).click();

    expect(navigateMock).toHaveBeenCalledWith({
      to: '/rec-resource/$id/fees',
      params: { id: 'REC123' },
    });
  });
});
