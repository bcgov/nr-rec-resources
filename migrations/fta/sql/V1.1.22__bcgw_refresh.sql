-- Refresh BCGW materialized views after FTA data has been loaded into RST.
-- This ensures the views reflect the latest FTA-sourced data on each deploy.
REFRESH MATERIALIZED VIEW bcgw.resource_details_and_closures;
REFRESH MATERIALIZED VIEW bcgw.recreation_map_features;
