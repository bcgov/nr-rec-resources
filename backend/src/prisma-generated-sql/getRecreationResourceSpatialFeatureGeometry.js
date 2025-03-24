"use strict";
const {
  makeTypedQueryFactory: $mkFactory,
} = require("@prisma/client/runtime/library");
exports.getRecreationResourceSpatialFeatureGeometry = /*#__PURE__*/ $mkFactory(
  "SELECT public.st_asgeojson(rmfg.geometry) as spatial_feature_geometry\nfrom rst.recreation_map_feature rmf\ninner join rst.recreation_map_feature_geom rmfg\nusing (rmf_skey)\nwhere rmf.rec_resource_id = $1\nand rmf.retirement_date is null; -- only show active geospatial data",
);
