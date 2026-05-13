drop index if exists rst.recreation_fee_unique_idx;

create unique index recreation_fee_unique_idx
on rst.recreation_fee (
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
where is_deleted = false;
