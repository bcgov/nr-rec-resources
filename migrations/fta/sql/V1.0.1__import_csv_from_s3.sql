create extension if not exists aws_s3 cascade;

select aws_s3.table_import_from_s3(
  'fta.recreation_project',
  '',
  '(
    FORMAT csv,
    HEADER true,
    FORCE_NULL
      (
        utm_zone,
        last_rec_inspection_date,
        last_hzrd_tree_assess_date,
        overflow_campsites,
        utm_northing,
        utm_easting,
        right_of_way,
        project_established_date,
        revision_count,
        entry_timestamp,
        update_timestamp,
        arch_impact_date
      )
  )',
  aws_commons.create_s3_uri('${S3_BUCKET}', 'RECREATION_PROJECT.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_access',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('${S3_BUCKET}', 'RECREATION_ACCESS.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_access_code',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('${S3_BUCKET}', 'RECREATION_ACCESS_CODE.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_access_xref',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('${S3_BUCKET}', 'RECREATION_ACCESS_XREF.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_activity',
  '',
  '(
    FORMAT csv,
    HEADER true,
    FORCE_NULL
      (
        activity_rank,
        revision_count,
        entry_timestamp,
        update_timestamp
      )
  )',
  aws_commons.create_s3_uri('${S3_BUCKET}', 'RECREATION_ACTIVITY.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_activity_code',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('${S3_BUCKET}', 'RECREATION_ACTIVITY_CODE.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_agreement_holder',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('${S3_BUCKET}', 'RECREATION_AGREEMENT_HOLDER.csv', 'ca-central-1')
);

-- come back to this, file wasn't in s3
-- select aws_s3.table_import_from_s3(
--   'fta.recreation_attachment',
--   '',
--   '(
--     FORMAT csv,
--     HEADER true
--   )',
--   aws_commons.create_s3_uri('${S3_BUCKET}', 'RECREATION_ATTACHMENT.csv', 'ca-central-1')
-- );

select aws_s3.table_import_from_s3(
  'fta.recreation_comment',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('${S3_BUCKET}', 'RECREATION_COMMENT.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_control_access_code',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('${S3_BUCKET}', 'RECREATION_CONTROL_ACCESS_CODE.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_def_cs_rpr_history',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('${S3_BUCKET}', 'RECREATION_DEF_CS_RPR_HISTORY.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_defined_campsite',
  '',
  '(
    FORMAT csv,
    HEADER true,
    FORCE_NULL
      (
        estimated_repair_cost,
        repair_complete_date,
        revision_count,
        entry_timestamp,
        update_timestamp
      )
  )',
  aws_commons.create_s3_uri('${S3_BUCKET}', 'RECREATION_DEFINED_CAMPSITE.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_district_code',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('${S3_BUCKET}', 'RECREATION_DISTRICT_CODE.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_district_xref',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('${S3_BUCKET}', 'RECREATION_DISTRICT_XREF.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_feature_code',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('${S3_BUCKET}', 'RECREATION_FEATURE_CODE.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_fee_code',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('${S3_BUCKET}', 'RECREATION_FEE_CODE.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_fee',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('${S3_BUCKET}', 'RECREATION_FEE.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_file_status_code',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('${S3_BUCKET}', 'RECREATION_FILE_STATUS_CODE.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_file_type_code',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('${S3_BUCKET}', 'RECREATION_FILE_TYPE_CODE.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_inspection_report',
  '',
  '(
    FORMAT csv,
    HEADER true,
    FORCE_NULL
      (
        campsite_no,
        occupied_campsite_no,
        vehicle_no,
        camping_party_no,
        day_use_party_no,
        with_pass_no,
        without_pass_no,
        absent_owner_no,
        total_inspected_no,
        purchased_pass_no,
        refused_pass_no,
        entry_timestamp,
        update_timestamp
      )
  )',
  aws_commons.create_s3_uri('${S3_BUCKET}', 'RECREATION_INSPECTION_REPORT.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_maintain_std_code',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('${S3_BUCKET}', 'RECREATION_MAINTAIN_STD_CODE.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_map_feature_geom',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('${S3_BUCKET}', 'RECREATION_MAP_FEATURE_GEOM.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_map_feature_xguid',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('${S3_BUCKET}', 'RECREATION_MAP_FEATURE_XGUID.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_map_feature',
  '',
  '(
    FORMAT csv,
    HEADER true,
    FORCE_NULL
      (
        amend_status_date,
        retirement_date,
        entry_timestamp,
        update_timestamp
      )
  )',
  aws_commons.create_s3_uri('${S3_BUCKET}', 'RECREATION_MAP_FEATURE.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_map_feature_code',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('${S3_BUCKET}', 'RECREATION_MAP_FEATURE_CODE.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_objective',
  '',
  '(
    FORMAT csv,
    HEADER true,
    FORCE_NULL
      (
        objective_established_date,
        objective_amended_date,
        objective_cancelled_date
      )
    )',
  aws_commons.create_s3_uri('${S3_BUCKET}', 'RECREATION_OBJECTIVE.csv', 'ca-central-1')
);

-- This file was empty, likely not used but should verify
select aws_s3.table_import_from_s3(
  'fta.recreation_occupancy_code',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('${S3_BUCKET}', 'RECREATION_OCCUPANCY_CODE.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_remed_repair_code',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('${S3_BUCKET}', 'RECREATION_REMED_REPAIR_CODE.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_risk_evaluation',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('${S3_BUCKET}', 'RECREATION_RISK_EVALUATION.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_risk_rating_code',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('${S3_BUCKET}', 'RECREATION_RISK_RATING_CODE.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_risk_site',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('${S3_BUCKET}', 'RECREATION_RISK_SITE.csv', 'ca-central-1')
);

-- This file was empty, likely not used but should verify
-- select aws_s3.table_import_from_s3(
--   'fta.recreation_search_result',
--   '',
--   '(
--     FORMAT csv,
--     HEADER true
--   )',
--   aws_commons.create_s3_uri('${S3_BUCKET}', 'RECREATION_SEARCH_RESULT.csv', 'ca-central-1')
-- );

select aws_s3.table_import_from_s3(
  'fta.recreation_site',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('${S3_BUCKET}', 'RECREATION_SITE.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_site_point',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('${S3_BUCKET}', 'RECREATION_SITE_POINT.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.prov_forest_use',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('${S3_BUCKET}', 'PROV_FOREST_USE.csv', 'ca-central-1')
);


select aws_s3.table_import_from_s3(
               'fta.org_unit',
               '',
               '(
                 FORMAT csv,
                 HEADER true
               )',
               aws_commons.create_s3_uri('${S3_BUCKET}', 'ORG_UNIT.csv', 'ca-central-1')
       );

select aws_s3.table_import_from_s3(
  'fta.recreation_struct_dimen_code',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('${S3_BUCKET}', 'RECREATION_STRUCT_DIMEN_CODE.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_struct_dimen_xref',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('${S3_BUCKET}', 'RECREATION_STRUCT_DIMEN_XREF.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_structure_code',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('${S3_BUCKET}', 'RECREATION_STRUCTURE_CODE.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_structure',
  '',
  '(
    FORMAT csv,
    HEADER true,
    FORCE_NULL
      (
        structure_id,
        structure_count,
        structure_length,
        structure_width,
        structure_area,
        actual_value,
        campsite_number,
        estimated_repair_cost,
        repair_completed_date,
        revision_count,
        entry_userid,
        update_userid,
        entry_timestamp,
        update_timestamp
      )
  )',
  aws_commons.create_s3_uri('${S3_BUCKET}', 'RECREATION_STRUCTURE.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_structure_value',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('${S3_BUCKET}', 'RECREATION_STRUCTURE_VALUE.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_sub_access_code',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('${S3_BUCKET}', 'RECREATION_SUB_ACCESS_CODE.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_trail_segment',
  '',
  '(
    FORMAT csv,
    HEADER true,
    FORCE_NULL
      (
        start_station,
        end_station,
        estimated_repair_cost,
        actual_repair_cost,
        repair_completed_date,
        wheelchair_accessible_ind,
        revision_count,
        entry_userid,
        entry_timestamp,
        update_userid,
        update_timestamp
      )
  )',
  aws_commons.create_s3_uri('${S3_BUCKET}', 'RECREATION_TRAIL_SEGMENT.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_user_days_code',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('${S3_BUCKET}', 'RECREATION_USER_DAYS_CODE.csv', 'ca-central-1')
);
select aws_s3.table_import_from_s3(
               'fta.tenure_application',
               'tenure_app_id,tenure_appname,submission_id,forest_file_id,client_number,client_locn_code,tenure_application_type_code,cascade_split_code,tenure_application_state_code,tenure_app_purp_code,adjudication_ind,adjudicated_by,adjudication_date,decision_date,adjudication_requested_ind,current_assigned_to,image_created_ind,map_report_created_ind,description,min_x,min_y,max_x,max_y,management_unit_number,management_unit_block,management_unit_sub_block,completion_date,finalized_by,submission_date,image_error,map_report_error,spatial_data_error,spatial_ind,file_created_ind,image_height,image_width,meters_per_pixel,image_scale,adjudication_comment,cutting_permit_id,image_map_size_code,org_unit_no,geo_org_unit_no,image_mime_type_code,image_orientation_code,image_create_in_progress_ind,image_create_requested_by,image_create_requested_date,overlay_geo_district_code,bcgs_mapsheet_no,tsa_number,land_district,pulpwood_agreement,utm_zone,revision_count,entry_userid,entry_timestamp,update_userid,update_timestamp,tenure_app_guid,application_decision_message,clearance_status_request_uri,dependent_submission_reference,tenure_amendment_id,business_amendment_id',
               '(
                 FORMAT csv,
                 HEADER true,
                 FORCE_NULL
                   (
                     adjudicated_by,
                     submission_date,
                     adjudication_date,
                     decision_date,
                     completion_date,
                     image_error,
                     map_report_error,
                     spatial_data_error,
                     image_height,
                     image_width,
                     meters_per_pixel,
                     image_scale,
                     org_unit_no,
                     geo_org_unit_no,
                     image_create_requested_date,
                     utm_zone,
                     revision_count,
                     entry_timestamp,
                     update_timestamp,
                     tenure_amendment_id,
                     business_amendment_id
                   )
               )',
               aws_commons.create_s3_uri('${S3_BUCKET}', 'REC_TENURE_APPLICATION.csv', 'ca-central-1')
       );

select aws_s3.table_import_from_s3(
  'fta.tenure_application_images',
  'tenure_app_guid,submission_id,forest_file_id,image_file_name,image_extension,image_file_size,image_map_size_code,image_orientation_code,image_scale,entry_timestamp,update_timestamp,entry_userid,update_userid',
  '(
    FORMAT csv,
    HEADER true,
    FORCE_NULL
      (
        image_file_size,
        entry_timestamp,
        update_timestamp
      )
  )',
  aws_commons.create_s3_uri('${S3_BUCKET}', 'REC_TENURE_APP_IMAGE.csv', 'ca-central-1')
);
