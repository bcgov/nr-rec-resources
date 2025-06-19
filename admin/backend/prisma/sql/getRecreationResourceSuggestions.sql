SELECT name, rec_resource_id,
       recreation_resource_type,
       recreation_resource_type_code,
       district_description
FROM recreation_resource_search_view
WHERE similarity(name, $1) > 0.1
   OR similarity(rec_resource_id, $1) > 0.3
ORDER BY GREATEST(
    similarity(name, $1),
    similarity(rec_resource_id, $1)
    ) DESC
LIMIT 30;
