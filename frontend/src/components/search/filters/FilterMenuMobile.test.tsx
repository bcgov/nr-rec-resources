import { render, screen, fireEvent } from '@testing-library/react';
import FilterMenuMobile from '@/components/search/filters/FilterMenuMobile';
import useClearFilters from '@/components/search/hooks/useClearFilters';
import searchResultsStore from '@/store/searchResults';
import { mockFilterMenuContent } from '@/components/search/test/mock-data.test';

vi.mock('react-router-dom', () => ({
  useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]),
}));

Object.defineProperty(searchResultsStore, 'state', {
  get: vi.fn(() => ({
    totalCount: 12,
    filters: mockFilterMenuContent,
  })),
});

describe('FilterMenuMobile component', () => {
  afterEach(() => {
    vi.clearAllMocks(); // Don't reset mocks entirely
  });

  it('renders a list of filter groups', () => {
    render(<FilterMenuMobile isOpen={true} setIsOpen={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Filter' })).toBeVisible();
    expect(screen.getByText('Activities')).toBeVisible();
    expect(screen.getByText('Status')).toBeVisible();
  });

  it('renders the results count', () => {
    render(<FilterMenuMobile isOpen={true} setIsOpen={vi.fn()} />);

    // Use regex to match dynamic count
    const showResultsBtn = screen.getByText(/Show \d+ results/);

    expect(showResultsBtn).toBeVisible();
  });

  it('should call setIsOpen when results button is clicked', async () => {
    const setIsOpen = vi.fn();
    render(<FilterMenuMobile isOpen={true} setIsOpen={setIsOpen} />);

    const showResultsBtn = screen.getByText(/Show \d+ results/);

    fireEvent.click(showResultsBtn);

    expect(setIsOpen).toHaveBeenCalledWith(false);
  });

  it('should not be visible when isOpen is false', () => {
    render(<FilterMenuMobile isOpen={false} setIsOpen={vi.fn()} />);

    expect(screen.queryByRole('heading', { name: 'Filter' })).toBeNull();
    expect(screen.queryByText(/Show \d+ results/)).toBeNull();
  });

  it('should call clearFilters when clear filters button is clicked', async () => {
    render(<FilterMenuMobile isOpen={true} setIsOpen={vi.fn()} />);

    const clearFiltersBtn = screen.getByRole('button', {
      name: 'Clear filters',
    });
    fireEvent.click(clearFiltersBtn);

    expect(useClearFilters).toHaveBeenCalled();
  });
});
