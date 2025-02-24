-- FTA structure_code ids were all over the place, so using serial id.
insert into
    rst.recreation_structure (rec_resource_id, structure_code)
select
    fta.recreation_structure.forest_file_id as rec_resource_id,
    rst.recreation_structure_code.structure_code as structure_code
from
    fta.recreation_structure
    join fta.recreation_structure_code on fta.recreation_structure.recreation_structure_code = fta.recreation_structure_code.recreation_structure_code
    join rst.recreation_structure_code on fta.recreation_structure_code.description = rst.recreation_structure_code.description;
