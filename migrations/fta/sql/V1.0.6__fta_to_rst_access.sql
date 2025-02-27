insert into
    rst.recreation_sub_access_code (sub_access_code, description)
select
    recreation_sub_access_code as sub_access_code,
    description
from
    fta.recreation_sub_access_code on conflict (sub_access_code) do
update
set
    description = excluded.description;

insert into
    rst.recreation_access (rec_resource_id, access_code, sub_access_code)
select distinct -- distinct is used to avoid duplicate records that exist
    ra.forest_file_id as rec_resource_id,
    ra.recreation_access_code as access_code,
    ra.recreation_sub_access_code as sub_access_code
from
    fta.recreation_access ra on conflict (rec_resource_id, access_code, sub_access_code) do
update
set
    access_code = excluded.access_code,
    sub_access_code = excluded.sub_access_code;
