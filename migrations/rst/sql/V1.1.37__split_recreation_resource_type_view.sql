-- Split recreation_resource_type_view into admin and public versions
-- Admin version: Shows actual resource types (including RR)
-- Public version: Converts RR to SIT for display on public site

-- Admin view (without RR to SIT conversion)
create or replace view recreation_resource_type_view_admin as
select rr.rec_resource_id,
    rmf.recreation_resource_type as rec_resource_type_code,
    rrtc.description as description
from rst.recreation_resource rr
left join (
    select distinct on (rec_resource_id)
        rec_resource_id,
        recreation_resource_type,
        amend_status_date
    from rst.recreation_map_feature
    order by rec_resource_id, amend_status_date desc
) rmf
on rr.rec_resource_id = rmf.rec_resource_id
left join rst.recreation_resource_type_code rrtc
on rmf.recreation_resource_type = rrtc.rec_resource_type_code;

comment on view recreation_resource_type_view_admin is
'Provides resource type codes and descriptions for admin interface.
Shows actual resource types without conversion (including RR).
Gets the most recent recreation_resource_type from recreation_map_feature table.';

-- Public view (with RR to SIT conversion)
create or replace view recreation_resource_type_view_public as
select rr.rec_resource_id,
    case
        when rr.display_on_public_site = true and rmf.recreation_resource_type = 'RR'
            then 'SIT'
        else rmf.recreation_resource_type
    end as rec_resource_type_code,
    rrtc.description as description
from rst.recreation_resource rr
left join (
    select distinct on (rec_resource_id)
        rec_resource_id,
        recreation_resource_type,
        amend_status_date
    from rst.recreation_map_feature
    order by rec_resource_id, amend_status_date desc
) rmf
on rr.rec_resource_id = rmf.rec_resource_id
left join rst.recreation_resource_type_code rrtc
on
case
    when rr.display_on_public_site = true and rmf.recreation_resource_type = 'RR'
        then 'SIT'
    else rmf.recreation_resource_type
end = rrtc.rec_resource_type_code;

comment on view recreation_resource_type_view_public is
'Provides resource type codes and descriptions for public site.
Converts RR (Recreation Reserve) to SIT (Site) for public display.
Gets the most recent recreation_resource_type from recreation_map_feature table.';

-- Update recreation_resource_type_count_view to use public view
drop materialized view if exists recreation_resource_type_count_view;

create materialized view recreation_resource_type_count_view as
select
  rrtv.rec_resource_type_code,
  rrtv.description as description,
  coalesce(count(distinct rr.rec_resource_id), 0) as count
from
  recreation_resource_type_view_public rrtv
  left join recreation_resource rr
    on rr.rec_resource_id = rrtv.rec_resource_id
    and rr.display_on_public_site = true
where
  rrtv.rec_resource_type_code != 'RR'
group by
  rrtv.rec_resource_type_code,
  rrtv.description
order by
  rrtv.description desc;

comment on materialized view recreation_resource_type_count_view is 'Provides a list of resource type codes and counts of their associated recreation resources for use in the search filter menu.';

-- Update recreation_resource_search_view to use public view
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
    ) then true
    else false
  end as is_reservable

from rst.recreation_resource rr
left join recreation_resource_type_view_public rrtv on rr.rec_resource_id = rrtv.rec_resource_id
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

drop view if exists recreation_resource_type_view;
