import { RecResourceFeesPage } from '@/pages/rec-resource-page/RecResourceFeesPage';
import { useLoaderData } from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/pages/rec-resource-page/components/RecResourceFeesSection', () => ({
  RecResourceFeesSection: () => (
    <div data-testid="rec-resource-fees-section">
      Mock RecResourceFeesSection
    </div>
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
  it('renders the Fees heading', () => {
    render(<RecResourceFeesPage />);

    expect(screen.getByRole('heading', { name: 'Fees' })).toBeInTheDocument();
  });

  it('renders the RecResourceFeesSection component with fees', () => {
    render(<RecResourceFeesPage />);

    expect(screen.getByTestId('rec-resource-fees-section')).toBeInTheDocument();
  });
});
