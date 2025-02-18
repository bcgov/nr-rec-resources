-- Migrate data from fta schema to rst schema
-- Insert into recreation_district_code from fta.recreation_district_code
insert into
    rst.recreation_resource_type_code (rec_resource_type_code, description)
select
    recreation_map_feature_code,
    description
from
    fta.recreation_map_feature_code;

-- Insert into recreation_resource from fta.recreation_project table
insert into
    rst.recreation_resource (
        rec_resource_id,
        name,
        closest_community,
        display_on_public_site
    )
select
    rp.forest_file_id,
    rp.project_name,
    rp.site_location,
    case
        when rp.recreation_view_ind = 'Y' then true
        else false
    end
from
    fta.recreation_project rp;

-- Add description from fta.recreation_comment table
update rst.recreation_resource rr
set
    description = rc.project_comment
from
    fta.recreation_comment rc
where
    rr.rec_resource_id = rc.forest_file_id
    and rc.rec_comment_type_code = 'DESC';

-- Add district_code from recreation_district_xref
update rst.recreation_resource rr
set
    district_code = xref.recreation_district_code
from
    fta.recreation_district_xref xref
where
    rr.rec_resource_id = xref.forest_file_id;

-- Insert into recreation_activity from fta.recreation_activity
insert into
    rst.recreation_activity (rec_resource_id, recreation_activity_code)
select
    ra.forest_file_id as rec_resource_id,
    -- Convert strings codes ie '01', '02' to integers
    cast(ra.recreation_activity_code as int) as recreation_activity_code
from
    fta.recreation_activity ra;

-- Insert into recreation_status from fta.recreation_comment
insert into
    rst.recreation_status (rec_resource_id, status_code, comment)
select
    forest_file_id,
    case
        when closure_ind = 'Y' then 2 -- Closed
        else 1 -- Open
    end as recreation_status_code,
    project_comment as description
from
    fta.recreation_comment
where
    rec_comment_type_code = 'CLOS';

insert into
    rst.recreation_fee (
        rec_resource_id,
        fee_amount,
        fee_start_date,
        fee_end_date,
        monday_ind,
        tuesday_ind,
        wednesday_ind,
        thursday_ind,
        friday_ind,
        saturday_ind,
        sunday_ind,
        recreation_fee_code,
        fee_description
    )
select
    rf.forest_file_id as rec_resource_id,
    rf.fee_amount,
    rf.fee_start_date,
    rf.fee_end_date,
    rf.monday_ind,
    rf.tuesday_ind,
    rf.wednesday_ind,
    rf.thursday_ind,
    rf.friday_ind,
    rf.saturday_ind,
    rf.sunday_ind,
    rf.recreation_fee_code,
    rfc.description as fee_description
from
    fta.recreation_fee rf
    left join fta.recreation_fee_code rfc on rf.recreation_fee_code = rfc.recreation_fee_code on conflict do nothing;
