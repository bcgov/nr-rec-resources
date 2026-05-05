INSERT INTO rst.natural_resource_org_unit (
    rec_resource_id,
    org_unit_no,
    org_unit_code,
    org_unit_name,
    location_code,
    org_level_code,
    office_name_code,
    region_no,
    region_code,
    district_no,
    district_code,
    effective_date,
    expiry_date,
    updated_at
)
SELECT
    pfu.forest_file_id,
    ou.org_unit_no,
    ou.org_unit_code,
    ou.org_unit_name,
    ou.location_code,
    ou.org_level_code,
    ou.office_name_code,
    ou.rollup_region_no,
    ou.rollup_region_code,
    ou.rollup_dist_no,
    ou.rollup_dist_code,
    ou.effective_date,
    ou.expiry_date,
    ou.update_timestamp
FROM fta.prov_forest_use pfu
         JOIN fta.org_unit ou
              ON pfu.forest_region = ou.org_unit_no
WHERE pfu.forest_file_id LIKE 'REC%'
    ON CONFLICT (rec_resource_id) DO UPDATE SET
    org_unit_no = excluded.org_unit_no,
                                         org_unit_code = excluded.org_unit_code,
                                         org_unit_name = excluded.org_unit_name,
                                         location_code = excluded.location_code,
                                         org_level_code = excluded.org_level_code,
                                         office_name_code = excluded.office_name_code,
                                         region_no = excluded.region_no,
                                         region_code = excluded.region_code,
                                         district_no = excluded.district_no,
                                         district_code = excluded.district_code,
                                         effective_date = excluded.effective_date,
                                         expiry_date = excluded.expiry_date,
                                         updated_at = excluded.updated_at;
