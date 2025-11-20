-- Synchronize all existing temporal tables with their source tables
-- This ensures any previously missed columns are added to history tables

-- Run the sync for all temporal tables in the rst schema
do $$
declare
    sync_result jsonb;
begin
    -- Sync all temporal tables
    sync_result := sync_all_temporal_tables('rst');

    -- Log the results
    raise notice 'Temporal table synchronization complete:';
    raise notice 'Results: %', jsonb_pretty(sync_result);
end;
$$;
