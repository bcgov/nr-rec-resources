import { RecResourceFeesPage } from '@/pages/rec-resource-page/RecResourceFeesPage';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/pages/rec-resource-page/components/RecResourceFeesSection', () => ({
  RecResourceFeesSection: () => (
    <div data-testid="rec-resource-fees-section">
      Mock RecResourceFeesSection
    </div>
  ),
}));

describe('RecResourceFeesPage', () => {
  it('renders the RecResourceFeesSection component with fees', () => {
    render(<RecResourceFeesPage />);

    expect(screen.getByTestId('rec-resource-fees-section')).toBeInTheDocument();
  });
});
