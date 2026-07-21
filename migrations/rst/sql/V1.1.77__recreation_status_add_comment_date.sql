-- Add comment_date to rst.recreation_status
-- Stores the user-entered date from fta.recreation_comment.comment_date,
-- representing when the closure/status comment was recorded.

alter table rst.recreation_status
    add column if not exists comment_date date;

comment on column rst.recreation_status.comment_date is 'The user-entered date on which the closure/status comment was entered (sourced from fta.recreation_comment.comment_date).';

-- Keep the temporal history table in sync
alter table rst.recreation_status_history
    add column if not exists comment_date date;
