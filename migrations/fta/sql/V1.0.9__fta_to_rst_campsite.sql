insert into
    rst.recreation_campsite (
        rec_resource_id,
        campsite_count
    )
select
    rp.forest_file_id,
    coalesce(c.campsite_count, 0) as campsite_count
from
    fta.recreation_project rp
    left join (
        select
            forest_file_id,
            COUNT(*) as campsite_count
        from fta.recreation_defined_campsite
        group by forest_file_id
    ) c on rp.forest_file_id = c.forest_file_id
on conflict do nothing;
