insert into rst.recreation_agreement_holder (
rec_resource_id,
client_number,
agreement_start_date,
agreement_end_date,
revision_count,
updated_at,
updated_by,
created_at,
created_by
)
select
  a.forest_file_id,
  a.client_number,
  a.agreement_start_date,
  a.agreement_end_date,
  a.revision_count,
  a.update_timestamp as updated_at,
  a.update_userid as updated_by,
  a.entry_timestamp as created_at,
  a.entry_userid as created_by
from fta.recreation_agreement_holder a
inner join (
    select forest_file_id, MAX(revision_count) revision_count, MAX(update_timestamp) update_timestamp
    from fta.recreation_agreement_holder
    group by forest_file_id
) b on a.forest_file_id = b.forest_file_id and a.revision_count = b.revision_count and a.update_timestamp = b.update_timestamp
where now() between a.agreement_start_date and a.agreement_end_date
order by a.forest_file_id, a.revision_count desc
on conflict (rec_resource_id) do update
set
  client_number = excluded.client_number,
  agreement_start_date = excluded.agreement_start_date,
  agreement_end_date = excluded.agreement_end_date,
  revision_count = excluded.revision_count,
  updated_by      = excluded.updated_by,
  updated_at      = excluded.updated_at,
  created_at      = excluded.created_at,
  created_by      = excluded.created_by;

-- If an agreement holder row is removed in FTA, remove it in RST
delete from rst.recreation_agreement_holder r
where r.rec_resource_id not in (
    select forest_file_id
    from fta.recreation_agreement_holder a
    where now() between a.agreement_start_date and a.agreement_end_date
);
