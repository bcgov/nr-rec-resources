INSERT INTO rst.recreation_resource_status_code (
    recreation_resource_status_code,
    description,
    effective_date,
    expiry_date,
    update_timestamp
)
SELECT
    recreation_file_status_code,
    description,
    effective_date,
    expiry_date,
    update_timestamp
FROM fta.recreation_file_status_code
    ON CONFLICT (recreation_resource_status_code) DO UPDATE SET
    description = excluded.description,
                                                         effective_date = excluded.effective_date,
                                                         expiry_date = excluded.expiry_date,
                                                         update_timestamp = excluded.update_timestamp;
