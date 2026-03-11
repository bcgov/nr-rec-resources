import { describe, expect, it, vi } from 'vitest';
import filterChipStore from '@/store/filterChips';
import setFilterChipsFromSearchParams from '@/components/search/utils/setFilterChipsFromSearchParams';
import {
  mockSearchResultsData,
  mockFilterMenuContent,
} from '@/components/search/test/mock-data';

vi.mock('@tanstack/react-router', async () => {
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
    const searchParams = {
      activities: '1',
      type: 'camping',
    };

    mockSearchResultsData.filters = mockFilterMenuContent;

    setFilterChipsFromSearchParams(mockSearchResultsData, searchParams);

    expect(filterChipStore.setState).toHaveBeenCalled();
  });

  it('should clear filter chips if no search params', () => {
    setFilterChipsFromSearchParams(mockSearchResultsData, {});

    expect(filterChipStore.setState).toHaveBeenCalled();
  });

  it('should set filter chips when search params change', () => {
    const searchParams = { activities: 'hiking', type: 'camping' };

    setFilterChipsFromSearchParams(mockSearchResultsData, searchParams);

    expect(filterChipStore.setState).toHaveBeenCalled();
  });
});
