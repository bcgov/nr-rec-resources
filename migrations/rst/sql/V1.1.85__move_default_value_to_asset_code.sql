-- Move default_value from recreation_asset to recreation_asset_code.
-- default_value is a property of the asset type (code), not the individual asset instance.

-- Step 1: Add default_value to recreation_asset_code
alter table rst.recreation_asset_code
    add column if not exists default_value numeric(7, 2);

alter table rst.recreation_asset_code_history
    add column if not exists default_value numeric(7, 2);

comment on column rst.recreation_asset_code.default_value is
    'Default monetary value for an asset of this type, derived from the legacy structure type value/dimension (e.g., $50/m for Boardwalks).';

-- Step 2: Drop default_value from recreation_asset
alter table rst.recreation_asset
    drop column if exists default_value;

alter table rst.recreation_asset_history
    drop column if exists default_value;

select sync_temporal_table_schema('rst', 'recreation_asset_code');
