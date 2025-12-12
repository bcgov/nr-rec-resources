import { RecResourceFeesPage } from '@/pages/rec-resource-page/RecResourceFeesPage';
import { useLoaderData } from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useLoaderData: vi.fn(),
  };
});

vi.mock('@/pages/rec-resource-page/components/RecResourceFeesSection', () => ({
  RecResourceFeesSection: ({ fees }: { fees: any[] }) => (
    <div data-testid="rec-resource-fees-section">{fees?.length || 0} fees</div>
  ),
}));

const mockFees = [
  {
    fee_amount: 15,
    recreation_fee_code: 'D',
    fee_type_description: 'Day use',
  },
  {
    fee_amount: 20,
    recreation_fee_code: 'C',
    fee_type_description: 'Camping',
  },
];

describe('RecResourceFeesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useLoaderData).mockReturnValue({
      fees: mockFees,
    } as any);
  });

  it('renders the Fees heading', () => {
    render(<RecResourceFeesPage />);

    expect(screen.getByRole('heading', { name: 'Fees' })).toBeInTheDocument();
  });

  it('renders the RecResourceFeesSection component with fees', () => {
    render(<RecResourceFeesPage />);

    expect(screen.getByTestId('rec-resource-fees-section')).toBeInTheDocument();
    expect(screen.getByText('2 fees')).toBeInTheDocument();
  });

  it('renders RecResourceFeesSection with empty fees array', () => {
    vi.mocked(useLoaderData).mockReturnValue({
      fees: [],
    } as any);

    render(<RecResourceFeesPage />);

    expect(screen.getByTestId('rec-resource-fees-section')).toBeInTheDocument();
    expect(screen.getByText('0 fees')).toBeInTheDocument();
  });
});
