-- @param {Int} $1:limit
-- @param {Int} $2:offset
select
  rr.rec_resource_id,
  rr.name,
  rr.display_on_public_site,
  rdc.district_code,
  rdc.description as district_description,
  rtv.rec_resource_type_code,
  rtv.description as rec_resource_type_description,
  rs.status_code,
  rsc.description as status_description,
  rs.comment as closure_comment,
  public.st_asgeojson(rsp.geometry)::text as site_point_geometry,
  count(*) over()::int as total_count
from rst.recreation_resource rr
  inner join rst.recreation_resource_type_view_admin rtv
    on rr.rec_resource_id = rtv.rec_resource_id
    and rtv.rec_resource_type_code is not null
  left join rst.recreation_district_code rdc
    on rr.district_code = rdc.district_code
  left join rst.recreation_status rs
    on rr.rec_resource_id = rs.rec_resource_id
  left join rst.recreation_status_code rsc
    on rs.status_code = rsc.status_code
  left join rst.recreation_site_point rsp
    on rr.rec_resource_id = rsp.rec_resource_id
order by rr.rec_resource_id asc
limit $1
offset $2;
