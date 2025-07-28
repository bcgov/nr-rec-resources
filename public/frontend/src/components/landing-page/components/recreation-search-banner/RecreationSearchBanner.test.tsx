import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { RecreationSearchBanner } from './RecreationSearchBanner';
import RecreationSuggestionForm from '@/components/recreation-suggestion-form/RecreationSuggestionForm';
import { renderWithQueryClient } from '@/test-utils';

vi.mock(
  '@/components/recreation-suggestion-form/RecreationSuggestionForm',
  () => ({
    default: vi.fn(() => <div data-testid="mock-recreation-suggestion-form" />),
  }),
);

describe('RecreationSearchBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search title and recreation search form with correct props', () => {
    renderWithQueryClient(<RecreationSearchBanner />);
    const titleH2 = screen.getByText('Find a recreation');
    expect(titleH2).toBeInTheDocument();
    expect(titleH2.className).toContain('search-title fs-4');

    const workBreak = screen.getByText('site or trail');
    expect(workBreak).toBeInTheDocument();

    expect(RecreationSuggestionForm).toHaveBeenCalledWith(
      {
        allowEmptySearch: true,
        searchBtnVariant: 'secondary',
      },
      undefined,
    );
  });
});
