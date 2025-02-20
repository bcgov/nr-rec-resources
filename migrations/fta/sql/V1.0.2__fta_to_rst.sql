insert into
    rst.recreation_resource_type_code (rec_resource_type_code, description)
select
    recreation_map_feature_code,
    description
from
    fta.recreation_map_feature_code;

INSERT INTO
    rst.recreation_resource (
        rec_resource_id,
        name,
        description,
        closest_community,
        display_on_public_site,
        rec_resource_type
    )
SELECT
    rp.forest_file_id,
    rp.project_name AS name,
    CASE
        WHEN rc.rec_comment_type_code = 'DESC' THEN rc.project_comment
        ELSE ''
    END AS description,
    rp.site_location AS closest_community,
    CASE
        WHEN rp.recreation_view_ind = 'Y' THEN TRUE
        ELSE FALSE
    END AS display_on_public_site,
    rmf.recreation_map_feature_code
FROM
    fta.recreation_project rp
    LEFT JOIN fta.recreation_comment rc ON rp.forest_file_id = rc.forest_file_id
    LEFT JOIN fta.recreation_map_feature rmf ON rp.forest_file_id = rmf.forest_file_id
ON CONFLICT DO NOTHING;


INSERT INTO
    rst.recreation_campsite (
        rec_resource_id,
        campsite_count
    )
SELECT
    rp.forest_file_id,
    COALESCE(c.campsite_count, 0) AS campsite_count
FROM
    fta.recreation_project rp
    LEFT JOIN (
        SELECT 
            forest_file_id, 
            COUNT(*) AS campsite_count
        FROM fta.recreation_defined_campsite
        GROUP BY forest_file_id
    ) c ON rp.forest_file_id = c.forest_file_id 
ON CONFLICT DO NOTHING;


insert into
    rst.recreation_activity (rec_resource_id, recreation_activity_code)
select
    ra.forest_file_id as rec_resource_id,
    -- Convert strings codes ie '01', '02' to integers
    cast(ra.recreation_activity_code as int) as recreation_activity_code
from
    fta.recreation_activity ra;

insert into
    rst.recreation_status (rec_resource_id, status_code, comment)
select
    forest_file_id,
    case
        when closure_ind = 'Y' then 2 -- Closed
        else 1 -- Open
    end as recreation_status_code,
    project_comment as description
from
    fta.recreation_comment
where
    rec_comment_type_code = 'CLOS';

INSERT INTO rst.recreation_fee (
    rec_resource_id,
    fee_amount,
    fee_start_date,
    fee_end_date,
    monday_ind,
    tuesday_ind,
    wednesday_ind,
    thursday_ind,
    friday_ind,
    saturday_ind,
    sunday_ind,
    recreation_fee_code,
    fee_description
)
SELECT
    rf.forest_file_id AS rec_resource_id,
    rf.fee_amount,
    rf.fee_start_date,
    rf.fee_end_date,
    rf.monday_ind,
    rf.tuesday_ind,
    rf.wednesday_ind,
    rf.thursday_ind,
    rf.friday_ind,
    rf.saturday_ind,
    rf.sunday_ind,
    rf.recreation_fee_code,
    rfc.description AS fee_description
FROM fta.recreation_fee rf
LEFT JOIN fta.recreation_fee_code rfc
    ON rf.recreation_fee_code = rfc.recreation_fee_code
ON CONFLICT DO NOTHING;
