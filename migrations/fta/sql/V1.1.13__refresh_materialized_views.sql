-- Refresh all materialized views on each deploy via the FTA migration process
-- In the future we will likely want to update on either trigger or using pg_cron

refresh materialized view rst.recreation_resource_access_count_view;
refresh materialized view rst.recreation_resource_district_count_view;
refresh materialized view rst.recreation_resource_type_count_view;
refresh materialized view rst.recreation_resource_search_view;
