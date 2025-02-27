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
    rec_comment_type_code = 'CLOS'
on conflict (rec_resource_id, status_code)
do update
set
    comment = excluded.comment
    status_code = excluded.status_code;
