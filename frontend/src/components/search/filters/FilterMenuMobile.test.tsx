import { render, screen } from '@testing-library/react';
import FilterMenuMobile from '@/components/search/filters/FilterMenuMobile';
import { mockMenuContent } from '@/components/search/filters/FilterMenu.test';

vi.mock('react-router-dom', async () => {
  return {
    useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]), // Default empty params
  };
});

describe('the FilterMenuMobile component', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });
  it('renders a list of filter groups', () => {
    render(
      <FilterMenuMobile
        totalResults={12}
        menuContent={mockMenuContent}
        isOpen={true}
        setIsOpen={vi.fn()}
        onClearFilters={vi.fn()}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Filter' })).toBeVisible();
    expect(screen.getByText('Activities')).toBeVisible();
    expect(screen.getByText('Status')).toBeVisible();
  });

  it('renders the results count', () => {
    render(
      <FilterMenuMobile
        totalResults={12}
        menuContent={mockMenuContent}
        isOpen={true}
        setIsOpen={vi.fn()}
        onClearFilters={vi.fn()}
      />,
    );

    // text is broken up so get element containing
    const showResultsBtn = screen.getByRole('button', {
      name: 'Show results',
    });

    expect(showResultsBtn).toHaveTextContent('Show 12 results');
  });

  it('Should call setIsOpen results button is clicked', async () => {
    const setIsOpen = vi.fn();
    render(
      <FilterMenuMobile
        totalResults={12}
        menuContent={mockMenuContent}
        isOpen={true}
        setIsOpen={setIsOpen}
        onClearFilters={vi.fn()}
      />,
    );

    const showResultsBtn = screen.getByRole('button', {
      name: 'Show results',
    });
    showResultsBtn.click();
    expect(setIsOpen).toHaveBeenCalledWith(false);
  });

  it('Should not be visible when isOpen is false', async () => {
    render(
      <FilterMenuMobile
        totalResults={12}
        menuContent={mockMenuContent}
        isOpen={false}
        setIsOpen={vi.fn()}
        onClearFilters={vi.fn()}
      />,
    );

    expect(screen.queryByRole('heading', { name: 'Filter' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Show results' })).toBeNull();
  });

  it('Should call onClearFilters when clear filters button is clicked', async () => {
    const onClearFilters = vi.fn();
    render(
      <FilterMenuMobile
        totalResults={12}
        menuContent={mockMenuContent}
        isOpen={true}
        setIsOpen={vi.fn()}
        onClearFilters={onClearFilters}
      />,
    );

    const clearFiltersBtn = screen.getByRole('button', {
      name: 'Clear filters',
    });
    clearFiltersBtn.click();
    expect(onClearFilters).toHaveBeenCalled();
  });
});
