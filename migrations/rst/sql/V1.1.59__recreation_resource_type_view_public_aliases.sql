insert into rst.recreation_resource_type_code (rec_resource_type_code, description)
values
    ('RTR', 'Recreation trail reserve'), -- This code exists but is changing names
    ('TBL', 'Trail based recreation linear'),
    ('TRB', 'Trail based recreation area'),
    ('IFT', 'Interpretive forest trail'),
    ('RTE', 'Recreation trail established')
on conflict (rec_resource_type_code) do update
set description = excluded.description;

create or replace view recreation_resource_type_view_public as
select rr.rec_resource_id,
    case
        when rr.display_on_public_site = true and rmf.recreation_resource_type = 'RR'
            then 'SIT'
        -- Display new trail types as 'Recreation trail' on the public site
        when rr.display_on_public_site = true and rmf.recreation_resource_type in ('RTR', 'TBL', 'TRB')
            then 'RTE'
        -- Display new 'Interpretive forest trail' as 'Interpretive forest' on the public site
        when rr.display_on_public_site = true and rmf.recreation_resource_type = 'IFT'
            then 'IF'
        else rmf.recreation_resource_type
    end as rec_resource_type_code,
    case
        -- 'Recreation trail established' will just be 'Recreation trail' on the public site
        when rrtc.rec_resource_type_code = 'RTE'
            then 'Recreation trail'::varchar(200)
        else rrtc.description
    end as description
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
    when rr.display_on_public_site = true and rmf.recreation_resource_type in ('RTR', 'TBL', 'TRB')
        then 'RTE'
    when rr.display_on_public_site = true and rmf.recreation_resource_type = 'IFT'
        then 'IF'
    else rmf.recreation_resource_type
end = rrtc.rec_resource_type_code;

comment on view recreation_resource_type_view_public is
'Provides resource type codes and descriptions for public site.
Converts RR to SIT, TBL/TRB/RTE to RTE, and IFT to IF for public display.
Gets the most recent recreation_resource_type from recreation_map_feature table.';

-- Apply updated type mappings to materialized views immediately.
refresh materialized view rst.recreation_resource_type_count_view;
refresh materialized view rst.recreation_resource_search_view;
