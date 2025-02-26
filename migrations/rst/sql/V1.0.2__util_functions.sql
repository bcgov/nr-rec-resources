-- Function to add created_at, created_by, updated_at, updated_by columns to a table
create or replace function upsert_timestamp_columns(schema_name text, table_name text)
returns void as $$
begin
    execute format('alter table %I.%I add column if not exists updated_at timestamp default now()', schema_name, table_name);
    execute format('alter table %I.%I add column if not exists updated_by text', schema_name, table_name);
    execute format('alter table %I.%I add column if not exists created_at timestamp default now()', schema_name, table_name);
    execute format('alter table %I.%I add column if not exists created_by text', schema_name, table_name);

end;
$$ language plpgsql;


-- Function to check if the row has changed and only update it if it has, so that we keep a clean history
create or replace function update_if_changed()
returns trigger as $$
begin
    if new is distinct from old then
        return new;
    else
        return null;
    end if;
end;
$$ language plpgsql;


-- Function to set up history tracking on a table with temporal_tables
create or replace function setup_temporal_table(schema_name text, table_name text)
returns void language plpgsql as $$
declare
    trigger_name text;
    versioning_function text;
    update_trigger_name text;
begin
    trigger_name := table_name || '_versioning_trigger';
    update_trigger_name := table_name || '_update_if_changed_trigger';
    versioning_function := 'versioning';

    -- add the system period column
    execute format(
        'alter table %I.%I add column sys_period tstzrange not null default tstzrange(current_timestamp, null);',
        schema_name, table_name
    );

    -- create the history table
    execute format(
        'create table %I.%I (like %I.%I excluding constraints);',
        schema_name, table_name || '_history', schema_name, table_name
    );

    -- create the versioning trigger on the table
    execute format(
        'create trigger %I before insert or update or delete on %I.%I
        for each row execute procedure %I(''sys_period'', %L, true);',
        trigger_name, schema_name, table_name, versioning_function, schema_name || '.' || table_name || '_history'
    );

    -- create the update trigger on the table that only updates the row if it's changed
    execute format(
        'create trigger %I before update on %I.%I
        for each row execute function update_if_changed();',
        update_trigger_name, schema_name, table_name
    );

    raise notice 'temporal tables setup completed for % and history table %',
        schema_name || '.' || table_name, schema_name || '.' || table_name || '_history';
end;
$$;
