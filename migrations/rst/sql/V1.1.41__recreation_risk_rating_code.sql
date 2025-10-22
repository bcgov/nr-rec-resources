create table if not exists rst.recreation_risk_rating_code (
    risk_rating_code varchar(2) primary key,
    description       varchar(100) not null
);

select upsert_timestamp_columns ('rst', 'recreation_risk_rating_code', true);

select setup_temporal_table ('rst', 'recreation_risk_rating_code');

comment on table rst.recreation_risk_rating_code is 'Codes describing the Recreation Risk Rating for a project.';

comment on column rst.recreation_risk_rating_code.risk_rating_code is 'Code describing the Recreation Risk Rating.';

comment on column rst.recreation_risk_rating_code.description is 'Description of the code value';

insert into rst.recreation_risk_rating_code (risk_rating_code, description)
values
('H', 'High'),
('L', 'Low'),
('M', 'Moderate'),
('V', 'Very High');

alter table rst.recreation_resource
add column if not exists risk_rating_code varchar(2)
references rst.recreation_risk_rating_code (risk_rating_code);
