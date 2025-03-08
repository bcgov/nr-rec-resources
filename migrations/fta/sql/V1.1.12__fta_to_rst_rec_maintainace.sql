insert into rst.recreation_maintenance (
    rec_resource_id,
    recreation_maintenance_code,
    description
)
select
    rp.forest_file_id as rec_resource_id,
    rp.recreation_maintain_std_code as recreation_maintenance_code,
    rmsc.description
from
    fta.recreation_project rp
    left join fta.recreation_maintain_std_code rmsc
        on rp.recreation_maintain_std_code = rmsc.recreation_maintain_std_code;
