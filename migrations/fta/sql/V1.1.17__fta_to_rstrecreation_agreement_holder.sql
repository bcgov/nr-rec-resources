INSERT INTO rst.recreation_agreement_holder (
rec_resource_id,
client_number,
agreement_start_date,
agreement_end_date,
revision_count
)
SELECT
a.forest_file_id, a.client_number, a.agreement_start_date, a.agreement_end_date, a.revision_count
FROM fta.recreation_agreement_holder a
INNER JOIN (
    SELECT forest_file_id, MAX(revision_count) revision_count, MAX(update_timestamp) update_timestamp
    FROM fta.recreation_agreement_holder
    GROUP BY forest_file_id
) b ON a.forest_file_id = b.forest_file_id AND a.revision_count = b.revision_count AND a.update_timestamp = b.update_timestamp
WHERE NOW() BETWEEN a.agreement_start_date AND a.agreement_end_date
ORDER BY a.forest_file_id, a.revision_count DESC
ON conflict (rec_resource_id) do UPDATE
SET
  client_number = excluded.client_number,
  agreement_start_date = excluded.agreement_start_date,
  agreement_end_date = excluded.agreement_end_date,
  revision_count = excluded.revision_count
