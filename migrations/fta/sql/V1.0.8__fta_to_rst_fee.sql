insert into rst.recreation_fee (
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
    updated_at,
    updated_by,
    created_at,
    created_by
)
select distinct on (rf.forest_file_id, rf.recreation_fee_code)
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
    rf.update_timestamp as updated_at,
    rf.update_userid as updated_by,
    rf.entry_timestamp as created_at,
    rf.entry_userid as created_by
from fta.recreation_fee rf
order by rf.forest_file_id, rf.recreation_fee_code, rf.update_timestamp desc
on conflict (rec_resource_id, recreation_fee_code)
do update
set
    fee_amount = excluded.fee_amount,
    fee_start_date = excluded.fee_start_date,
    fee_end_date = excluded.fee_end_date,
    monday_ind = excluded.monday_ind,
    tuesday_ind = excluded.tuesday_ind,
    wednesday_ind = excluded.wednesday_ind,
    thursday_ind = excluded.thursday_ind,
    friday_ind = excluded.friday_ind,
    saturday_ind = excluded.saturday_ind,
    sunday_ind = excluded.sunday_ind,
    updated_at = excluded.updated_at,
    updated_by = excluded.updated_by
where rst.recreation_fee.updated_at is distinct from excluded.updated_at
or rst.recreation_fee.updated_by is distinct from excluded.updated_by;
