SELECT
    rr.name,
    rr.rec_resource_id,
    rrtv.description as recreation_resource_type,
    rrtv.rec_resource_type_code as recreation_resource_type_code,
    rd.description as district_description,
    rr.display_on_public_site,
    rr.closest_community,
    rr.rec_status_code
FROM rst.recreation_resource rr
LEFT JOIN rst.recreation_resource_type_view_admin rrtv ON rr.rec_resource_id = rrtv.rec_resource_id
LEFT JOIN rst.recreation_district_code rd ON rr.district_code = rd.district_code
WHERE similarity(rr.name, $1) > 0.1
   OR similarity(rr.closest_community, $1) > 0.1
   OR rr.rec_resource_id ILIKE '%' || $1 || '%'
ORDER BY
	POSITION(UPPER($1) IN UPPER(rr.name)) > 0 DESC,
	CASE WHEN rrtv.rec_resource_type_code IN ('RR', 'RTR') THEN 1 ELSE 0 END ASC,
    CASE WHEN rr.rec_status_code = 'AR' THEN 1 ELSE 0 END ASC,
	GREATEST(
	    similarity(rr.name, $1),
	    similarity(rr.closest_community, $1),
	    similarity(rr.rec_resource_id, $1)
    ) DESC
LIMIT 30;
