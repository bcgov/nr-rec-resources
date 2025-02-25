create or replace function upsert_timestamp_columns(schema_name text, table_name text)
returns void as $$
begin
    execute format('alter table %I.%I add column if not exists created_at timestamp default now()', schema_name, table_name);
    execute format('alter table %I.%I add column if not exists created_by text', schema_name, table_name);
    execute format('alter table %I.%I add column if not exists updated_at timestamp default now()', schema_name, table_name);
    execute format('alter table %I.%I add column if not exists updated_by text', schema_name, table_name);
end;
$$ language plpgsql;
