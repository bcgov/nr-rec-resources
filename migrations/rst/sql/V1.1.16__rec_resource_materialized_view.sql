create materialized view recreation_resource_search_view as
select distinct
  on (rr.rec_resource_id) rr.rec_resource_id,
  rr.name,
  rr.closest_community,
  rr.display_on_public_site,
  rrtc.description as recreation_resource_type,
  rrmf.recreation_resource_type as recreation_resource_type_code,
  jsonb_agg (
    distinct jsonb_build_object (
      'recreation_activity_code',
      ra.recreation_activity_code,
      'description',
      rac.description
    )
  ) filter (
    where
      ra.recreation_activity_code is not null
  ) as recreation_activity,
  jsonb_build_object (
    'status_code',
    rs.status_code,
    'description',
    rsc.description,
    'comment',
    rs.comment
  ) as recreation_status,
  jsonb_agg (
    distinct jsonb_build_object (
      'ref_id',
      ri.ref_id,
      'caption',
      ri.caption,
      'recreation_resource_image_variants',
      rv.variants
    )
  ) filter (
    where
      ri.ref_id is not null
  ) as recreation_resource_images,
  rd.district_code,
  rd.description as district_description,
  ac.access_code,
  ac.description as access_description,
  jsonb_agg (
    distinct jsonb_build_object (
      'structure_code',
      rsc2.structure_code,
      'description',
      rsc2.description
    )
  ) filter (
    where
      rsc2.structure_code is not null
  ) as recreation_structure,
  case
    when exists (
      select
        1
      from
        rst.recreation_structure_code rsc
      where
        rsc.description ilike '%toilet%'
        and rsc.structure_code in (
          select
            rst.structure_code
          from
            rst.recreation_structure rst
          where
            rst.rec_resource_id = rr.rec_resource_id
        )
    ) then true
    else false
  end as has_toilets,
  case
    when exists (
      select
        1
      from
        rst.recreation_structure_code rsc
      where
        rsc.description ilike '%table%'
        and rsc.structure_code in (
          select
            rst.structure_code
          from
            rst.recreation_structure rst
          where
            rst.rec_resource_id = rr.rec_resource_id
        )
    ) then true
    else false
  end as has_tables
from
  rst.recreation_resource rr
  left join rst.recreation_activity ra on rr.rec_resource_id = ra.rec_resource_id
  left join rst.recreation_activity_code rac on ra.recreation_activity_code = rac.recreation_activity_code
  left join rst.recreation_status rs on rr.rec_resource_id = rs.rec_resource_id
  left join rst.recreation_status_code rsc on rs.status_code = rsc.status_code
  left join rst.recreation_resource_images ri on rr.rec_resource_id = ri.rec_resource_id
  left join lateral (
    select
      jsonb_agg (
        jsonb_build_object (
          'size_code',
          riv.size_code,
          'url',
          riv.url,
          'width',
          riv.width,
          'height',
          riv.height,
          'extension',
          riv.extension
        )
      ) as variants
    from
      rst.recreation_resource_image_variants riv
    where
      riv.ref_id = ri.ref_id
      and riv.size_code = 'llc'
  ) rv on true
  left join rst.recreation_map_feature rrmf on rr.rec_resource_id = rrmf.rec_resource_id
  left join rst.recreation_resource_type_code rrtc on rrmf.recreation_resource_type = rrtc.rec_resource_type_code
  left join rst.recreation_district_code rd on rr.district_code = rd.district_code
  left join rst.recreation_access ra1 on rr.rec_resource_id = ra1.rec_resource_id
  left join rst.recreation_access_code ac on ra1.access_code = ac.access_code
  left join rst.recreation_structure rst on rr.rec_resource_id = rst.rec_resource_id
  left join rst.recreation_structure_code rsc2 on rst.structure_code = rsc2.structure_code
where
  rr.display_on_public_site = true
group by
  rr.rec_resource_id,
  rr.name,
  rr.closest_community,
  rr.display_on_public_site,
  rrtc.description,
  rrmf.recreation_resource_type,
  rs.status_code,
  rsc.description,
  rs.comment,
  rd.district_code,
  rd.description,
  ac.access_code,
  ac.description;
