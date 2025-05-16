import { describe, expect, it, vi } from 'vitest';
import filterChipStore from '@/store/filterChips';
import setFilterChipsFromSearchParams from '@/components/search/utils/setFilterChipsFromSearchParams';
import {
  mockSearchResultsData,
  mockFilterMenuContent,
} from '@/components/search/test/mock-data';

vi.mock('react-router-dom', async () => {
  return {
    useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]), // Default empty params
  };
});

vi.mock('@/store/filterChips', async () => ({
  default: {
    state: [],
    setState: vi.fn(),
    subscribe: vi.fn(),
  },
}));

describe('setFilterChipsFromSearchParams', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  it('should set filter chips from search params', () => {
    const searchParams = new URLSearchParams({
      activities: '1',
      type: 'camping',
    });

    mockSearchResultsData.filters = mockFilterMenuContent;

    setFilterChipsFromSearchParams([], mockSearchResultsData, searchParams);

    expect(filterChipStore.setState).toHaveBeenCalled();
  });

  it('should not set filter chips if no search params', () => {
    setFilterChipsFromSearchParams(
      [],
      mockSearchResultsData,
      new URLSearchParams(),
    );

    expect(filterChipStore.setState).not.toHaveBeenCalled();
  });

  it('should not set filter chips if filter chips are already set', () => {
    const searchParams = new URLSearchParams({
      activities: 'hiking',
      type: 'camping',
    });

    setFilterChipsFromSearchParams(
      [{ id: '1', label: 'test', param: 'test' }],
      mockSearchResultsData,
      searchParams,
    );

    expect(filterChipStore.setState).not.toHaveBeenCalled();
  });
});
