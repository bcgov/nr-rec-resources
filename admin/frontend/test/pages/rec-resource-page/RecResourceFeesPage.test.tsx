import { RecResourceFeesPage } from '@/pages/rec-resource-page/RecResourceFeesPage';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@tanstack/react-router', () => ({
  useParams: vi.fn(() => ({ id: 'REC1222' })),
}));

vi.mock('@/pages/rec-resource-page/components/RecResourceFeesSection', () => ({
  RecResourceFeesSection: ({ recResourceId }: { recResourceId: string }) => (
    <div data-testid="rec-resource-fees-section">
      Mock RecResourceFeesSection for {recResourceId}
    </div>
  ),
}));

describe('RecResourceFeesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the Fees heading', () => {
    render(<RecResourceFeesPage />);

    expect(screen.getByRole('heading', { name: 'Fees' })).toBeInTheDocument();
  });

  it('renders the RecResourceFeesSection component', () => {
    render(<RecResourceFeesPage />);

    expect(screen.getByTestId('rec-resource-fees-section')).toBeInTheDocument();
    expect(
      screen.getByText('Mock RecResourceFeesSection for REC1222'),
    ).toBeInTheDocument();
  });

  it('passes correct recResourceId to RecResourceFeesSection', () => {
    render(<RecResourceFeesPage />);

    const section = screen.getByTestId('rec-resource-fees-section');
    expect(section).toHaveTextContent('REC1222');
  });
});
