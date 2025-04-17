drop materialized view if exists recreation_resource_district_count_view;

create materialized view recreation_resource_district_count_view as
select
  rd.district_code,
  rd.description,
  coalesce(count(distinct r.rec_resource_id), 0) as resource_count
from
  recreation_district_code rd
  left join recreation_resource r on r.district_code = rd.district_code
    and r.display_on_public_site = true
where
  rd.district_code not in ('RDQC', 'RDRM')
group by
  rd.district_code;

comment on materialized view recreation_resource_district_count_view is 'Provides a list of district codes and counts of their associated recreation resources for use in the search filter menu.';
