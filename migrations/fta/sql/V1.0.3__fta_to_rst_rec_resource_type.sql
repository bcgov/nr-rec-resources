insert into
    rst.recreation_resource_type_code (rec_resource_type_code, description)
select
    recreation_map_feature_code as rec_resource_type_code,
    description
from fta.recreation_map_feature_code
on conflict (rec_resource_type_code)
do nothing; -- on conflict do nothing as we made changes to the descriptions
