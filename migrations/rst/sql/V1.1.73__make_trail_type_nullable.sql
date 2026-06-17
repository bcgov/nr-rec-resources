alter table if exists rst.recreation_activity_code_trails
    alter column trail_type drop not null;

alter table if exists rst.recreation_activity_code_trails_history
    alter column trail_type drop not null;

comment on column rst.recreation_activity_code_trails.trail_type is 'Classification of the trail based on difficulty (Green, Blue, Black). Nullable — may be unset while difficulty ratings are pending policy confirmation.';
