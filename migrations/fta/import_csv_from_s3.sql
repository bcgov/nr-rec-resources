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
