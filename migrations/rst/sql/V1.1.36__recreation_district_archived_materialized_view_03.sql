-- Add is_archived column to recreation_district_code table
alter table rst.recreation_district_code
add column is_archived boolean not null default false;

-- Add comment for the new column
comment on column rst.recreation_district_code.is_archived is 'indicates whether the recreation district code is archived (no longer active).';

-- Archive specific recreation district codes:
-- RDQC - Queen Charlotte Islands (Haida Gwaii)
-- RDRM - Rocky Mountain
-- RDOS - Okanagan
-- RDMH - 100 Mile-Chilcotin
update rst.recreation_district_code
set is_archived = true
where district_code in ('RDQC', 'RDRM', 'RDOS', 'RDMH');

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
  rd.is_archived = false
group by
  rd.district_code;

comment on materialized view recreation_resource_district_count_view is 'provides a list of district codes and counts of their associated recreation resources for use in the search filter menu.';

refresh materialized view recreation_resource_district_count_view;
