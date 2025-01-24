create extension if not exists aws_s3 cascade;

begin;

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
  aws_commons.create_s3_uri('rst-fta-dataload-oracle', 'RECREATION_PROJECT.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_access',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('rst-fta-dataload-oracle', 'RECREATION_ACCESS.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_access_code',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('rst-fta-dataload-oracle', 'RECREATION_ACCESS_CODE.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_access_xref',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('rst-fta-dataload-oracle', 'RECREATION_ACCESS_XREF.csv', 'ca-central-1')
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
  aws_commons.create_s3_uri('rst-fta-dataload-oracle', 'RECREATION_ACTIVITY.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_activity_code',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('rst-fta-dataload-oracle', 'RECREATION_ACTIVITY_CODE.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_agreement_holder',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('rst-fta-dataload-oracle', 'RECREATION_AGREEMENT_HOLDER.csv', 'ca-central-1')
);

-- come back to this, file wasn't in s3
-- select aws_s3.table_import_from_s3(
--   'fta.recreation_attachment',
--   '',
--   '(
--     FORMAT csv,
--     HEADER true
--   )',
--   aws_commons.create_s3_uri('rst-fta-dataload-oracle', 'RECREATION_ATTACHMENT.csv', 'ca-central-1')
-- );

select aws_s3.table_import_from_s3(
  'fta.recreation_comment',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('rst-fta-dataload-oracle', 'RECREATION_COMMENT.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_control_access_code',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('rst-fta-dataload-oracle', 'RECREATION_CONTROL_ACCESS_CODE.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_def_cs_rpr_history',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('rst-fta-dataload-oracle', 'RECREATION_DEF_CS_RPR_HISTORY.csv', 'ca-central-1')
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
  aws_commons.create_s3_uri('rst-fta-dataload-oracle', 'RECREATION_DEFINED_CAMPSITE.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_district_code',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('rst-fta-dataload-oracle', 'RECREATION_DISTRICT_CODE.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_district_xref',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('rst-fta-dataload-oracle', 'RECREATION_DISTRICT_XREF.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_feature_code',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('rst-fta-dataload-oracle', 'RECREATION_FEATURE_CODE.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_fee_code',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('rst-fta-dataload-oracle', 'RECREATION_FEE_CODE.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_fee',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('rst-fta-dataload-oracle', 'RECREATION_FEE.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_file_status_code',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('rst-fta-dataload-oracle', 'RECREATION_FILE_STATUS_CODE.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_file_type_code',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('rst-fta-dataload-oracle', 'RECREATION_FILE_TYPE_CODE.csv', 'ca-central-1')
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
  aws_commons.create_s3_uri('rst-fta-dataload-oracle', 'RECREATION_INSPECTION_REPORT.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_maintain_std_code',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('rst-fta-dataload-oracle', 'RECREATION_MAINTAIN_STD_CODE.csv', 'ca-central-1')
);

-- This file is not currently in s3
-- select aws_s3.table_import_from_s3(
--   'fta.recreation_map_feature_geom',
--   '',
--   '(
--     FORMAT csv,
--     HEADER true
--   )',
--   aws_commons.create_s3_uri('rst-fta-dataload-oracle', 'RECREATION_MAP_FEATURE_GEOM.csv', 'ca-central-1')
-- );

select aws_s3.table_import_from_s3(
  'fta.recreation_map_feature_xguid',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('rst-fta-dataload-oracle', 'RECREATION_MAP_FEATURE_XGUID.csv', 'ca-central-1')
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
  aws_commons.create_s3_uri('rst-fta-dataload-oracle', 'RECREATION_MAP_FEATURE.csv', 'ca-central-1')
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
  aws_commons.create_s3_uri('rst-fta-dataload-oracle', 'RECREATION_OBJECTIVE.csv', 'ca-central-1')
);

-- This file was empty, likely not used but should verify
select aws_s3.table_import_from_s3(
  'fta.recreation_occupancy_code',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('rst-fta-dataload-oracle', 'RECREATION_OCCUPANCY_CODE.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_remed_repair_code',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('rst-fta-dataload-oracle', 'RECREATION_REMED_REPAIR_CODE.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_risk_evaluation',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('rst-fta-dataload-oracle', 'RECREATION_RISK_EVALUATION.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_risk_rating_code',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('rst-fta-dataload-oracle', 'RECREATION_RISK_RATING_CODE.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_risk_site',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('rst-fta-dataload-oracle', 'RECREATION_RISK_SITE.csv', 'ca-central-1')
);

-- This file was empty, likely not used but should verify
-- select aws_s3.table_import_from_s3(
--   'fta.recreation_search_result',
--   '',
--   '(
--     FORMAT csv,
--     HEADER true
--   )',
--   aws_commons.create_s3_uri('rst-fta-dataload-oracle', 'RECREATION_SEARCH_RESULT.csv', 'ca-central-1')
-- );

select aws_s3.table_import_from_s3(
  'fta.recreation_site',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('rst-fta-dataload-oracle', 'RECREATION_SITE.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_site_point',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('rst-fta-dataload-oracle', 'RECREATION_SITE_POINT.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_struct_dimen_code',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('rst-fta-dataload-oracle', 'RECREATION_STRUCT_DIMEN_CODE.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_struct_dimen_xref',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('rst-fta-dataload-oracle', 'RECREATION_STRUCT_DIMEN_XREF.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_structure_code',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('rst-fta-dataload-oracle', 'RECREATION_STRUCTURE_CODE.csv', 'ca-central-1')
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
  aws_commons.create_s3_uri('rst-fta-dataload-oracle', 'RECREATION_STRUCTURE.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_structure_value',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('rst-fta-dataload-oracle', 'RECREATION_STRUCTURE_VALUE.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_sub_access_code',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('rst-fta-dataload-oracle', 'RECREATION_SUB_ACCESS_CODE.csv', 'ca-central-1')
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
  aws_commons.create_s3_uri('rst-fta-dataload-oracle', 'RECREATION_TRAIL_SEGMENT.csv', 'ca-central-1')
);

select aws_s3.table_import_from_s3(
  'fta.recreation_user_days_code',
  '',
  '(
    FORMAT csv,
    HEADER true
  )',
  aws_commons.create_s3_uri('rst-fta-dataload-oracle', 'RECREATION_USER_DAYS_CODE.csv', 'ca-central-1')
);

commit;
