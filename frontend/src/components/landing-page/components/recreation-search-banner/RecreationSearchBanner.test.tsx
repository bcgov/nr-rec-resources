import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecreationSearchBanner } from './RecreationSearchBanner';
import { RecreationSearchForm } from '@/components/recreation-search-form';

// Mock dependencies
vi.mock('@/components/recreation-search-form', () => ({
  RecreationSearchForm: vi.fn(() => null),
}));

describe('RecreationSearchBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search title and recreation search form with correct props', () => {
    render(<RecreationSearchBanner />);
    const titleH2 = screen.getByText('Find a recreation');
    expect(titleH2).toBeInTheDocument();
    expect(titleH2.className).toContain('search-title fs-4');

    const workBreak = screen.getByText('site or trail');
    expect(workBreak).toBeInTheDocument();

    expect(RecreationSearchForm).toHaveBeenCalledWith(
      {
        searchButtonProps: { variant: 'light', className: 'search-btn' },
        showSearchIcon: true,
      },
      undefined,
    );
  });
});
