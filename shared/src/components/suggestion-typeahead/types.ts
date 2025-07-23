export interface RecreationResourceSuggestion {
  rec_resource_id: string;
  recreation_resource_type_code: string;
  recreation_resource_type: string;
  district_description: string;
  name: string;
  option_type: "recreation_resource" | "current_location";
}
