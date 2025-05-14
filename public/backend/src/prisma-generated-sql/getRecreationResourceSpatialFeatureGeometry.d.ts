import * as $runtime from "@prisma/client/runtime/library";

/**
 * @param text
 */
export const getRecreationResourceSpatialFeatureGeometry: (
  text: string,
) => $runtime.TypedSql<
  getRecreationResourceSpatialFeatureGeometry.Parameters,
  getRecreationResourceSpatialFeatureGeometry.Result
>;

export namespace getRecreationResourceSpatialFeatureGeometry {
  export type Parameters = [text: string];
  export type Result = {
    spatial_feature_geometry: string[] | null;
    site_point_geometry: string | null;
  };
}
