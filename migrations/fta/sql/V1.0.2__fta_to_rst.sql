insert into rst.recreation_resource (rec_resource_id, name, description, site_location)
select
    rp.forest_file_id,
    rp.project_name as name,
    case
        when rc.rec_comment_type_code = 'DESC' then rc.project_comment
        else ''
    end as description,
    rp.site_location
from
    fta.recreation_project rp
left join
    fta.recreation_comment rc
on
    rp.forest_file_id = rc.forest_file_id
on conflict do nothing;

insert into rst.recreation_activity_code (recreation_activity_code, description)
select
    rac.recreation_activity_code,
    rac.description as description
from
    fta.recreation_activity_code rac;


insert into rst.recreation_activity (rec_resource_id, recreation_activity_code)
select
    ra.forest_file_id as rec_resource_id,
    ra.recreation_activity_code
from
    fta.recreation_activity ra;

insert into rst.recreation_status (rec_resource_id, recreation_status_code, description)
select
    forest_file_id,
    case
        when closure_ind = 'Y' then '02' -- Closed
        when closure_ind = 'N' then '01' -- Open
    end as recreation_status_code,
    project_comment as description
from
    fta.recreation_comment
where
    rec_comment_type_code = 'CLOS';
