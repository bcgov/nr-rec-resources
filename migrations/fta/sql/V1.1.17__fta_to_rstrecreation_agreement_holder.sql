insert into rst.recreation_agreement_holder (
agreement_holder_id,
rec_resource_id,
client_number,
agreement_start_date,
agreement_end_date,
revision_count,
visible_on_public_website,
recreation_operator,
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
  (
    coalesce(a.agreement_start_date, current_date) <= current_date
    and a.agreement_end_date is not null
    and a.agreement_end_date > current_date
    and exists (
      select 1
      from rst.recreation_fee rf
      where rf.rec_resource_id = a.forest_file_id
        and rf.is_deleted = false
    )
  ) as recreation_operator,
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
-- visible_on_public_website, partner_relationship_type_code, the agreement dates
-- and cancelled are owned by RST and deliberately not refreshed here. The dates
-- are editable in the admin app, so refreshing them would silently revert staff
-- edits on the next sync; the tradeoff is that FTA date changes no longer
-- propagate after the initial insert. recreation_operator is derived from FTA
-- rather than edited in RST, so it does keep refreshing.
on conflict (agreement_holder_id) do update
set
  rec_resource_id = excluded.rec_resource_id,
  client_number = excluded.client_number,
  revision_count = excluded.revision_count,
  recreation_operator = excluded.recreation_operator,
  updated_by      = excluded.updated_by,
  updated_at      = excluded.updated_at,
  created_at      = excluded.created_at,
  created_by      = excluded.created_by;

-- Remove rows that are no longer the current agreement holder in FTA: the
-- resource has none any more, or a different revision now wins.
-- Restricted to FTA-originated ids. RST-created partners take identity values
-- above 1000000 (see the agreement_holder_id column comment) and have no FTA
-- counterpart, so without this guard every partner added through the admin app
-- would be deleted on the next sync.
delete from rst.recreation_agreement_holder rah
where rah.agreement_holder_id < 1000000
  and not exists (
    select 1
    from fta.recreation_agreement_holder a
    inner join (
        select forest_file_id, MAX(revision_count) revision_count, MAX(update_timestamp) update_timestamp
        from fta.recreation_agreement_holder
        group by forest_file_id
    ) b on a.forest_file_id = b.forest_file_id and a.revision_count = b.revision_count and a.update_timestamp = b.update_timestamp
    where a.agreement_holder_id = rah.agreement_holder_id
);
