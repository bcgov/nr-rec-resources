insert into
    rst.recreation_activity (rec_resource_id, recreation_activity_code)
select
    ra.forest_file_id as rec_resource_id,
    -- Convert strings codes ie '01', '02' to integers
    cast(ra.recreation_activity_code as int) as recreation_activity_code
from
    fta.recreation_activity ra;
