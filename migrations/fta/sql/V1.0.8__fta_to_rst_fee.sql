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
select distinct on (
        rf.forest_file_id,
        rf.recreation_fee_code,
        rf.monday_ind,
        rf.tuesday_ind,
        rf.wednesday_ind,
        rf.thursday_ind,
        rf.friday_ind,
        rf.saturday_ind,
        rf.sunday_ind
    )
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
order by
    rf.forest_file_id,
    rf.recreation_fee_code,
    rf.monday_ind,
    rf.tuesday_ind,
    rf.wednesday_ind,
    rf.thursday_ind,
    rf.friday_ind,
    rf.saturday_ind,
    rf.sunday_ind,
    rf.update_timestamp desc
on conflict (
    rec_resource_id,
    recreation_fee_code,
    monday_ind,
    tuesday_ind,
    wednesday_ind,
    thursday_ind,
    friday_ind,
    saturday_ind,
    sunday_ind
)
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
    updated_by = excluded.updated_by;


-- If a fee row is removed in FTA, remove it in RST
delete from rst.recreation_fee rst_rf
where not exists (
    select 1
    from fta.recreation_fee rf
    where
        rf.forest_file_id = rst_rf.rec_resource_id
        and rf.recreation_fee_code = rst_rf.recreation_fee_code
        and rf.monday_ind = rst_rf.monday_ind
        and rf.tuesday_ind = rst_rf.tuesday_ind
        and rf.wednesday_ind = rst_rf.wednesday_ind
        and rf.thursday_ind = rst_rf.thursday_ind
        and rf.friday_ind = rst_rf.friday_ind
        and rf.saturday_ind = rst_rf.saturday_ind
        and rf.sunday_ind = rst_rf.sunday_ind
);
