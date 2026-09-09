create table if not exists rst.recreation_partner_relationship_type_code (
    partner_relationship_type_code varchar(20) primary key,
    description varchar(120) not null
);

select upsert_timestamp_columns ('rst', 'recreation_partner_relationship_type_code', true);

select setup_temporal_table ('rst', 'recreation_partner_relationship_type_code', false);

comment on table rst.recreation_partner_relationship_type_code is 'Codes describing the type of relationship a partner holds with a recreation resource (e.g. Site Operator). Not FTA-synced; managed internally.';

comment on column rst.recreation_partner_relationship_type_code.partner_relationship_type_code is 'Code identifying the partner relationship type.';

comment on column rst.recreation_partner_relationship_type_code.description is 'Description of the partner relationship type.';

insert into rst.recreation_partner_relationship_type_code (partner_relationship_type_code, description)
values
    ('SITE_OPERATOR', 'Site Operator')
on conflict (partner_relationship_type_code) do nothing;
