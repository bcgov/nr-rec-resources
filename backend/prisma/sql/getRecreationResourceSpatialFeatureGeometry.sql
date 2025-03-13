-- Gets the spatial features for a rec resource in GeoJSON format
SELECT public.st_asgeojson(rmfg.geometry) as spatial_feature_geometry
from rst.recreation_map_feature rmf
         join rst.recreation_map_feature_geom rmfg
              on rmf.rmf_skey = rmfg.rmf_skey
where rmf.rec_resource_id = $1
