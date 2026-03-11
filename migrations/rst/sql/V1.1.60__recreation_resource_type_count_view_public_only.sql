-- Ensure filter counts only include public resources
drop materialized view if exists recreation_resource_type_count_view;

create materialized view recreation_resource_type_count_view as
select
  rrtv.rec_resource_type_code,
  rrtv.description,
  count(distinct rrtv.rec_resource_id) as count
from
  recreation_resource_type_view_public rrtv
  join recreation_resource rr
    on rr.rec_resource_id = rrtv.rec_resource_id
where
  rr.display_on_public_site = true
group by
  rrtv.rec_resource_type_code,
  rrtv.description
order by
  rrtv.description desc;

comment on materialized view recreation_resource_type_count_view is 'Provides a list of resource type codes and counts of their associated recreation resources for use in the search filter menu.';
refresh materialized view rst.recreation_resource_type_count_view;
