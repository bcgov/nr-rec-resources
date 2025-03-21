create materialized view recreation_resource_district_count_view as
select
    rd.district_code,
    rd.description,
    coalesce(count(distinct r.rec_resource_id), 0) as resource_count
from
    recreation_district_code rd
left join recreation_resource r
    on r.district_code = rd.district_code
    and r.display_on_public_site = true
group by
    rd.district_code;


create materialized view recreation_resource_access_count_view as
select
  rac.access_code,
  rac.description as access_description,
  coalesce(count(distinct ra.id), 0) as count
from recreation_access ra
left join recreation_access_code rac
  on ra.access_code = rac.access_code
left join recreation_resource rr
  on ra.rec_resource_id = rr.rec_resource_id
where rr.display_on_public_site = true
group by
  rac.access_code, rac.description;


create materialized view recreation_resource_type_count_view as
select
  rmf.recreation_resource_type as rec_resource_type_code,
  rrtc.description,
  coalesce(count(distinct rr.rec_resource_id), 0) as count
from recreation_resource_type_code rrtc
left join recreation_map_feature rmf
  on rmf.recreation_resource_type = rrtc.rec_resource_type_code
left join recreation_resource rr
  on rr.rec_resource_id = rmf.rec_resource_id
where rrtc.rec_resource_type_code not in ('RR')
  and rr.display_on_public_site = true
group by
  rmf.recreation_resource_type, rrtc.description
order by
  rrtc.description desc;


create materialized view recreation_resource_search_view as
select
  rr.rec_resource_id,
  rr.name,
  rr.closest_community,
  rr.display_on_public_site,
  rmf.recreation_resource_type as rec_resource_type_code,
  jsonb_agg(distinct jsonb_build_object(
    'recreation_activity_code', ra.recreation_activity_code,
    'description', rac.description
  )) filter (where ra.recreation_activity_code is not null) as recreation_activity,
  jsonb_agg(distinct jsonb_build_object(
    'status_code', rs.status_code,
    'description', rsc.description,
    'comment', rs.comment
  )) filter (where rs.status_code is not null) as recreation_status,
  jsonb_agg(distinct jsonb_build_object(
    'ref_id', ri.ref_id,
    'caption', ri.caption,
    'variants', rv.variants
  )) filter (where ri.ref_id is not null) as recreation_resource_images
from rst.recreation_resource rr
left join rst.recreation_map_feature rmf on rr.rec_resource_id = rmf.rec_resource_id
left join rst.recreation_activity ra on rr.rec_resource_id = ra.rec_resource_id
left join rst.recreation_activity_code rac on ra.recreation_activity_code = rac.recreation_activity_code
left join rst.recreation_status rs on rr.rec_resource_id = rs.rec_resource_id
left join rst.recreation_status_code rsc on rs.status_code = rsc.status_code
left join rst.recreation_resource_images ri on rr.rec_resource_id = ri.rec_resource_id
left join lateral (
  select jsonb_agg(
    jsonb_build_object(
      'size_code', riv.size_code,
      'url', riv.url,
      'width', riv.width,
      'height', riv.height,
      'extension', riv.extension
    )
  ) as variants
  from rst.recreation_resource_image_variants riv
  where riv.ref_id = ri.ref_id
) rv on true
group by rr.rec_resource_id, rmf.recreation_resource_type;
