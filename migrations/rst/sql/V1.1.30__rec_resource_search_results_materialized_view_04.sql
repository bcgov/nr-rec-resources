-- Drop the view and indexes if they exist
DROP MATERIALIZED VIEW IF EXISTS recreation_resource_search_view;
DROP INDEX IF EXISTS idx_recreation_text_search;
DROP INDEX IF EXISTS idx_recreation_site_point_gist;
DROP INDEX IF EXISTS idx_recreation_filters;
DROP INDEX IF EXISTS idx_recreation_resource_search_view_name_trgm;
DROP INDEX IF EXISTS idx_recreation_resource_search_view_closest_community_trgm;

create materialized view recreation_resource_search_view as
select distinct on (rr.rec_resource_id)
  rr.rec_resource_id,
  rr.name,
  rr.closest_community,
  rr.display_on_public_site,
  rrtv.description as recreation_resource_type,
  rrtv.rec_resource_type_code as recreation_resource_type_code,
  public.ST_SetSRID(rsp.geometry, 3005) as recreation_site_point,
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
  )) filter (where rsc2.structure_code is not null) as recreation_structure,

  case
    when exists (
      select 1
      from rst.recreation_structure_code rsc
      where rsc.description ilike '%toilet%'
      and rsc.structure_code in (select rst.structure_code from rst.recreation_structure rst where rst.rec_resource_id = rr.rec_resource_id)
    ) then true
    else false
  end as has_toilets,

  case
    when exists (
      select 1
      from rst.recreation_structure_code rsc
      where rsc.description ilike '%table%'
      and rsc.structure_code in (select rst.structure_code from rst.recreation_structure rst where rst.rec_resource_id = rr.rec_resource_id)
    ) then true
    else false
  end as has_tables

from rst.recreation_resource rr
left join recreation_resource_type_view rrtv on rr.rec_resource_id = rrtv.rec_resource_id
left join rst.recreation_activity ra on rr.rec_resource_id = ra.rec_resource_id
left join rst.recreation_activity_code rac on ra.recreation_activity_code = rac.recreation_activity_code
left join rst.recreation_status rs on rr.rec_resource_id = rs.rec_resource_id
left join rst.recreation_status_code rsc on rs.status_code = rsc.status_code
left join rst.recreation_resource_images ri on rr.rec_resource_id = ri.rec_resource_id
left join rst.recreation_site_point rsp on rr.rec_resource_id = rsp.rec_resource_id
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
  and riv.size_code = 'pre'
) rv on true
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
  rrtv.rec_resource_type_code,
  rsp.geometry,
  rrtv.description,
  rs.status_code,
  rsc.description,
  rs.comment,
  rd.district_code,
  rd.description,
  ac.access_code,
  ac.description;

comment on materialized view recreation_resource_search_view is 'Provides a list of recreation resources and related data for use in the public site search page';


-- Create indexes to improve search query performance on the materialized view
CREATE EXTENSION if not exists pg_trgm;

-- GiST index for spatial queries
CREATE INDEX idx_recreation_site_point_gist
    ON recreation_resource_search_view USING gist (recreation_site_point);

-- Index for filtered searches on district, access, and resource type
CREATE INDEX idx_recreation_filters
    ON recreation_resource_search_view (district_code, access_code, recreation_resource_type_code);

-- GIN index for filtered searches on name and closest_community
CREATE INDEX idx_recreation_resource_search_view_name_trgm
    ON recreation_resource_search_view USING GIN (name gin_trgm_ops);
CREATE INDEX idx_recreation_resource_search_view_closest_community_trgm
    ON recreation_resource_search_view USING GIN (closest_community gin_trgm_ops);
