alter table rst.recreation_fee
add column if not exists recreation_fee_sub_code varchar(30);

create table if not exists rst.recreation_fee_sub_code (
    recreation_fee_code varchar(1) not null references rst.recreation_fee_code (recreation_fee_code),
    recreation_fee_sub_code varchar(30) not null,
    description varchar(120) not null,
    primary key (recreation_fee_code, recreation_fee_sub_code)
);

select upsert_timestamp_columns('rst', 'recreation_fee_sub_code', true);
select setup_temporal_table('rst', 'recreation_fee_sub_code',true);

comment on table rst.recreation_fee_sub_code is 'Recreation fee sub-types that roll up to a fee type.';
comment on column rst.recreation_fee_sub_code.recreation_fee_code is 'Parent recreation fee type code.';
comment on column rst.recreation_fee_sub_code.recreation_fee_sub_code is 'A code indicating a specific recreation fee sub-type.';
comment on column rst.recreation_fee_sub_code.description is 'Description of the recreation fee sub-type.';

insert into rst.recreation_fee_code (recreation_fee_code, description)
values
    ('A', 'Additional fees'),
    ('O', 'Overnight'),
    ('T', 'Trail use')
on conflict (recreation_fee_code)
do update set description = excluded.description;

insert into rst.recreation_fee_sub_code (recreation_fee_code, recreation_fee_sub_code, description)
values
    ('O', 'C', 'Camping'),
    ('O', 'H', 'Huts'),
    ('O', 'CA', 'Cabins'),
    ('T', 'SK', 'Skiing'),
    ('T', 'ST', 'Ski touring'),
    ('T', 'SM', 'Snowmobiling'),
    ('T', 'SS', 'Snowshoeing'),
    ('A', 'D', 'Day use'),
    ('A', 'P', 'Parking')
on conflict (recreation_fee_code, recreation_fee_sub_code)
    do update set description = excluded.description;

-- Drop old unique index before code updates to avoid duplicate-key errors.
drop index if exists rst.recreation_fee_unique_idx;

-- Convert historical fee codes to the new top-level type + subtype taxonomy.
update rst.recreation_fee
set
    recreation_fee_code = 'O',
    recreation_fee_sub_code = 'C'
where recreation_fee_code = 'C';

update rst.recreation_fee
set
    recreation_fee_code = 'O',
    recreation_fee_sub_code = 'H'
where recreation_fee_code = 'H';

update rst.recreation_fee
set
    recreation_fee_code = 'A',
    recreation_fee_sub_code = 'D'
where recreation_fee_code = 'D';

update rst.recreation_fee
set
    recreation_fee_code = 'A',
    recreation_fee_sub_code = 'P'
where recreation_fee_code = 'P';

-- Legacy trail-use rows intentionally keep null subtype until staff updates them.
update rst.recreation_fee
set
    recreation_fee_code = 'T',
    recreation_fee_sub_code = null
where recreation_fee_code = 'T';

delete from rst.recreation_fee_code
where recreation_fee_code in ('C', 'D', 'H', 'P');

alter table rst.recreation_fee
drop constraint if exists recreation_fee_sub_code_fk;

alter table rst.recreation_fee
add constraint recreation_fee_sub_code_fk
foreign key (recreation_fee_code, recreation_fee_sub_code)
references rst.recreation_fee_sub_code (recreation_fee_code, recreation_fee_sub_code);


create unique index recreation_fee_unique_idx
on rst.recreation_fee (
    rec_resource_id,
    recreation_fee_code,
    recreation_fee_sub_code,
    monday_ind,
    tuesday_ind,
    wednesday_ind,
    thursday_ind,
    friday_ind,
    saturday_ind,
    sunday_ind
)
where is_deleted = false and recreation_fee_sub_code is not null;
