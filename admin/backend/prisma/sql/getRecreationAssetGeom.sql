-- Get lat/long coordinates for recreation assets with point geometry.
-- Used by: GET /v1/assets and GET /v1/assets/:id (asset coordinate lookup).
-- Coordinates are transformed from BC Albers (SRID 3005) to WGS84 (SRID 4326).
-- Batched by asset_id array so list responses don't issue one query per row.
-- Returns one row per asset_id that has a recreation_asset_geom record with geometry set.

select
    rag.asset_id,
    rag.geometry_type_code,
    round(public.st_y(public.st_transform(
        case
            when public.st_srid(rag.geometry) = 0
            then public.st_setsrid(rag.geometry, 3005)
            else rag.geometry
        end, 4326))::numeric, 6) as latitude,
    round(public.st_x(public.st_transform(
        case
            when public.st_srid(rag.geometry) = 0
            then public.st_setsrid(rag.geometry, 3005)
            else rag.geometry
        end, 4326))::numeric, 6) as longitude
from rst.recreation_asset_geom rag
where rag.asset_id = any ($1::bigint[])
  and rag.geometry is not null;
