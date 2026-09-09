insert into rst.recreation_agreement_holder (
agreement_holder_id,
rec_resource_id,
client_number,
agreement_start_date,
agreement_end_date,
revision_count,
visible_on_public_website,
partner_relationship_type_code,
updated_at,
updated_by,
created_at,
created_by
)
-- distinct on breaks exact ties: two FTA rows tying on both revision_count and
-- update_timestamp would otherwise each insert under their own id.
select distinct on (a.forest_file_id)
  a.agreement_holder_id,
  a.forest_file_id,
  a.client_number,
  a.agreement_start_date,
  a.agreement_end_date,
  a.revision_count,
  true as visible_on_public_website,
  'SITE_OPERATOR' as partner_relationship_type_code,
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
order by a.forest_file_id, a.agreement_holder_id desc
-- visible_on_public_website and partner_relationship_type_code are owned by RST
-- and deliberately not refreshed here.
on conflict (agreement_holder_id) do update
set
  rec_resource_id = excluded.rec_resource_id,
  client_number = excluded.client_number,
  agreement_start_date = excluded.agreement_start_date,
  agreement_end_date = excluded.agreement_end_date,
  revision_count = excluded.revision_count,
  updated_by      = excluded.updated_by,
  updated_at      = excluded.updated_at,
  created_at      = excluded.created_at,
  created_by      = excluded.created_by;

-- Remove rows that are no longer the current agreement holder in FTA: the
-- resource has none any more, or a different revision now wins.
delete from rst.recreation_agreement_holder rah
where not exists (
    select 1
    from fta.recreation_agreement_holder a
    inner join (
        select forest_file_id, MAX(revision_count) revision_count, MAX(update_timestamp) update_timestamp
        from fta.recreation_agreement_holder
        group by forest_file_id
    ) b on a.forest_file_id = b.forest_file_id and a.revision_count = b.revision_count and a.update_timestamp = b.update_timestamp
    where a.agreement_holder_id = rah.agreement_holder_id
);
