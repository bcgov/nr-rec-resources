-- Update recreation_resource_search_view to use new recreation_resource_image table
drop materialized view if exists recreation_resource_search_view;

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
    'image_id', ri.image_id
  )) filter (where ri.image_id is not null) as recreation_resource_images,
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
  end as has_tables,

  case
    when exists (
      select 1
      from rst.recreation_fee rf
      where rf.rec_resource_id = rr.rec_resource_id
    ) then true
    else false
  end as is_fees,

  case
    when exists (
      select 1
      from rst.recreation_resource_reservation_info rri
      where rri.rec_resource_id = rr.rec_resource_id
      and 
      (
        rri.reservation_website is not null
        or rri.reservation_phone_number is not null
        or rri.reservation_email is not null
      )
      and
      (
        rri.reservation_website != ''
        or rri.reservation_phone_number != ''
        or rri.reservation_email != ''
      )
    ) then true
    else false
  end as is_reservable

from rst.recreation_resource rr
left join recreation_resource_type_view_public rrtv on rr.rec_resource_id = rrtv.rec_resource_id
left join rst.recreation_activity ra on rr.rec_resource_id = ra.rec_resource_id
left join rst.recreation_activity_code rac on ra.recreation_activity_code = rac.recreation_activity_code
left join rst.recreation_status rs on rr.rec_resource_id = rs.rec_resource_id
left join rst.recreation_status_code rsc on rs.status_code = rsc.status_code
left join rst.recreation_resource_image ri on rr.rec_resource_id = ri.rec_resource_id
left join rst.recreation_site_point rsp on rr.rec_resource_id = rsp.rec_resource_id
left join rst.recreation_district_code rd on rr.district_code = rd.district_code
left join rst.recreation_access ra1 on rr.rec_resource_id = ra1.rec_resource_id
left join rst.recreation_access_code ac on ra1.access_code = ac.access_code
left join rst.recreation_structure rst on rr.rec_resource_id = rst.rec_resource_id
left join rst.recreation_structure_code rsc2 on rst.structure_code = rsc2.structure_code
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

CREATE EXTENSION if not exists pg_trgm;

CREATE INDEX idx_recreation_site_point_gist
    ON recreation_resource_search_view USING gist (recreation_site_point);

CREATE INDEX idx_recreation_filters
    ON recreation_resource_search_view (district_code, access_code, recreation_resource_type_code);

CREATE INDEX idx_recreation_resource_search_view_name_trgm
    ON recreation_resource_search_view USING GIN (name gin_trgm_ops);
CREATE INDEX idx_recreation_resource_search_view_closest_community_trgm
    ON recreation_resource_search_view USING GIN (closest_community gin_trgm_ops);

CREATE INDEX idx_recreation_filters_extended
    ON recreation_resource_search_view (district_code, access_code, recreation_resource_type_code, is_fees, is_reservable);
