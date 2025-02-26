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
        recreation_fee_code
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
    rf.recreation_fee_code
from
    fta.recreation_fee rf
    left join fta.recreation_fee_code rfc
        on rf.recreation_fee_code = rfc.recreation_fee_code;
