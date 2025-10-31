select 
rec.rec_resource_id, rec.description,
array_agg(public.st_asgeojson(rmfg.geometry)) as spatial_feature_geometry,
       public.st_asgeojson(rsp.geometry)             as site_point_geometry
from 
rst.recreation_resource rec
inner join rst.recreation_map_feature rmf on rmf.rec_resource_id = rec.rec_resource_id
         inner join rst.recreation_map_feature_geom rmfg using (rmf_skey)
         left join rst.recreation_site_point rsp on rmf.rec_resource_id = rsp.rec_resource_id
where rmf.rec_resource_id = any ($1::text[])
  and rmf.retirement_date is null
group by rec.rec_resource_id, rec.description, rsp.geometry;
