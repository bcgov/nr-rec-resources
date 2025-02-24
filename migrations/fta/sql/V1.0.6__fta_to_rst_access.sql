insert into
    rst.recreation_sub_access_code (sub_access_code, description)
select
    recreation_sub_access_code as sub_access_code,
    description
from
    fta.recreation_sub_access_code;

insert into
    rst.recreation_access (rec_resource_id, access_code, sub_access_code)
select
    ra.forest_file_id as rec_resource_id,
    ra.recreation_access_code as access_code,
    ra.recreation_sub_access_code as sub_access_code
from
    fta.recreation_access ra;
