-- Make doc_id nullable on recreation_image_consent_form
-- Allows storing image metadata (date_taken, photographer_type, etc.)
-- without requiring a consent form PDF document

alter table rst.recreation_image_consent_form
    alter column doc_id drop not null;

alter table rst.recreation_image_consent_form
    alter column photographer_type_code drop not null;

comment on column rst.recreation_image_consent_form.doc_id
    is 'Reference to the consent form document (nullable when no consent form PDF is uploaded)';

comment on column rst.recreation_image_consent_form.photographer_type_code
    is 'Type of photographer (STAFF, CONTRACTOR, VOLUNTEER, PHOTOGRAPHER, or OTHER). Nullable when metadata is stored without a consent form.';
