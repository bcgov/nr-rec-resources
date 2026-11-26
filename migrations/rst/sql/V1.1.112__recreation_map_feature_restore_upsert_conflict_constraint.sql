do $$
begin
  -- Keep this unique key in place because fta upserts use
  -- ON CONFLICT (rec_resource_id, section_id).
  if not exists (
    select 1
    from pg_constraint c
    where c.conrelid = 'rst.recreation_map_feature'::regclass
      and c.contype = 'u'
      and pg_get_constraintdef(c.oid) = 'UNIQUE (rec_resource_id, section_id)'
  ) then
    alter table rst.recreation_map_feature
      add constraint recreation_map_feature_rec_resource_id_section_id_key
      unique (rec_resource_id, section_id);
  end if;
end $$;
