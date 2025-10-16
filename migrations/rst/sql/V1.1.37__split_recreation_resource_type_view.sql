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
