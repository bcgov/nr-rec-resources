update rst.recreation_fee rst_rf
set
    is_deleted = true,
    deleted_at = now(),
    deleted_by = 'FLYWAY'
where not exists (
    select 1
    from fta.recreation_fee rf
    where rf.forest_file_id = rst_rf.rec_resource_id
      and case rf.recreation_fee_code
              when 'C' then 'O'
              when 'H' then 'O'
              when 'D' then 'A'
              when 'P' then 'A'
              when 'T' then 'T'
              end = rst_rf.recreation_fee_code
      and case rf.recreation_fee_code
              when 'C' then 'C'
              when 'H' then 'H'
              when 'D' then 'D'
              when 'P' then 'P'
              when 'T' then null
        end is not distinct from rst_rf.recreation_fee_sub_code
        and rf.monday_ind    = rst_rf.monday_ind
        and rf.tuesday_ind   = rst_rf.tuesday_ind
        and rf.wednesday_ind = rst_rf.wednesday_ind
        and rf.thursday_ind  = rst_rf.thursday_ind
        and rf.friday_ind    = rst_rf.friday_ind
        and rf.saturday_ind  = rst_rf.saturday_ind
        and rf.sunday_ind    = rst_rf.sunday_ind
)
  and rst_rf.is_deleted = false;
