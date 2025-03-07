select st_asgeojson(geometry)              as geometry,
       rr.rec_resource_id,
       rr.description,
       rr.name,
       rr.closest_community,
       rr.display_on_public_site,
       recreation_resource_type_code.rec_resource_type_code,
       recreation_resource_type_code.description as type_code_description,
       recreation_activity_code.description  as access_code_description,
       recreation_activity_code.recreation_activity_code,
       rst.recreation_campsite.campsite_count,
       rst.recreation_status_code.description as status_code_description,
       rst.recreation_status_code.status_code,
       rst.recreation_status.comment,
       rst.recreation_fee_code.recreation_fee_code,
       rst.recreation_fee_code.description as fee_description,
       rst.recreation_fee.fee_amount,
       rst.recreation_fee.fee_start_date,
       rst.recreation_fee.fee_end_date,
       rst.recreation_fee.monday_ind,
       rst.recreation_fee.tuesday_ind,
       rst.recreation_fee.wednesday_ind,
       rst.recreation_fee.thursday_ind,
       rst.recreation_fee.friday_ind,
       rst.recreation_fee.saturday_ind,
       rst.recreation_fee.sunday_ind,
       rst.recreation_resource_images.ref_id,
       rst.recreation_resource_images.caption,
       rst.recreation_resource_image_variants.size_code,
       rst.recreation_resource_image_variants.url,
       rst.recreation_resource_image_variants.width,
       rst.recreation_resource_image_variants.height,
       rst.recreation_resource_image_variants.extension,
       rst.recreation_structure_code.description as structure_code_description
from rst.recreation_resource rr
         join rst.recreation_resource_type
              on rr.rec_resource_id = recreation_resource_type.rec_resource_id
         join rst.recreation_resource_type_code
              on recreation_resource_type.rec_resource_type_code = recreation_resource_type_code.rec_resource_type_code
         join rst.recreation_campsite on rr.rec_resource_id = recreation_campsite.rec_resource_id
         join rst.recreation_access on rr.rec_resource_id = recreation_access.rec_resource_id
         join rst.recreation_access_code on recreation_access.access_code = recreation_access_code.access_code
         join rst.recreation_activity on rr.rec_resource_id = recreation_activity.rec_resource_id
         join rst.recreation_activity_code
              on recreation_activity.recreation_activity_code = recreation_activity_code.recreation_activity_code
         join rst.recreation_status on rr.rec_resource_id = recreation_status.rec_resource_id
         join rst.recreation_status_code on recreation_status.status_code = recreation_status_code.status_code
         join rst.recreation_fee on rr.rec_resource_id = recreation_fee.rec_resource_id
         join rst.recreation_fee_code on recreation_fee.recreation_fee_code = recreation_fee_code.recreation_fee_code
         join rst.recreation_structure on rr.rec_resource_id = recreation_structure.rec_resource_id
         join rst.recreation_structure_code
              on recreation_structure.structure_code = recreation_structure_code.structure_code
         join rst.recreation_resource_images
              on rr.rec_resource_id = recreation_resource_images.rec_resource_id
         join rst.recreation_resource_image_variants
              on recreation_resource_images.ref_id = recreation_resource_image_variants.ref_id
         join rst.recreation_map_feature on recreation_map_feature.rec_resource_id = rr.rec_resource_id
         join rst.recreation_map_feature_geom on recreation_map_feature.rmf_skey = recreation_map_feature_geom.rmf_skey
where rr.display_on_public_site = true
  and rr.rec_resource_id = $1