import { Store } from '@tanstack/store';
import {
  PaginatedRecreationResourceDto,
  SearchRecreationResourcesRequest,
} from '@/service/recreation-resource';
import { FilterMenuContent } from '@/components/search/types';

export const initialState = {
  currentPage: 1,
  filters: [],
  totalCount: 0,
  pages: [],
  pageParams: [],
  recResourceIds: [],
  extent: undefined,
};

export interface SearchResultsStore {
  pages: PaginatedRecreationResourceDto[];
  currentPage: number;
  totalCount: number;
  filters: FilterMenuContent[];
  pageParams: SearchRecreationResourcesRequest[];
  recResourceIds: string[];
  extent?: string;
}

const searchResultsStore = new Store<SearchResultsStore>(initialState);

export default searchResultsStore;
