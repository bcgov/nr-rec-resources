export interface Activity {
  description: string;
  recreation_activity_code: number;
}

export interface RecreationStatus {
  status_code: number;
  comment: string;
  description: string;
}

export interface RecreationResource {
  description: string;
  name: string;
  rec_resource_id: string;
  recreation_activity: Activity[];
  closest_community: string;
  recreation_status: RecreationStatus;
  campsite_count: number;
}
