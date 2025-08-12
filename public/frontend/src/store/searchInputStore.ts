import { Store } from '@tanstack/store';
import { City } from '@/components/recreation-suggestion-form/types';

interface SearchInputState {
  searchInputValue: string;
  selectedCity?: City[];
  wasCleared: boolean;
}

const initialSearchInputState: SearchInputState = {
  searchInputValue: '',
  selectedCity: undefined,
  wasCleared: false,
};

const searchInputStore = new Store<SearchInputState>(initialSearchInputState);

export default searchInputStore;
