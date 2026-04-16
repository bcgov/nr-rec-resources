export interface AdminSearchTypeaheadSuggestion {
  sugestion: RecreationResourceSuggestion | CommunitySuggestion;
  type: 'resource' | 'community';
}

export interface CommunitySuggestion {
  id: string;
  name: string;
}

export interface RecreationResourceSuggestion {
  rec_resource_id: string;
  recreation_resource_type_code: string;
  recreation_resource_type: string;
  district_description: string;
  name: string;
  closest_community: string;
  display_on_public_site: boolean;
}
