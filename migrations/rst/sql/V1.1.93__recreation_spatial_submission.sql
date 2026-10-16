create sequence if not exists rst.recreation_spatial_submission_submission_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

create table if not exists rst.recreation_spatial_submission
(
    application_guid                 uuid primary key default gen_random_uuid(),
    submission_id                    varchar(50)  not null unique default nextval('rst.recreation_spatial_submission_submission_id_seq'::regclass)::varchar(50),
    tenure_id                  varchar(20)  not null references rst.recreation_resource (rec_resource_id),
    status_request_guid              varchar(50)  unique,
    status_request_type_code         varchar(3)   not null,
    status                           varchar(3)   not null default 'PND',
    purpose_code                     varchar(1)   not null,
    recreation_resource_type         varchar(3)   references rst.recreation_resource_type_code (rec_resource_type_code),
    submission_date                  date         not null,
    org_unit_code                    varchar(6)   not null,
    adjudication_ind                 boolean      not null default false,
    adjudicated_by                   varchar(30),
    adjudication_date                timestamp,
    adjudication_comment             text,
    adjudication_report_document_uri varchar(2048),
    decision                         varchar(7),

    constraint chk_spatial_submission_status_request_type
        check (status_request_type_code in ('RL', 'RPO')),

    constraint chk_spatial_submission_status
        check (status in ('CLR', 'APP', 'REJ', 'PND', 'FAI')),

    constraint chk_spatial_submission_purpose
        check (purpose_code in ('N', 'A', 'R')),

    constraint chk_spatial_submission_decision
        check (decision in ('APPROVE', 'REJECT') or decision is null),

    constraint chk_spatial_submission_status_business_rules
        check (
            (status = 'CLR' and decision is null and adjudication_comment is null and adjudication_report_document_uri is null)
            or (status = 'APP' and decision = 'APPROVE' and adjudication_report_document_uri is not null)
            or (status = 'REJ' and decision = 'REJECT' and adjudication_comment is not null)
            or (status in ('PND', 'FAI'))
        ),

    constraint chk_spatial_submission_adjudication
        check (
            (adjudication_ind = true and status in ('APP', 'REJ') and adjudicated_by is not null and adjudication_date is not null)
            or (adjudication_ind = false and status in ('PND', 'CLR', 'FAI') and adjudicated_by is null and adjudication_date is null)
        )
);

select upsert_timestamp_columns('rst', 'recreation_spatial_submission');

select setup_temporal_table('rst'::text, 'recreation_spatial_submission'::text, false);

comment on table rst.recreation_spatial_submission is 'Tracks spatial submission requests sent to SNCSC and their adjudication outcomes.';

comment on column rst.recreation_spatial_submission.application_guid is 'Primary GUID for the submission record in RST.';
comment on column rst.recreation_spatial_submission.submission_id is 'Client-facing submission identifier (auto-generated incremental value when omitted).';
comment on column rst.recreation_spatial_submission.tenure_id is 'Tenure identifier (FK to rst.recreation_resource.rec_resource_id).';
comment on column rst.recreation_spatial_submission.status_request_guid is 'SNCSC internal record key returned after submission creation.';
comment on column rst.recreation_spatial_submission.status_request_type_code is 'Request geometry type: RL (Linear) or RPO (Polygonal).';
comment on column rst.recreation_spatial_submission.status is 'Submission lifecycle status: PND, CLR, APP, REJ, or FAI.';
comment on column rst.recreation_spatial_submission.purpose_code is 'Submission purpose: N (New), A (Amend), or R (Retire).';
comment on column rst.recreation_spatial_submission.recreation_resource_type is 'Recreation resource type code associated to the submission.';
comment on column rst.recreation_spatial_submission.submission_date is 'Date the spatial request was sent to SNCSC.';
comment on column rst.recreation_spatial_submission.org_unit_code is 'Natural resource organization unit code associated to the submission context.';
comment on column rst.recreation_spatial_submission.adjudication_ind is 'Indicates whether a final adjudication decision has been made (true only for APP or REJ).';
comment on column rst.recreation_spatial_submission.adjudicated_by is 'IDIR of the adjudicator.';
comment on column rst.recreation_spatial_submission.adjudication_date is 'Date and time of adjudication.';
comment on column rst.recreation_spatial_submission.adjudication_comment is 'Adjudication notes, including reject reason where applicable.';
comment on column rst.recreation_spatial_submission.adjudication_report_document_uri is 'Document URI for the adjudication report/exhibit output.';
comment on column rst.recreation_spatial_submission.decision is 'Adjudication decision value: APPROVE or REJECT.';

create index if not exists idx_recreation_spatial_submission_tenure_id
    on rst.recreation_spatial_submission (tenure_id);

create index if not exists idx_recreation_spatial_submission_status
    on rst.recreation_spatial_submission (status);

create index if not exists idx_recreation_spatial_submission_submission_date
    on rst.recreation_spatial_submission (submission_date);

create index if not exists idx_recreation_spatial_submission_org_unit_code
    on rst.recreation_spatial_submission (org_unit_code);
