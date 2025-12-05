-- Add pg_cron schedule to refresh rst materialized views every 5 minutes

-- Only installs and adds schedule if pg_cron is available so devs don't require it locally
-- If you want this to run locally, install pg_cron in your local Postgres instance
-- and add these to the bottom of postgresql.conf:

-- shared_preload_libraries = 'pg_cron'
-- cron.database_name = 'rst'

-- You can verify it's successfuly installed in rst database with:
-- select * from cron.job;

-- Check the job run details with:
-- select * from cron.job_run_details order by start_time desc;


do $$
begin
    -- Skip if pg_cron is not available
    if not exists (
        select 1
        from pg_available_extensions
        where name = 'pg_cron'
    ) then
        raise notice 'pg_cron not available, skipping schedule creation.';
        return;
    end if;

    -- Try to create the extension (may fail if not loadable)
    begin
        execute 'create extension if not exists pg_cron';
    exception when others then
        raise notice 'pg_cron exists but cannot be loaded, skipping.';
        return;
    end;

    -- Schedule the refresh job
    perform cron.schedule(
        'refresh_rsts_materialized_views',
        '*/5 * * * *',
        $sql$
            refresh materialized view rst.recreation_resource_access_count_view;
            refresh materialized view rst.recreation_resource_district_count_view;
            refresh materialized view rst.recreation_resource_type_count_view;
            refresh materialized view rst.recreation_resource_search_view;
        $sql$
    );
end;
$$;
