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
