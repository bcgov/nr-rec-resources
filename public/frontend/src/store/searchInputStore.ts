import { Store } from '@tanstack/store';
import { City } from '@/components/recreation-search-form/types';

interface SearchInputState {
  searchInputValue: string;
  selectedCity?: City[];
}

const initialSearchInputState: SearchInputState = {
  searchInputValue: '',
  selectedCity: undefined,
};

const searchInputStore = new Store<SearchInputState>(initialSearchInputState);

export default searchInputStore;
