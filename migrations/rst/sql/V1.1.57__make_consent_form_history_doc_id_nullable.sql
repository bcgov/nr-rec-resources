-- It's important to remember to update history table constraints - related to previous migration changes
alter table rst.recreation_image_consent_form_history alter column doc_id drop not null;
alter table rst.recreation_image_consent_form_history alter column photographer_type_code drop not null;
