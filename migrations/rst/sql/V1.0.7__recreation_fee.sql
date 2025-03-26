create table if not exists rst.recreation_fee_code (
    recreation_fee_code varchar(1) primary key,
    description varchar(120) not null
);

select upsert_timestamp_columns ('rst', 'recreation_fee_code', true);

select setup_temporal_table ('rst', 'recreation_fee_code');

comment on table rst.recreation_fee_code is 'Recreation fee codes for classification of fees within a project';

comment on column rst.recreation_fee_code.recreation_fee_code is 'A code indicating a specific recreation fee type. E.g., C for Camping, D for Day Use, H for Hut.';

comment on column rst.recreation_fee_code.description is 'Description of the recreation fee type.';

insert into
    rst.recreation_fee_code (recreation_fee_code, description)
values
    ('C', 'Camping'),
    ('D', 'Day Use'),
    ('H', 'Hut'),
    ('P', 'Parking'),
    ('T', 'Trail Use');

create table if not exists rst.recreation_fee (
    id serial primary key,
    rec_resource_id varchar(200) not null references rst.recreation_resource (rec_resource_id),
    fee_amount int null,
    fee_start_date date null,
    fee_end_date date null,
    monday_ind varchar(1) default 'N',
    tuesday_ind varchar(1) default 'N',
    wednesday_ind varchar(1) default 'N',
    thursday_ind varchar(1) default 'N',
    friday_ind varchar(1) default 'N',
    saturday_ind varchar(1) default 'N',
    sunday_ind varchar(1) default 'N',
    recreation_fee_code varchar(1) not null references rst.recreation_fee_code (recreation_fee_code),
    unique (rec_resource_id, recreation_fee_code)
);

select upsert_timestamp_columns ('rst', 'recreation_fee');

select setup_temporal_table ('rst', 'recreation_fee');

create index idx_recreation_fee_rec_resource_id on rst.recreation_fee(rec_resource_id);
