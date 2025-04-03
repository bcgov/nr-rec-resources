create table rst.recreation_activity_code (
    recreation_activity_code serial primary key,
    description varchar(120)
);

select upsert_timestamp_columns('rst', 'recreation_activity_code', true);

select setup_temporal_table('rst', 'recreation_activity_code');

comment on table rst.recreation_activity_code is 'Activity code types for recreation projects.';

comment on column rst.recreation_activity_code.recreation_activity_code is 'Code describing the Recreation Activity.';

comment on column rst.recreation_activity_code.description is 'Description of the code value.';

insert into rst.recreation_activity_code (description)
values ('Angling'),
       ('Boating'),
       ('Canoeing'),
       ('Kayaking'),
       ('Scuba or skin diving'),
       ('Water skiing'),
       ('Swimming & bathing'),
       ('Beach activities'),
       ('Picnicking'),
       ('Hunting'),
       ('Caving'),
       ('Hiking'),
       ('Mountaineering'),
       ('Nature study'),
       ('Orienteering'),
       ('Viewing'),
       ('Wildlife viewing'),
       ('Gathering & collecting'),
       ('Horseback riding'),
       ('Trail bike riding - motorized'),
       ('Four wheel driving'),
       ('Snowmobiling'),
       ('Snowshoeing'),
       ('Skiing'),
       ('Icefishing'),
       ('Other (see note attached to file)'),
       ('Mountain biking'),
       ('Climbing'),
       ('Sailing'),
       ('Windsurfing'),
       ('Rafting'),
       ('Camping'),
       ('Ski touring');

create table if not exists rst.recreation_activity (
    rec_resource_id varchar(200) not null references rst.recreation_resource (rec_resource_id),
    recreation_activity_code int not null references rst.recreation_activity_code (recreation_activity_code),
    unique (rec_resource_id, recreation_activity_code)
);

select upsert_timestamp_columns('rst', 'recreation_activity');

select setup_temporal_table('rst', 'recreation_activity');

create index idx_recreation_activity_rec_resource_id on rst.recreation_activity(rec_resource_id);

comment on table rst.recreation_activity is 'The types of available activities for a given project.';

comment on column rst.recreation_activity.rec_resource_id is 'File identification assigned to Recreation Resources. Assigned file number. Usually the Licence, Tenure or Private Mark number.';

comment on column rst.recreation_activity.recreation_activity_code is 'Code describing the Recreation Activity.';
