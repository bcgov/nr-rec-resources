-- Add project_established_date column to recreation_resource table
alter table rst.recreation_resource
add column project_established_date date;

comment on column rst.recreation_resource.project_established_date is 'The date when the recreation project was officially established or created.';
