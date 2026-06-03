-- Create temporary table with transformed FTA data
create temp table fta_transformed as
select distinct on (
    rf.forest_file_id,
    case rf.recreation_fee_code
        when 'C' then 'O' when 'H' then 'O'
        when 'D' then 'A' when 'P' then 'A'
        when 'T' then 'T'
    end,
    case rf.recreation_fee_code
        when 'C' then 'C' when 'H' then 'H'
        when 'D' then 'D' when 'P' then 'P'
        when 'T' then null
    end,
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
    case rf.recreation_fee_code
        when 'C' then 'O' when 'H' then 'O'
        when 'D' then 'A' when 'P' then 'A'
        when 'T' then 'T'
    end as recreation_fee_code,
    case rf.recreation_fee_code
        when 'C' then 'C' when 'H' then 'H'
        when 'D' then 'D' when 'P' then 'P'
        when 'T' then null
    end as recreation_fee_sub_code,
    rf.monday_ind,
    rf.tuesday_ind,
    rf.wednesday_ind,
    rf.thursday_ind,
    rf.friday_ind,
    rf.saturday_ind,
    rf.sunday_ind,
    rf.update_timestamp as updated_at,
    rf.update_userid    as updated_by
from fta.recreation_fee rf
order by
    rf.forest_file_id,
    case rf.recreation_fee_code
        when 'C' then 'O' when 'H' then 'O'
        when 'D' then 'A' when 'P' then 'A'
        when 'T' then 'T'
    end,
    case rf.recreation_fee_code
        when 'C' then 'C' when 'H' then 'H'
        when 'D' then 'D' when 'P' then 'P'
        when 'T' then null
    end,
    rf.monday_ind,
    rf.tuesday_ind,
    rf.wednesday_ind,
    rf.thursday_ind,
    rf.friday_ind,
    rf.saturday_ind,
    rf.sunday_ind,
    rf.update_timestamp desc;

-- Update existing active records
update rst.recreation_fee
set
    fee_amount     = ft.fee_amount,
    fee_start_date = ft.fee_start_date,
    fee_end_date   = ft.fee_end_date,
    updated_at     = ft.updated_at,
    updated_by     = ft.updated_by,
    is_deleted     = false,
    deleted_at     = null,
    deleted_by     = null
from fta_transformed ft
where rst.recreation_fee.rec_resource_id = ft.rec_resource_id
  and rst.recreation_fee.recreation_fee_code = ft.recreation_fee_code
  and rst.recreation_fee.recreation_fee_sub_code is not distinct from ft.recreation_fee_sub_code
  and rst.recreation_fee.monday_ind = ft.monday_ind
  and rst.recreation_fee.tuesday_ind = ft.tuesday_ind
  and rst.recreation_fee.wednesday_ind = ft.wednesday_ind
  and rst.recreation_fee.thursday_ind = ft.thursday_ind
  and rst.recreation_fee.friday_ind = ft.friday_ind
  and rst.recreation_fee.saturday_ind = ft.saturday_ind
  and rst.recreation_fee.sunday_ind = ft.sunday_ind
  and rst.recreation_fee.is_deleted = false;

-- Insert new records not yet in rst.recreation_fee
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
    recreation_fee_sub_code,
    updated_at,
    updated_by,
    created_at,
    created_by
)
select
    ft.rec_resource_id,
    ft.fee_amount,
    ft.fee_start_date,
    ft.fee_end_date,
    ft.monday_ind,
    ft.tuesday_ind,
    ft.wednesday_ind,
    ft.thursday_ind,
    ft.friday_ind,
    ft.saturday_ind,
    ft.sunday_ind,
    ft.recreation_fee_code,
    ft.recreation_fee_sub_code,
    ft.updated_at,
    ft.updated_by,
    rf.entry_timestamp  as created_at,
    rf.entry_userid     as created_by
from fta_transformed ft
join fta.recreation_fee rf
    on rf.forest_file_id = ft.rec_resource_id
    and case rf.recreation_fee_code
            when 'C' then 'O' when 'H' then 'O'
            when 'D' then 'A' when 'P' then 'A'
            when 'T' then 'T'
        end = ft.recreation_fee_code
    and case rf.recreation_fee_code
            when 'C' then 'C' when 'H' then 'H'
            when 'D' then 'D' when 'P' then 'P'
            when 'T' then null
        end is not distinct from ft.recreation_fee_sub_code
where not exists (
    select 1
    from rst.recreation_fee rrf
    where rrf.rec_resource_id = ft.rec_resource_id
      and rrf.recreation_fee_code = ft.recreation_fee_code
      and rrf.recreation_fee_sub_code is not distinct from ft.recreation_fee_sub_code
      and rrf.monday_ind = ft.monday_ind
      and rrf.tuesday_ind = ft.tuesday_ind
      and rrf.wednesday_ind = ft.wednesday_ind
      and rrf.thursday_ind = ft.thursday_ind
      and rrf.friday_ind = ft.friday_ind
      and rrf.saturday_ind = ft.saturday_ind
      and rrf.sunday_ind = ft.sunday_ind
      and rrf.is_deleted = false
);

-- Soft-delete active rows no longer in FTA.
update rst.recreation_fee rst_rf
set
    is_deleted = true,
    deleted_at = now(),
    deleted_by = 'FLYWAY'
where not exists (
    select 1
    from fta_transformed ft
    where ft.rec_resource_id = rst_rf.rec_resource_id
      and ft.recreation_fee_code = rst_rf.recreation_fee_code
      and ft.recreation_fee_sub_code is not distinct from rst_rf.recreation_fee_sub_code
      and ft.monday_ind = rst_rf.monday_ind
      and ft.tuesday_ind = rst_rf.tuesday_ind
      and ft.wednesday_ind = rst_rf.wednesday_ind
      and ft.thursday_ind = rst_rf.thursday_ind
      and ft.friday_ind = rst_rf.friday_ind
      and ft.saturday_ind = rst_rf.saturday_ind
      and ft.sunday_ind = rst_rf.sunday_ind
)
  and rst_rf.is_deleted = false;

-- Clean up temporary table
drop table fta_transformed;
