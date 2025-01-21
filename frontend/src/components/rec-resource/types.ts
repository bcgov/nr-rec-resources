export interface Activity {
  description: string;
  recreation_activity_code: string;
}

export interface RecResource {
  description: string;
  name: string;
  rec_resource_id: string;
  recreation_activity: Activity[];
  site_location: string;
}
