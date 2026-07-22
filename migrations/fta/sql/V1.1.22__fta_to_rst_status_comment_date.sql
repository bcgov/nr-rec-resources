-- Backfill rst.recreation_status.comment_date from fta.recreation_comment.
-- Matches the same filter used in V1.0.5 (CLOS type only).
-- Where multiple closure comments exist for a resource, the most recent comment_date is used.

update rst.recreation_status rs
set comment_date = rc.comment_date
from (
    select
        forest_file_id,
        max(comment_date) as comment_date
    from fta.recreation_comment
    where rec_comment_type_code = 'CLOS'
      and comment_date is not null
    group by forest_file_id
) rc
where rc.forest_file_id = rs.rec_resource_id;
