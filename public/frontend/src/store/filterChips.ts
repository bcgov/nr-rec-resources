import { Store } from '@tanstack/store';
import { FilterChip } from '@/components/search/types';

const filterChipStore = new Store<FilterChip[]>([]);

export default filterChipStore;
