create or replace view recreation_resource_type_view as
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


comment on view recreation_resource_type_view is
'Provides a list of resource type codes and descriptions for recreation resources to be used
as the source of truth for getting the recreation resource type code for a recreation resource
for display on the public site. This was needed to mitigate bugs from junk data in the recreation
map feature table as well as the request to show some recreation reserves as sites on the public site.';
