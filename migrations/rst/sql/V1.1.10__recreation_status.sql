-- In the current FTA database the site status is saved in the recreation_comment table as a closure type comment with closure_ind = 'Y'.

-- Creating a code table as there may be status other than open/closed in the future ie: open with advisories
create table if not exists rst.recreation_status_code (
    status_code serial primary key,
    description varchar(120) not null
);

select upsert_timestamp_columns('rst', 'recreation_status_code', true);

select setup_temporal_table('rst', 'recreation_status_code');

insert into rst.recreation_status_code (description)
values
    ('Open'),
    ('Closed');

create table if not exists rst.recreation_status (
    rec_resource_id varchar(200) not null references rst.recreation_resource (rec_resource_id) primary key,
    status_code int not null references rst.recreation_status_code (status_code),
    comment varchar(5000) not null
);

select upsert_timestamp_columns('rst', 'recreation_status');

select setup_temporal_table('rst', 'recreation_status');

create index idx_recreation_status_rec_resource_id on rst.recreation_status(rec_resource_id);
create index idx_recreation_status_status_code on rst.recreation_status(status_code);
