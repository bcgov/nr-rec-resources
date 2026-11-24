create table if not exists rst.recreation_spatial_submission_map_feature
(
    rssmf_skey                bigserial primary key,
    application_guid          uuid        not null references rst.recreation_spatial_submission (application_guid) on delete cascade,
    rec_resource_id           varchar(20) not null references rst.recreation_resource (rec_resource_id),
    section_id                varchar(30),
    purpose_code              varchar(1)  not null,
    amend_status_code         varchar(3)  not null default 'PND',
    amendment_id              integer,
    recreation_resource_type  varchar(3)  references rst.recreation_resource_type_code (rec_resource_type_code),
    retirement_date           date,
    map_feature_guid          varchar(36) not null,
    feature_record_guid       varchar(36) not null,
    feature_business_identifier varchar(100),

    constraint chk_spatial_submission_map_feature_purpose
        check (purpose_code in ('N', 'A', 'R')),
    constraint chk_spatial_submission_map_feature_status
        check (amend_status_code in ('PND', 'APP', 'REJ')),
    constraint uq_spatial_submission_map_feature_guid
        unique (application_guid, map_feature_guid)
);

select upsert_timestamp_columns('rst', 'recreation_spatial_submission_map_feature');

select setup_temporal_table('rst'::text, 'recreation_spatial_submission_map_feature'::text, false);

create index if not exists idx_spatial_submission_map_feature_application_guid
    on rst.recreation_spatial_submission_map_feature (application_guid);

create index if not exists idx_spatial_submission_map_feature_rec_resource_id
    on rst.recreation_spatial_submission_map_feature (rec_resource_id);

create index if not exists idx_spatial_submission_map_feature_section_id
    on rst.recreation_spatial_submission_map_feature (section_id);

comment on table rst.recreation_spatial_submission_map_feature is 'Submission-scoped map features captured at geospatial request time before adjudication promotion to recreation_map_feature.';
