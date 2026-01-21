create table if not exists rst.recreation_photographer_type_code
(
    photographer_type_code varchar primary key,
    description            varchar
);

select upsert_timestamp_columns('rst', 'recreation_photographer_type_code');

select setup_temporal_table('rst', 'recreation_photographer_type_code', false);

comment on column rst.recreation_photographer_type_code.photographer_type_code is 'Unique code identifier for photographer type';
comment on column rst.recreation_photographer_type_code.description is 'Human-readable description of the photographer type';

insert into rst.recreation_photographer_type_code (photographer_type_code, description)
values
    ('STAFF', 'Staff'),
    ('CONTRACTOR', 'Contractor'),
    ('VOLUNTEER', 'Volunteer'),
    ('PHOTOGRAPHER', 'Photographer'),
    ('OTHER', 'Other')
on conflict do nothing;

insert into rst.recreation_resource_doc_code (doc_code, description, created_by, created_at)
values ('IC', 'Image Consent Form', 'system', CURRENT_TIMESTAMP)
on conflict (doc_code) do nothing;

create table if not exists rst.recreation_image_consent_form
(
    consent_id             uuid primary key default gen_random_uuid(),
    image_id               uuid not null references rst.recreation_resource_image,
    doc_id                 uuid not null references rst.recreation_resource_document,
    photographer_type_code varchar not null references rst.recreation_photographer_type_code,
    photographer_name      varchar(255),
    date_taken             date,
    contains_pii           boolean not null default false,
    unique (image_id)
);

select upsert_timestamp_columns('rst', 'recreation_image_consent_form');

select setup_temporal_table('rst', 'recreation_image_consent_form', false);

comment on table rst.recreation_image_consent_form is 'Links recreation resource images to their consent forms';
comment on column rst.recreation_image_consent_form.consent_id is 'Unique UUID identifier for the consent record';
comment on column rst.recreation_image_consent_form.image_id is 'Reference to the recreation resource image';
comment on column rst.recreation_image_consent_form.doc_id is 'Reference to the consent form document';
comment on column rst.recreation_image_consent_form.photographer_type_code is 'Type of photographer (STAFF, CONTRACTOR, VOLUNTEER, PHOTOGRAPHER, or OTHER)';
comment on column rst.recreation_image_consent_form.photographer_name is 'Name of the photographer for attribution';
comment on column rst.recreation_image_consent_form.date_taken is 'Date the photo was taken';
comment on column rst.recreation_image_consent_form.contains_pii is 'Whether the image contains personally identifiable information';

create index if not exists idx_recreation_image_consent_form_image_id
    on rst.recreation_image_consent_form(image_id);

create index if not exists idx_recreation_image_consent_form_doc_id
    on rst.recreation_image_consent_form(doc_id);
