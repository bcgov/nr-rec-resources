
-- Create table: rst.recreation_control_access_code
CREATE TABLE IF NOT EXISTS rst.recreation_control_access_code
(
    recreation_control_access_code varchar(1) NOT NULL PRIMARY KEY,
    description                    varchar(120),
    effective_date                 date,
    expiry_date                    date,
    update_timestamp               timestamp
);


select upsert_timestamp_columns('rst', 'recreation_control_access_code');

select setup_temporal_table('rst', 'recreation_control_access_code');

comment on table rst.recreation_control_access_code is
    'Describes the Controlled Access Code for a rec resource. E.g. “Gated”, “Restricted Use”.';

comment on column rst.recreation_control_access_code.recreation_control_access_code is
    'The Controlled Access Code for a rec resource. E.g. “Gated”, “Restricted Use”.';

comment on column rst.recreation_control_access_code.description is
    'The description of the Controlled Access Code for a rec resource.';

comment on column rst.recreation_control_access_code.effective_date is
    'The effective date of the Controlled Access Code for a rec resource.';

comment on column rst.recreation_control_access_code.expiry_date is
    'The expiry date of the Controlled Access Code for a rec resource.';

comment on column rst.recreation_control_access_code.update_timestamp is
    'The update timestamp of the Controlled Access Code for a rec resource.';

-- just need the code and descriptions, no need for existing effective and expiry dates as they have no use yet!.
insert into rst.recreation_control_access_code (recreation_control_access_code, description)
values  ('G', 'Gated'),
        ('R', 'Restricted Use');


-- Add control_access_code column to recreation_resource table
alter table rst.recreation_resource
    add column if not exists control_access_code varchar(1)
        references rst.recreation_control_access_code (recreation_control_access_code);

comment on column rst.recreation_resource.control_access_code is
    'Describes the Controlled Access Code for a rec resource. E.g. “Gated”, “Restricted Use”.';
