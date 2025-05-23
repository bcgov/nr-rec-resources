import { vi, Mock } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import NoResults from 'src/components/search/NoResults';

import { useClearFilters } from '@/components/search/hooks/useClearFilters';
import { useSearchInput } from '@/components/recreation-search-form/hooks/useSearchInput';

vi.mock('@/components/search/hooks/useClearFilters');
vi.mock('@/components/recreation-search-form/hooks/useSearchInput');

describe('NoResults component', () => {
  const clearFiltersMock = vi.fn();
  const handleClearSearchMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useClearFilters as Mock).mockReturnValue(clearFiltersMock);
    (useSearchInput as Mock).mockReturnValue({
      handleClearSearch: handleClearSearchMock,
    });
  });

  it('calls both clearFilters and handleClearSearch when the "Go back to the full list" button is clicked', () => {
    render(<NoResults />);

    const clearButton = screen.getByText('Go back to the full list');
    fireEvent.click(clearButton);

    expect(clearFiltersMock).toHaveBeenCalled();
    expect(handleClearSearchMock).toHaveBeenCalled();
  });

  it('focuses the "Go back to the full list" button on mount', () => {
    render(<NoResults />);

    const clearButton = screen.getByText('Go back to the full list');
    expect(document.activeElement).toBe(clearButton);
  });

  it('renders the no results message and suggestions', () => {
    render(<NoResults />);

    expect(screen.getByText(/Sorry.../)).toBeVisible();
    expect(screen.getByText(/No sites or trails matched/)).toBeVisible();
    expect(screen.getByText(/Go back to the full list/)).toBeVisible();
  });
});
