import * as $runtime from '@prisma/client/runtime/library';

/**
 * @param text
 */
export const getRecreationResourceGeospatialData: (
  text: string,
) => $runtime.TypedSql<
  getRecreationResourceGeospatialData.Parameters,
  getRecreationResourceGeospatialData.Result
>;

export namespace getRecreationResourceGeospatialData {
  export type Parameters = [text: string];
  export type Result = {
    spatial_feature_geometry: string[] | null;
    site_point_geometry: string | null;
    latitude: $runtime.Decimal | null;
    longitude: $runtime.Decimal | null;
    utm_zone: number | null;
    utm_easting: number | null;
    utm_northing: number | null;
  };
}
