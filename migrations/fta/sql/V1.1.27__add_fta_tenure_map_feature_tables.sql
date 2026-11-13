create table if not exists fta.tenure_application_map_feature (
    map_feature_id bigint primary key,
    tenure_app_guid varchar(64) not null,
    submission_id varchar(50),
    forest_file_id varchar(20) not null,
    revision_count integer,
    entry_userid varchar(30),
    entry_timestamp timestamp,
    update_userid varchar(30),
    update_timestamp timestamp,
    constraint fk_fta_tenure_app_map_feature_app_guid
        foreign key (tenure_app_guid)
        references fta.tenure_application (tenure_app_guid)
        on delete cascade
);

comment on table fta.tenure_application_map_feature is
    'FTA staging table for tenure application map features linked to fta.tenure_application.';
comment on column fta.tenure_application_map_feature.map_feature_id is
    'Unique map feature identifier from legacy TENURE_APPLICATION_MAP_FEATURE.';
comment on column fta.tenure_application_map_feature.tenure_app_guid is
    'Legacy tenure application identifier linked to fta.tenure_application.tenure_app_guid.';
comment on column fta.tenure_application_map_feature.submission_id is
    'Submission id associated with the tenure application map feature.';
comment on column fta.tenure_application_map_feature.forest_file_id is
    'Forest file id associated with the map feature.';

create index if not exists idx_fta_tamf_tenure_app_guid
    on fta.tenure_application_map_feature (tenure_app_guid);

create index if not exists idx_fta_tamf_forest_file_id
    on fta.tenure_application_map_feature (forest_file_id);

create index if not exists idx_fta_tamf_submission_id
    on fta.tenure_application_map_feature (submission_id);

create table if not exists fta.tenure_application_mf_images (
    tenure_app_mf_image_id bigserial primary key,
    map_feature_id bigint not null,
    s3_file_name varchar(255) not null,
    s3_path varchar(1024) not null,
    entry_userid varchar(30),
    entry_timestamp timestamp,
    update_userid varchar(30),
    update_timestamp timestamp,
    constraint fk_fta_tenure_mf_images_map_feature
        foreign key (map_feature_id)
        references fta.tenure_application_map_feature (map_feature_id)
        on delete cascade,
    constraint uq_fta_tenure_mf_images_file unique (map_feature_id, s3_file_name, s3_path)
);

comment on table fta.tenure_application_mf_images is
    'FTA staging table for tenure MF image metadata uploaded to S3.';
comment on column fta.tenure_application_mf_images.map_feature_id is
    'Map feature id for the MF image (linked to fta.tenure_application_map_feature).';
comment on column fta.tenure_application_mf_images.s3_file_name is
    'File name used when the MF image is uploaded to S3.';
comment on column fta.tenure_application_mf_images.s3_path is
    'S3 folder path used for upload (for example tenure_mf_images/{forest_file_id}/{map_feature_id}).';

create index if not exists idx_fta_tenure_mf_images_map_feature_id
    on fta.tenure_application_mf_images (map_feature_id);

create index if not exists idx_fta_tenure_mf_images_s3_path
    on fta.tenure_application_mf_images (s3_path);
