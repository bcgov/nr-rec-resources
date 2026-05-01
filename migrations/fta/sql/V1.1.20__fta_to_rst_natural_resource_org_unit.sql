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
WHERE pfu.forest_file_id LIKE 'REC%';
