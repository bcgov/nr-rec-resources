-- ============================================================================
-- V1.1.43 - Enhanced temporal table utilities (schema sync)
-- Concise reference: provides helpers to keep _history tables aligned with
-- their source tables and to install/refresh temporal triggers.
-- Dependencies: V1.0.2__util_functions.sql, temporal_tables extension
-- ============================================================================

-- sync_temporal_table_schema(schema_name text, table_name text)
-- Purpose: Add any missing columns from source -> history. Returns JSONB
-- Notes: Non-destructive (only adds columns); does not modify triggers.
create or replace function sync_temporal_table_schema(schema_name text, table_name text)
returns jsonb language plpgsql as $$
declare
    col_record record;
    added_columns jsonb := '[]'::jsonb;
    column_info jsonb;
    col_def text;
begin
    -- Find columns in source table that don't exist in history table
    for col_record in
        select
            c.column_name,
            c.data_type,
            c.character_maximum_length,
            c.numeric_precision,
            c.numeric_scale,
            c.column_default,
            c.is_nullable,
            c.udt_name
        from information_schema.columns c
        where c.table_schema = sync_temporal_table_schema.schema_name
        and c.table_name = sync_temporal_table_schema.table_name
        and c.column_name not in (
            select h.column_name
            from information_schema.columns h
            where h.table_schema = sync_temporal_table_schema.schema_name
            and h.table_name = sync_temporal_table_schema.table_name || '_history'
        )
        -- Exclude system period column as it's managed separately
        and c.column_name != 'sys_period'
        order by c.ordinal_position
    loop
        -- Build column definition based on data type
        col_def := case
            when col_record.character_maximum_length is not null then
                col_record.data_type || '(' || col_record.character_maximum_length || ')'
            when col_record.numeric_precision is not null then
                col_record.data_type || '(' || col_record.numeric_precision ||
                coalesce(',' || col_record.numeric_scale, '') || ')'
            when col_record.data_type = 'ARRAY' then
                col_record.udt_name
            else
                col_record.data_type
        end;

        -- Execute ALTER TABLE for the missing column
        execute format(
            'alter table %I.%I add column %I %s %s %s',
            sync_temporal_table_schema.schema_name,
            sync_temporal_table_schema.table_name || '_history',
            col_record.column_name,
            col_def,
            case when col_record.is_nullable = 'NO' then 'not null' else '' end,
            case
                when col_record.column_default is not null
                then 'default ' || col_record.column_default
                else ''
            end
        );

        -- Build JSON object with column info
        column_info := jsonb_build_object(
            'column_name', col_record.column_name,
            'data_type', col_def,
            'nullable', col_record.is_nullable = 'YES',
            'has_default', col_record.column_default is not null
        );

        -- Add to the list of added columns
        added_columns := added_columns || column_info;

        raise notice 'Added column "%" (type: %) to %.%_history',
            col_record.column_name, col_def, sync_temporal_table_schema.schema_name, sync_temporal_table_schema.table_name;
    end loop;

    if jsonb_array_length(added_columns) > 0 then
        raise notice 'Schema synchronization completed for %.%: % column(s) added',
            sync_temporal_table_schema.schema_name, sync_temporal_table_schema.table_name, jsonb_array_length(added_columns);
    else
        raise notice 'Schema synchronization completed for %.%: No new columns to add',
            sync_temporal_table_schema.schema_name, sync_temporal_table_schema.table_name;
    end if;

    return jsonb_build_object(
        'table', sync_temporal_table_schema.schema_name || '.' || sync_temporal_table_schema.table_name,
        'columns_added', added_columns,
        'count', jsonb_array_length(added_columns)
    );
end;
$$;

comment on function sync_temporal_table_schema(text, text) is
'Synchronizes history table schema with source table by adding missing columns. Returns JSON with details of added columns.';


-- setup_temporal_table(schema_name text, table_name text, auto_sync boolean default false)
-- Purpose: Ensure temporal tracking for a table. Creates/ensures sys_period,
--          creates history table if missing, optionally syncs schema, and
--          (re)installs versioning and update-if-changed triggers.
-- Notes: Idempotent. If auto_sync=true and history exists, calls
--        sync_temporal_table_schema(schema_name, table_name).
create or replace function setup_temporal_table(
    schema_name text,
    table_name text,
    auto_sync boolean default false
)
returns void language plpgsql as $$
declare
    trigger_name text;
    versioning_function text;
    update_trigger_name text;
    history_exists boolean;
    sync_result jsonb;
begin
    trigger_name := setup_temporal_table.table_name || '_versioning_trigger';
    update_trigger_name := setup_temporal_table.table_name || '_update_if_changed_trigger';
    versioning_function := 'versioning';

    -- Check if history table exists
    select exists (
        select 1 from information_schema.tables t
        where t.table_schema = setup_temporal_table.schema_name
        and t.table_name = setup_temporal_table.table_name || '_history'
    ) into history_exists;

    -- Add the system period column if it doesn't exist
    execute format(
        'alter table %I.%I add column if not exists sys_period tstzrange not null default tstzrange(current_timestamp, null);',
        setup_temporal_table.schema_name, setup_temporal_table.table_name
    );

    -- Create the history table if it doesn't exist
    if not history_exists then
        execute format(
            'create table %I.%I (like %I.%I excluding constraints excluding indexes);',
            setup_temporal_table.schema_name, setup_temporal_table.table_name || '_history',
            setup_temporal_table.schema_name, setup_temporal_table.table_name
        );
        raise notice 'Created history table %.%_history', setup_temporal_table.schema_name, setup_temporal_table.table_name;
    elsif auto_sync then
        -- Sync schema if table exists and auto_sync is enabled
        sync_result := sync_temporal_table_schema(setup_temporal_table.schema_name, setup_temporal_table.table_name);
        raise notice 'Auto-sync result: %', sync_result::text;
    end if;

    -- Drop existing triggers if they exist (for idempotency)
    execute format(
        'drop trigger if exists %I on %I.%I;',
        trigger_name, setup_temporal_table.schema_name, setup_temporal_table.table_name
    );

    execute format(
        'drop trigger if exists %I on %I.%I;',
        update_trigger_name, setup_temporal_table.schema_name, setup_temporal_table.table_name
    );

    -- Create the versioning trigger
    execute format(
        'create trigger %I before insert or update or delete on %I.%I
        for each row execute procedure %I(''sys_period'', %L, true);',
        trigger_name, setup_temporal_table.schema_name, setup_temporal_table.table_name, versioning_function,
        setup_temporal_table.schema_name || '.' || setup_temporal_table.table_name || '_history'
    );

    -- Create the update trigger that only updates if changed
    execute format(
        'create trigger %I before update on %I.%I
        for each row execute function update_if_changed();',
        update_trigger_name, setup_temporal_table.schema_name, setup_temporal_table.table_name
    );

    raise notice 'Temporal tables setup completed for %.% and history table %_history',
        setup_temporal_table.schema_name, setup_temporal_table.table_name, setup_temporal_table.table_name;
end;
$$;

comment on function setup_temporal_table(text, text, boolean) is
'Sets up temporal table tracking for a table. When auto_sync is true, synchronizes history table schema with source table.';


-- sync_all_temporal_tables(schema_name text)
-- Purpose: Batch sync all tables in a schema that have corresponding _history
--          tables. Returns a JSON summary of per-table sync results.
-- Notes: Non-destructive; only adds missing columns.
create or replace function sync_all_temporal_tables(schema_name text)
returns jsonb language plpgsql as $$
declare
    table_record record;
    all_results jsonb := '[]'::jsonb;
    sync_result jsonb;
begin
    -- Find all tables that have corresponding history tables
    for table_record in
        select distinct
            t.table_name as tbl_name
        from information_schema.tables t
        where t.table_schema = sync_all_temporal_tables.schema_name
        and t.table_type = 'BASE TABLE'
        and exists (
            select 1
            from information_schema.tables h
            where h.table_schema = sync_all_temporal_tables.schema_name
            and h.table_name = t.table_name || '_history'
        )
        and t.table_name not like '%_history'
        order by t.table_name
    loop
        raise notice 'Syncing temporal table: %.%', sync_all_temporal_tables.schema_name, table_record.tbl_name;
        sync_result := sync_temporal_table_schema(sync_all_temporal_tables.schema_name, table_record.tbl_name);
        all_results := all_results || sync_result;
    end loop;

    return jsonb_build_object(
        'schema', sync_all_temporal_tables.schema_name,
        'tables_synced', jsonb_array_length(all_results),
        'results', all_results
    );
end;
$$;

comment on function sync_all_temporal_tables(text) is
'Synchronizes all temporal tables in a schema. Returns JSON with details of all changes made.';
