create table if not exists rst.recreation_resource_status_code
(
    recreation_resource_status_code varchar(3) not null
        primary key,
    description               varchar(120),
    effective_date            date,
    expiry_date               date,
    update_timestamp          date
);

select upsert_timestamp_columns ('rst', 'recreation_resource_status_code', true);

select setup_temporal_table ('rst', 'recreation_resource_status_code',true);

comment on table recreation_resource_status_code is 'Describes the RECREATION FILE TYPE CODE for categorizing recreation files.';

comment on column recreation_resource_status_code.recreation_resource_status_code is 'The RECREATION FILE TYPE CODE.';

comment on column recreation_resource_status_code.description is 'The description of the RECREATION FILE TYPE CODE.';

comment on column recreation_resource_status_code.effective_date is 'The effective date of the RECREATION FILE TYPE CODE.';

comment on column recreation_resource_status_code.expiry_date is 'The expiry date of the RECREATION FILE TYPE CODE.';

comment on column recreation_resource_status_code.update_timestamp is 'The timestamp when the record was last updated.';
