create or replace function upsert_timestamp_columns(schema_name text, table_name text)
returns void as $$
begin
    execute format('alter table %I.%I add column if not exists created_at timestamp default now()', schema_name, table_name);
    execute format('alter table %I.%I add column if not exists created_by text', schema_name, table_name);
    execute format('alter table %I.%I add column if not exists updated_at timestamp default now()', schema_name, table_name);
    execute format('alter table %I.%I add column if not exists updated_by text', schema_name, table_name);
end;
$$ language plpgsql;



create or replace function setup_temporal_table(schema_name text, table_name text)
returns void language plpgsql as $$
declare
    trigger_name text;
    versioning_function text;
begin
    trigger_name := table_name || '_versioning_trigger';
    versioning_function := 'versioning';

    -- add the system period column
    execute format('alter table %I.%I add column sys_period tstzrange not null default tstzrange(current_timestamp, null);', schema_name, table_name);

    -- create the history table
    execute format('create table %I.%I (like %I.%I excluding constraints);', schema_name, table_name || '_history', schema_name, table_name);

    -- create the trigger
    execute format('create trigger %I before insert or update or delete on %I.%I for each row execute procedure %I(''sys_period'', %L, true);',
                   schema_name || table_name || '_versioning_trigger', schema_name, table_name, versioning_function, schema_name || '.' || table_name || '_history');

    raise notice 'temporal tables setup completed for % and history table %', schema_name || '.' || table_name, schema_name || '.' || table_name || '_history';
end;
$$;
