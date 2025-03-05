SELECT st_asgeojson(geometry) as geometry
from rst.recreation_map_feature rmf
         join rst.recreation_map_feature_geom rmfg
              on rmf.rmf_skey = rmfg.rmf_skey
where rmf.rec_resource_id = $1
