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
  rd.district_code not in ('RDQC', 'RDRM', 'RDRN', 'RDRS')
group by
  rd.district_code;

comment on materialized view recreation_resource_district_count_view is 'Provides a list of district codes and counts of their associated recreation resources for use in the search filter menu.';

create materialized view recreation_resource_access_count_view as
select
  rac.access_code,
  rac.description as access_description,
  coalesce(count(distinct (ra.rec_resource_id, ra.access_code, ra.sub_access_code)), 0) as count
from
  recreation_access ra
  left join recreation_access_code rac on ra.access_code = rac.access_code
  left join recreation_resource rr on ra.rec_resource_id = rr.rec_resource_id
where
  rr.display_on_public_site = true
group by
  rac.access_code,
  rac.description;

comment on materialized view recreation_resource_access_count_view is 'Provides a list of access codes and counts of their associated recreation resources for use in the search filter menu.';


create materialized view recreation_resource_type_count_view as
select
  rrtv.rec_resource_type_code,
  rrtv.description as description,
  coalesce(count(distinct rr.rec_resource_id), 0) as count
from
  recreation_resource_type_view rrtv
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
