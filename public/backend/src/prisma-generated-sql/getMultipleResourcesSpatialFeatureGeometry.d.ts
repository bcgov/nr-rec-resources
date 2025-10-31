import * as $runtime from '@prisma/client/runtime/library';

/**
 * @param _text
 */
export const getMultipleResourcesSpatialFeatureGeometry: (
  _text: string[],
) => $runtime.TypedSql<
  getMultipleResourcesSpatialFeatureGeometry.Parameters,
  getMultipleResourcesSpatialFeatureGeometry.Result
>;

export namespace getMultipleResourcesSpatialFeatureGeometry {
  export type Parameters = [_text: string[]];
  export type Result = {
    rec_resource_id: string;
    description: string | null;
    spatial_feature_geometry: string[] | null;
    site_point_geometry: string | null;
  };
}
