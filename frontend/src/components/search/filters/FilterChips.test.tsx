import { vi, Mock } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import filterChipStore from '@/store/filterChips';
import { mockFilterChips } from '@/components/search/test/mock-data';
import { useFilterHandler } from '@/components/search/hooks/useFilterHandler';
import FilterChips from '@/components/search/filters/FilterChips';
import { FilterChip } from '@/components/search/types';

vi.mock('react-router-dom', async () => {
  return {
    useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]), // Default empty params
  };
});

vi.mock('@/components/search/hooks/useFilterHandler', () => ({
  useFilterHandler: vi.fn(() => ({
    toggleFilter: vi.fn(({ id, label, param }: FilterChip) => {
      return { id, label, param };
    }),
  })),
}));

vi.mock('@/store/filterChips', async () => ({
  default: {
    state: [],
    subscribe: vi.fn(),
  },
}));

describe('the FilterChips component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders a list of filter chips', () => {
    filterChipStore.state = mockFilterChips;
    render(<FilterChips />);

    expect(screen.getByText('100 Mile-Chilcotin')).toBeVisible();
    expect(screen.getByText('Chilliwack')).toBeVisible();
    expect(screen.getByText('Recreation Site')).toBeVisible();
  });

  it('should show the clear filters button when filters are selected', () => {
    filterChipStore.state = mockFilterChips;
    render(<FilterChips />);

    expect(screen.getByText('Clear Filters')).toBeVisible();
  });

  it('should hide the clear filters button when no filters are selected', () => {
    filterChipStore.state = [];

    render(<FilterChips />);

    expect(screen.queryByText('Clear Filters')).toBeNull();
  });

  it('should call the toggleFilter function when a filter chip is clicked', async () => {
    const toggleFilterMock = vi.fn();

    (useFilterHandler as Mock).mockReturnValue({
      toggleFilter: toggleFilterMock,
    });
    filterChipStore.state = mockFilterChips;
    render(<FilterChips />);

    const filterChip = screen.getByText('100 Mile-Chilcotin');

    await act(async () => {
      fireEvent.click(filterChip);
    });

    expect(toggleFilterMock).toHaveBeenCalledWith({
      id: 'RDMH',
      label: '100 Mile-Chilcotin',
      param: 'district',
    });
  });
});
