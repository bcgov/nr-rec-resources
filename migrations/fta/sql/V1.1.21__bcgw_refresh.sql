-- Refresh BCGW materialized view after FTA data has been loaded into RST.
-- This ensures the view reflects the latest FTA-sourced data on each deploy.
REFRESH MATERIALIZED VIEW rst.bcgw_recreation_resource_view;
