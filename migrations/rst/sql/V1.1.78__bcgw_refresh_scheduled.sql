-- Update pg_cron schedule to include bcgw_recreation_resource_view.
-- cron.schedule with the same job name performs an upsert, replacing the prior command.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_available_extensions
        WHERE name = 'pg_cron'
    ) THEN
        RAISE NOTICE 'pg_cron not available, skipping schedule update.';
        RETURN;
    END IF;

    BEGIN
        EXECUTE 'CREATE EXTENSION IF NOT EXISTS pg_cron';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'pg_cron exists but cannot be loaded, skipping.';
        RETURN;
    END;

    PERFORM cron.schedule(
        'refresh_rsts_materialized_views',
        '*/5 * * * *',
        $sql$
            REFRESH MATERIALIZED VIEW rst.recreation_resource_access_count_view;
            REFRESH MATERIALIZED VIEW rst.recreation_resource_district_count_view;
            REFRESH MATERIALIZED VIEW rst.recreation_resource_type_count_view;
            REFRESH MATERIALIZED VIEW rst.recreation_resource_search_view;
            REFRESH MATERIALIZED VIEW CONCURRENTLY rst.bcgw_recreation_resource_view;
        $sql$
    );
END;
$$;
