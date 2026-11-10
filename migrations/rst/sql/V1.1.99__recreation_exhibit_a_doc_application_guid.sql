alter table rst.recreation_exhibit_a_doc
    add column if not exists application_guid uuid;

alter table rst.recreation_exhibit_a_doc_history
    add column if not exists application_guid uuid;

update rst.recreation_exhibit_a_doc d
set application_guid = s.application_guid
from rst.recreation_spatial_submission s
where s.submission_id = d.submission_id
  and d.application_guid is null;

alter table rst.recreation_exhibit_a_doc
    drop constraint if exists fk_recreation_exhibit_a_doc_submission_id;

alter table rst.recreation_exhibit_a_doc
    drop constraint if exists fk_recreation_exhibit_a_doc_application_guid;

drop index if exists rst.idx_recreation_exhibit_a_doc_submission_id;

alter table rst.recreation_exhibit_a_doc
    drop column if exists submission_id;

alter table rst.recreation_exhibit_a_doc_history
    drop column if exists submission_id;

alter table rst.recreation_exhibit_a_doc
    add constraint fk_recreation_exhibit_a_doc_application_guid
        foreign key (application_guid)
            references rst.recreation_spatial_submission (application_guid);

alter table rst.recreation_spatial_submission
    drop constraint if exists recreation_spatial_submission_submission_id_key;

create index if not exists idx_recreation_spatial_submission_submission_id
    on rst.recreation_spatial_submission (submission_id);

create index if not exists idx_recreation_exhibit_a_doc_application_guid
    on rst.recreation_exhibit_a_doc (application_guid);

comment on column rst.recreation_exhibit_a_doc.application_guid is
    'Spatial submission application GUID linked to this Exhibit A output.';
