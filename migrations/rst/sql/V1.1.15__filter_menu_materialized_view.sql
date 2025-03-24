create materialized view recreation_resource_district_count_view as
select
  row_number() over () as unique_id,
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


create materialized view recreation_resource_access_count_view as
select
  row_number() over () as unique_id,
  rac.access_code,
  rac.description as access_description,
  coalesce(count(distinct ra.id), 0) as count
from
  recreation_access ra
  left join recreation_access_code rac on ra.access_code = rac.access_code
  left join recreation_resource rr on ra.rec_resource_id = rr.rec_resource_id
where
  rr.display_on_public_site = true
group by
  rac.access_code,
  rac.description;


create materialized view recreation_resource_type_count_view as
select
  row_number() over () as unique_id,
  rrtc.rec_resource_type_code as rec_resource_type_code,
  rrtc.description,
  coalesce(count(distinct rr.rec_resource_id), 0) as count
from
  recreation_resource_type_code rrtc
  left join recreation_map_feature rmf
    on rmf.recreation_resource_type = rrtc.rec_resource_type_code
  left join recreation_resource rr
    on rr.rec_resource_id = rmf.rec_resource_id
    and rr.display_on_public_site = true
where
  rrtc.rec_resource_type_code != 'RR'
group by
  rrtc.rec_resource_type_code,
  rrtc.description
order by
  rrtc.description desc;
