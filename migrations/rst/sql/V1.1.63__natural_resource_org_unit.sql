create table if not exists rst.natural_resource_org_unit (
    rec_resource_id     varchar(10)  primary key,
    org_unit_no         numeric(10)  not null,
    org_unit_code       varchar(6)   not null,
    org_unit_name       varchar(100) not null,
    location_code       varchar(3)  ,
    org_level_code      varchar(1)   ,
    office_name_code    varchar(2) ,
    region_no           numeric(10) ,
    region_code         varchar(6) ,
    district_no         numeric(10),
    district_code       varchar(6),
    effective_date      date,
    expiry_date         date ,
    updated_at          date

    );

select upsert_timestamp_columns ('rst', 'natural_resource_org_unit',true);

select setup_temporal_table ('rst', 'natural_resource_org_unit',true);

comment on table rst.natural_resource_org_unit is 'Stores natural resource organization unit details associated with recreation resource files.';

comment on column rst.natural_resource_org_unit.rec_resource_id is 'The recreation resource file identifier, sourced from the forest file id.';

comment on column rst.natural_resource_org_unit.org_unit_no is 'Unique numeric identifier for the ministry organization unit.';

comment on column rst.natural_resource_org_unit.org_unit_code is 'Short alphanumeric code representing the organization unit.';

comment on column rst.natural_resource_org_unit.org_unit_name is 'Full descriptive name of the organization unit.';

comment on column rst.natural_resource_org_unit.location_code is 'Code identifying the physical location of the organization unit.';

comment on column rst.natural_resource_org_unit.org_level_code is 'Code indicating the hierarchical level of the organization unit.';

comment on column rst.natural_resource_org_unit.office_name_code is 'Code representing the office name of the organization unit.';

comment on column rst.natural_resource_org_unit.region_no is 'Numeric identifier of the region this organization unit rolls up to.';

comment on column rst.natural_resource_org_unit.region_code is 'Code of the region this organization unit rolls up to.';

comment on column rst.natural_resource_org_unit.district_no is 'Numeric identifier of the district this organization unit rolls up to.';

comment on column rst.natural_resource_org_unit.district_code is 'Code of the district this organization unit rolls up to.';

comment on column rst.natural_resource_org_unit.effective_date is 'The effective date of the organization unit record.';

comment on column rst.natural_resource_org_unit.expiry_date is 'The expiry date of the organization unit record.';

comment on column rst.natural_resource_org_unit.updated_at is 'The timestamp when the record was last updated.';
