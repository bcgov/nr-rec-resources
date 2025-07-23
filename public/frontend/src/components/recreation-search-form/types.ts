import { RecreationResourceSuggestion } from '@shared/components/suggestion-typeahead/types';
import { OPTION_TYPE } from '@/components/recreation-search-form/constants';

export interface City {
  id: number;
  name: string;
  latitude?: number;
  longitude?: number;
  rank?: number;
  option_type: OPTION_TYPE.CURRENT_LOCATION | OPTION_TYPE.CITY;
}

export interface RecreationSuggestion extends RecreationResourceSuggestion {
  option_type: OPTION_TYPE.RECREATION_RESOURCE;
}
