import { RecResourcePartnersPage } from '@/pages/rec-resource-page/RecResourcePartnersPage';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock(
  '@/pages/rec-resource-page/components/RecResourcePartnersSection',
  () => ({
    RecResourcePartnersSection: () => (
      <div data-testid="rec-resource-partners-section">
        Mock RecResourcePartnersSection
      </div>
    ),
  }),
);

describe('RecResourcePartnersPage', () => {
  it('renders the RecResourcePartnersSection component', () => {
    render(<RecResourcePartnersPage />);

    expect(
      screen.getByTestId('rec-resource-partners-section'),
    ).toBeInTheDocument();
  });
});
