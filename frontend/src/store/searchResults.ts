import { Store } from '@tanstack/store';
import { PaginatedRecreationResourceDto } from '@/service/recreation-resource';
import { FilterMenuContent } from '@/components/search/types';

export const initialState = {
  paginatedResults: [],
  page: 1,
  total: 0,
  filters: [],
};

interface SearchResultsStore {
  paginatedResults: PaginatedRecreationResourceDto[];
  page: number;
  total: number;
  filters: FilterMenuContent[];
}

const searchResultsStore = new Store<SearchResultsStore>(initialState);

export default searchResultsStore;
