insert into
    rst.recreation_status (rec_resource_id, status_code, comment, updated_at, updated_by, created_at, created_by)
select
    forest_file_id as rec_resource_id,
    case
        when closure_ind = 'Y' then 2 -- Closed
        else 1 -- Open
    end as recreation_status_code,
    project_comment as description,
    update_timestamp as updated_at,
    update_userid as updated_by,
    entry_timestamp as created_at,
    entry_userid as created_by
from
    fta.recreation_comment
where
    rec_comment_type_code = 'CLOS'
on conflict (rec_resource_id)
do update
set
    comment = excluded.comment,
    status_code = excluded.status_code,
    updated_at = excluded.updated_at,
    updated_by = excluded.updated_by
where
    rst.recreation_status.updated_at is distinct from excluded.updated_at
    or rst.recreation_status.updated_by is distinct from excluded.updated_by;
