create materialized view recreation_resource_district_count_view as
select
  row_number() over () as unique_id,
  rd.district_code,
  rd.description,
  coalesce(count(distinct r.rec_resource_id), 0) as resource_count
from
  recreation_district_code rd
  left join recreation_resource r on r.district_code = rd.district_code
  and r.display_on_public_site = true
where
  rd.district_code not in ('RDQC', 'RDRM', 'RDRN', 'RDRS')
group by
  rd.district_code;

-- Prisma doesn't support materialized view yet so we will create a view
create view recreation_resource_district_prisma_view as select * from recreation_resource_district_count_view;

create materialized view recreation_resource_access_count_view as
select
  row_number() over () as unique_id,
  rac.access_code,
  rac.description as access_description,
  coalesce(count(distinct ra.id), 0) as count
from
  recreation_access ra
  left join recreation_access_code rac on ra.access_code = rac.access_code
  left join recreation_resource rr on ra.rec_resource_id = rr.rec_resource_id
where
  rr.display_on_public_site = true
group by
  rac.access_code,
  rac.description;

-- Prisma doesn't support materialized view yet so we will create a view
create view recreation_resource_access_prisma_view as select * from recreation_resource_access_count_view;

create materialized view recreation_resource_type_count_view as
select
  row_number() over () as unique_id,
  rrtc.rec_resource_type_code as rec_resource_type_code,
  rrtc.description,
  coalesce(count(distinct rr.rec_resource_id), 0) as count
from
  recreation_resource_type_code rrtc
  left join recreation_map_feature rmf
    on rmf.recreation_resource_type = rrtc.rec_resource_type_code
  left join recreation_resource rr
    on rr.rec_resource_id = rmf.rec_resource_id
    and rr.display_on_public_site = true
where
  rrtc.rec_resource_type_code != 'RR'
group by
  rrtc.rec_resource_type_code,
  rrtc.description
order by
  rrtc.description desc;


-- Prisma doesn't support materialized view yet so we will create a view
create view recreation_resource_type_prisma_view as select * from recreation_resource_type_count_view;



create materialized view recreation_resource_search_view as
select distinct on (rr.rec_resource_id)
  rr.rec_resource_id,
  rr.name,
  rr.closest_community,
  rr.display_on_public_site,
  rrtc.description as recreation_resource_type,
  rrmf.recreation_resource_type as recreation_resource_type_code,
  jsonb_agg(distinct jsonb_build_object(
    'recreation_activity_code', ra.recreation_activity_code,
    'description', rac.description
  )) filter (where ra.recreation_activity_code is not null) as recreation_activity,
  jsonb_build_object(
    'status_code', rs.status_code,
    'description', rsc.description,
    'comment', rs.comment
  ) as recreation_status,
  jsonb_agg(distinct jsonb_build_object(
    'ref_id', ri.ref_id,
    'caption', ri.caption,
    'recreation_resource_image_variants', rv.variants
  )) filter (where ri.ref_id is not null) as recreation_resource_images,
  rd.district_code,
  rd.description as district_description,
  ac.access_code,
  ac.description as access_description,
  jsonb_agg(distinct jsonb_build_object(
    'structure_code', rsc2.structure_code,
    'description', rsc2.description
  )) filter (where rsc2.structure_code is not null) as recreation_structure
from rst.recreation_resource rr
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
left join rst.recreation_map_feature rrmf on rr.rec_resource_id = rrmf.rec_resource_id
left join rst.recreation_resource_type_code rrtc on rrmf.recreation_resource_type = rrtc.rec_resource_type_code
left join rst.recreation_district_code rd on rr.district_code = rd.district_code
left join rst.recreation_access ra1 on rr.rec_resource_id = ra1.rec_resource_id
left join rst.recreation_access_code ac on ra1.access_code = ac.access_code
left join rst.recreation_structure rst on rr.rec_resource_id = rst.rec_resource_id
left join rst.recreation_structure_code rsc2 on rst.structure_code = rsc2.structure_code
where rr.display_on_public_site = true
group by
  rr.rec_resource_id,
  rr.name,
  rr.closest_community,
  rr.display_on_public_site,
  rrtc.description,
  rrmf.recreation_resource_type,
  rs.status_code,
  rsc.description,
  rs.comment,
  rd.district_code,
  rd.description,
  ac.access_code,
  ac.description;




-- Prisma doesn't support materialized view yet so we will create a view
create view recreation_resource_search_prisma_view as select * from recreation_resource_search_view;
