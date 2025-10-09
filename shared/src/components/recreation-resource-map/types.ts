export interface RecreationResourceMapData {
  rec_resource_id: string;
  name: string;
  rec_resource_type: string;
  spatial_feature_geometry?: string[];
  site_point_geometry?: string;
  description?: string;
  maintenance_standard_code?: string;
  driving_directions?: string;
  recreation_access?:
    | string[]
    | Array<Partial<{ description: string; [key: string]: any }>>;
  recreation_resource_images?: Array<
    Partial<{
      recreation_resource_image_variants?: Array<
        Partial<{ url?: string; [key: string]: any }>
      >;
      [key: string]: any;
    }>
  >;
  recreation_activity?: Array<
    Partial<{
      description: string;
      recreation_activity_code: string | number;
      [key: string]: any;
    }>
  >;
  recreation_fee?: Array<
    Partial<{
      recreation_fee_code: string | number;
      fee_amount: number | string;
      fee_start_date: Date | null;
      fee_end_date: Date | null;
      monday_ind?: string;
      tuesday_ind?: string;
      wednesday_ind?: string;
      thursday_ind?: string;
      friday_ind?: string;
      saturday_ind?: string;
      sunday_ind?: string;
      [key: string]: any;
    }>
  >;
  [key: string]: any;
}
