import { RecResourceAssetsPage } from '@/pages/rec-resource-page/RecResourceAssetsPage';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceAssetsSection',
  () => ({
    RecResourceAssetsSection: () => (
      <div data-testid="rec-resource-assets-section">
        Mock RecResourceAssetsSection
      </div>
    ),
  }),
);

describe('RecResourceAssetsPage', () => {
  it('renders the RecResourceAssetsSection component', () => {
    render(<RecResourceAssetsPage />);

    expect(
      screen.getByTestId('rec-resource-assets-section'),
    ).toBeInTheDocument();
  });
});
