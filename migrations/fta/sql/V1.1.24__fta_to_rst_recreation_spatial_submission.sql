with mapped as (
    select
        ta.*,
        nullif(btrim(ta.tenure_app_guid), '') as tenure_app_guid_norm,
        case
            when nullif(btrim(ta.tenure_app_guid), '') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
                then nullif(btrim(ta.tenure_app_guid), '')::uuid
            when nullif(btrim(ta.tenure_app_guid), '') ~* '^[0-9a-f]{32}$'
                then regexp_replace(lower(nullif(btrim(ta.tenure_app_guid), '')), '(.{8})(.{4})(.{4})(.{4})(.{12})', '\1-\2-\3-\4-\5')::uuid
            when nullif(btrim(ta.tenure_app_guid), '') is not null
                then regexp_replace(md5(lower(nullif(btrim(ta.tenure_app_guid), ''))), '(.{8})(.{4})(.{4})(.{4})(.{12})', '\1-\2-\3-\4-\5')::uuid
            else null
        end as application_guid_mapped,
        case
            when upper(btrim(ta.tenure_application_type_code)) in ('RL', 'L', 'LIN', 'LINEAR') then 'RL'
            when upper(btrim(ta.tenure_application_type_code)) in ('RPO', 'P', 'POLY', 'POLYGON', 'POLYGONAL') then 'RPO'
            else null
        end as status_request_type_code_mapped,
        case
            when upper(btrim(ta.tenure_app_purp_code)) in ('N', 'NEW') then 'N'
            when upper(btrim(ta.tenure_app_purp_code)) in ('A', 'AMD', 'AMEND', 'AMENDMENT') then 'A'
            when upper(btrim(ta.tenure_app_purp_code)) in ('R', 'RET', 'RETIRE', 'RETIREMENT') then 'R'
            else null
        end as purpose_code_mapped,
        case
            when upper(btrim(ta.tenure_application_state_code)) in ('CLR', 'CLEAR', 'CLEARED') then 'CLR'
            when upper(btrim(ta.tenure_application_state_code)) in ('APP', 'APPR', 'APPROVED') then 'APP'
            when upper(btrim(ta.tenure_application_state_code)) in ('REJ', 'REJECTED', 'DISALLOWED') then 'REJ'
            when upper(btrim(ta.tenure_application_state_code)) in ('FAI', 'FAILED', 'FAIL') then 'FAI'
            else 'PND'
        end as source_status,
        coalesce(
            nullif(btrim(ta.org_unit_no), ''),
            nullif(btrim(ta.overlay_geo_district_code), '')
        ) as org_unit_code_raw,
        coalesce(ta.submission_date, ta.entry_timestamp::date, ta.update_timestamp::date) as submission_date_mapped,
        coalesce(ta.adjudication_date, ta.decision_date) as adjudication_date_mapped,
        nullif(btrim(coalesce(ta.adjudication_comment, ta.application_decision_message)), '') as rejection_comment,
        nullif(btrim(ta.clearance_status_request_uri), '') as report_uri
    from fta.tenure_application ta
),
normalized as (
    select
        m.*,
        case
            when m.source_status = 'APP'
                 and m.report_uri is not null
                 and nullif(btrim(m.adjudicated_by), '') is not null
                 and m.adjudication_date_mapped is not null then 'APP'
            when m.source_status = 'REJ'
                 and m.rejection_comment is not null
                 and nullif(btrim(m.adjudicated_by), '') is not null
                 and m.adjudication_date_mapped is not null then 'REJ'
            when m.source_status in ('CLR', 'FAI') then m.source_status
            else 'PND'
        end as final_status
    from mapped m
),
prepared as (
    select
        n.application_guid_mapped as application_guid,
        nullif(btrim(n.submission_id), '') as submission_id,
        n.forest_file_id as tenure_id,
        n.status_request_type_code_mapped as status_request_type_code,
        n.final_status as status,
        n.purpose_code_mapped as purpose_code,
        n.submission_date_mapped as submission_date,
        nullif(btrim(n.tenure_app_guid), '') as status_request_guid,
        left(n.org_unit_code_raw, 6) as org_unit_code,
        case when n.final_status in ('APP', 'REJ') then true else false end as adjudication_ind,
        case when n.final_status in ('APP', 'REJ') then nullif(btrim(n.adjudicated_by), '') else null end as adjudicated_by,
        case when n.final_status in ('APP', 'REJ') then n.adjudication_date_mapped else null end as adjudication_date,
        case when n.final_status = 'REJ' then n.rejection_comment else null end as adjudication_comment,
        case when n.final_status = 'APP' then n.report_uri else null end as adjudication_report_document_uri,
        case
            when n.final_status = 'APP' then 'APPROVE'
            when n.final_status = 'REJ' then 'REJECT'
            else null
        end as decision,
        n.update_timestamp as updated_at,
        nullif(btrim(n.update_userid), '') as updated_by,
        n.entry_timestamp as created_at,
        nullif(btrim(n.entry_userid), '') as created_by
    from normalized n
    where n.application_guid_mapped is not null
      and n.status_request_type_code_mapped is not null
      and n.purpose_code_mapped is not null
      and n.submission_date_mapped is not null
      and n.org_unit_code_raw is not null
)
insert into rst.recreation_spatial_submission (
    application_guid,
    submission_id,
    tenure_id,
    status_request_guid,
    status_request_type_code,
    status,
    purpose_code,
    submission_date,
    org_unit_code,
    adjudication_ind,
    adjudicated_by,
    adjudication_date,
    adjudication_comment,
    adjudication_report_document_uri,
    decision,
    updated_at,
    updated_by,
    created_at,
    created_by
)
select
    p.application_guid,
    coalesce(p.submission_id, nextval('rst.recreation_spatial_submission_submission_id_seq'::regclass)::varchar(50)),
    p.tenure_id,
    p.status_request_guid,
    p.status_request_type_code,
    p.status,
    p.purpose_code,
    p.submission_date,
    p.org_unit_code,
    p.adjudication_ind,
    p.adjudicated_by,
    p.adjudication_date,
    p.adjudication_comment,
    p.adjudication_report_document_uri,
    p.decision,
    p.updated_at,
    p.updated_by,
    p.created_at,
    p.created_by
from prepared p
join rst.recreation_resource rr
    on rr.rec_resource_id = p.tenure_id
on conflict (application_guid) do update
set
    submission_id = excluded.submission_id,
    tenure_id = excluded.tenure_id,
    status_request_guid = excluded.status_request_guid,
    status_request_type_code = excluded.status_request_type_code,
    status = excluded.status,
    purpose_code = excluded.purpose_code,
    submission_date = excluded.submission_date,
    org_unit_code = excluded.org_unit_code,
    adjudication_ind = excluded.adjudication_ind,
    adjudicated_by = excluded.adjudicated_by,
    adjudication_date = excluded.adjudication_date,
    adjudication_comment = excluded.adjudication_comment,
    adjudication_report_document_uri = excluded.adjudication_report_document_uri,
    decision = excluded.decision,
    updated_at = excluded.updated_at,
    updated_by = excluded.updated_by;
