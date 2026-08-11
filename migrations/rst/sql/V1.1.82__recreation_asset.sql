-- Seed a "Campsite" structure type. Campsites are modelled as assets (parent of other
-- assets via parent_id). This type does not exist in FTA, so the FTA structure_code sync
-- will never create it; seed it here (insert-only sync leaves it untouched).
insert into rst.recreation_structure_code (description)
select 'Campsite'
where not exists (
    select 1 from rst.recreation_structure_code
    where lower(description) = 'campsite'
);

create table rst.recreation_asset
(
    asset_id                  bigint generated always as identity primary key,
    parent_id                 bigint,
    asset_tag                 varchar(50),
    rec_resource_id           varchar(20) not null,
    recreation_structure_code integer     not null,
    asset_name                varchar(200),
    asset_comment             text,
    legacy_structure_id       varchar(20),
    asset_length              numeric(7, 1),
    asset_width               numeric(7, 1),
    asset_area                numeric(7, 1),
    default_value             numeric(7, 2),
    actual_value              numeric(7, 2),
    installation_date         date,

    constraint fk_asset_rec_resource
        foreign key (rec_resource_id)
        references rst.recreation_resource (rec_resource_id) on delete restrict,

    constraint fk_asset_parent
        foreign key (parent_id)
        references rst.recreation_asset (asset_id) on delete restrict,

    constraint chk_no_self_parent
        check (parent_id <> asset_id),

    constraint fk_asset_struct_code
        foreign key (recreation_structure_code)
        references rst.recreation_structure_code (structure_code)
);

-- Performance indexes (no GiST — geometry lives in recreation_asset_geom)
create index idx_recreation_asset_parent_id on rst.recreation_asset (parent_id);
create index idx_recreation_asset_site      on rst.recreation_asset (rec_resource_id);
create index idx_recreation_asset_code      on rst.recreation_asset (recreation_structure_code);

comment on table  rst.recreation_asset is 'Individualised asset entities with parent-child relationships (e.g., Campsite → Table). Geometry stored in recreation_asset_geom.';
comment on column rst.recreation_asset.asset_id                  is 'Unique surrogate identifier for the individual asset.';
comment on column rst.recreation_asset.parent_id                 is 'ID of the parent container asset (e.g., Campsite, Day Use Area, Zone). NULL if top-level.';
comment on column rst.recreation_asset.asset_tag                 is 'Physical barcode, field tag, or campsite designation (e.g., CS-012, TBL-012-A).';
comment on column rst.recreation_asset.rec_resource_id           is 'FK to the parent Recreation Resource / Site (rst.recreation_resource).';
comment on column rst.recreation_asset.recreation_structure_code is 'Asset classification type (FK to rst.recreation_structure_code.structure_code).';
comment on column rst.recreation_asset.asset_name                is 'Optional display name for the asset. UI defaults to structure_code description when null.';
comment on column rst.recreation_asset.asset_comment             is 'Free-text note or migrated structure_name value for this asset.';
comment on column rst.recreation_asset.legacy_structure_id       is 'Informational string reference to the legacy aggregate recreation_structure record.';
comment on column rst.recreation_asset.asset_length              is 'Total length in metres (paths, boardwalks, fences, bridges).';
comment on column rst.recreation_asset.asset_width               is 'Total width in metres (parking areas, shelters, docks).';
comment on column rst.recreation_asset.asset_area                is 'Total area in square metres.';
comment on column rst.recreation_asset.default_value             is 'Default value for the asset, derived from the structure type value/dimension.';
comment on column rst.recreation_asset.actual_value              is 'Actual value of the asset; takes precedence over the default value when set.';
comment on column rst.recreation_asset.installation_date         is 'Date the asset was installed in the field.';

select upsert_timestamp_columns('rst', 'recreation_asset');

select setup_temporal_table('rst', 'recreation_asset', false);



create table rst.recreation_asset_repair
(
    repair_id                    bigint generated always as identity primary key,
    asset_id                     bigint     not null,
    recreation_remed_repair_code varchar(2),
    estimated_repair_cost        numeric(10, 2),
    actual_repair_cost           numeric(10, 2),
    repair_completed_date        date,
    urgency                      varchar(25),
    trail_segment_start          varchar(50),
    trail_segment_end            varchar(50),

    constraint fk_repair_asset
        foreign key (asset_id)
        references rst.recreation_asset (asset_id) on delete cascade,

    constraint fk_repair_remed_code
        foreign key (recreation_remed_repair_code)
        references rst.recreation_remed_repair_code (recreation_remed_repair_code)
);

create index idx_asset_repair_asset_id on rst.recreation_asset_repair (asset_id);

comment on table  rst.recreation_asset_repair is 'Repair and cost tracking records for individual assets.';
comment on column rst.recreation_asset_repair.repair_id                    is 'Unique surrogate identifier for the repair log entry.';
comment on column rst.recreation_asset_repair.asset_id                     is 'FK linking to the individual asset being repaired.';
comment on column rst.recreation_asset_repair.recreation_remed_repair_code is 'Remedial repair classification code (FK to rst.recreation_remed_repair_code).';
comment on column rst.recreation_asset_repair.estimated_repair_cost        is 'Estimated financial cost for the repair work.';
comment on column rst.recreation_asset_repair.actual_repair_cost           is 'Final actual financial cost incurred after completion.';
comment on column rst.recreation_asset_repair.repair_completed_date        is 'Date the repair work was completed.';
comment on column rst.recreation_asset_repair.urgency                      is 'Urgency/priority of the repair.';
comment on column rst.recreation_asset_repair.trail_segment_start          is 'Optional trail segment start reference for trail-related repairs.';
comment on column rst.recreation_asset_repair.trail_segment_end            is 'Optional trail segment end reference for trail-related repairs.';

select upsert_timestamp_columns('rst', 'recreation_asset_repair');

select setup_temporal_table('rst', 'recreation_asset_repair', false);




create table rst.recreation_asset_geom
(
    asset_id           bigint      not null primary key,
    geometry_type_code varchar(3),
    geometry           geometry,

    constraint fk_asset_geom_asset
        foreign key (asset_id)
        references rst.recreation_asset (asset_id) on delete cascade
);

create index idx_recreation_asset_geom_geom on rst.recreation_asset_geom using gist (geometry);

comment on table  rst.recreation_asset_geom is '1:1 geometry store for individual assets, separated from the main asset record for performance and schema clarity.';
comment on column rst.recreation_asset_geom.asset_id           is 'one geometry record per asset.';
comment on column rst.recreation_asset_geom.geometry_type_code is 'Short code describing the geometry type (e.g., PT = Point, LN = LineString, PY = Polygon).';
comment on column rst.recreation_asset_geom.geometry           is 'geometry for the asset.';

select upsert_timestamp_columns('rst', 'recreation_asset_geom');

select setup_temporal_table('rst', 'recreation_asset_geom', false);
