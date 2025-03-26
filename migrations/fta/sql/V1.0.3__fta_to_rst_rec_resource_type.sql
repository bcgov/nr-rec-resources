insert into
    rst.recreation_resource_type_code (rec_resource_type_code, description, updated_at)
select
    recreation_map_feature_code as rec_resource_type_code,
    description,
    update_timestamp as updated_at
from fta.recreation_map_feature_code
on conflict (rec_resource_type_code)
do update
set
    description = excluded.description
where
    excluded.description <> rst.recreation_resource_type_code.description;
