import { OPTION_TYPE } from '@/components/recreation-search-form/constants';

export interface City {
  id: number;
  name: string;
  latitude?: number;
  longitude?: number;
  rank?: number;
  option_type: OPTION_TYPE.CURRENT_LOCATION | OPTION_TYPE.CITY;
}

export interface RecreationSuggestion {
  name: string;
  closest_community: string;
  district_description: string;
  rec_resource_id: string;
  recreation_resource_type_code: string;
  recreation_resource_type: string;
  option_type: OPTION_TYPE.RECREATION_RESOURCE;
}
