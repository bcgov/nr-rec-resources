import { Store } from '@tanstack/store';
import { City } from '@/components/recreation-search-form/types';

interface SearchInputState {
  nameInputValue: string;
  cityInputValue: string;
  selectedCity?: City[];
}

const initialSearchInputState: SearchInputState = {
  nameInputValue: '',
  cityInputValue: '',
  selectedCity: undefined,
};

const searchInputStore = new Store<SearchInputState>(initialSearchInputState);

export default searchInputStore;
