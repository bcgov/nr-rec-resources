-- Backfill submission-scoped map features from FTA tenure applications.
with source as (
    select
        tamf.map_feature_id,
        nullif(btrim(tamf.tenure_app_guid), '') as tenure_app_guid_norm,
        nullif(btrim(tamf.submission_id), '') as submission_id_norm,
        nullif(btrim(tamf.forest_file_id), '') as rec_resource_id_norm,
        tamf.revision_count,
        tamf.entry_timestamp,
        nullif(btrim(tamf.entry_userid), '') as entry_userid_norm,
        tamf.update_timestamp,
        nullif(btrim(tamf.update_userid), '') as update_userid_norm
    from fta.tenure_application_map_feature tamf
    where tamf.map_feature_id is not null
),
prepared as (
    select
        rss.application_guid,
        rss.tenure_id as rec_resource_id,
        null::varchar(30) as section_id,
        rss.purpose_code,
        case
            when rss.status = 'APP' then 'APP'
            when rss.status = 'REJ' then 'REJ'
            else 'PND'
        end as amend_status_code,
        null::integer as amendment_id,
        rss.recreation_resource_type,
        case
            when rss.purpose_code = 'R'
                then coalesce(rss.adjudication_date::date, rss.updated_at::date, rss.created_at::date)
            else null
        end as retirement_date,
        regexp_replace(
            md5('fta:tenure_application_map_feature:' || s.map_feature_id::text),
            '(.{8})(.{4})(.{4})(.{4})(.{12})',
            '\1-\2-\3-\4-\5'
        ) as map_feature_guid,
        regexp_replace(
            md5('fta:tenure_application_map_feature:record:' || s.map_feature_id::text),
            '(.{8})(.{4})(.{4})(.{4})(.{12})',
            '\1-\2-\3-\4-\5'
        ) as feature_record_guid,
        left(
            coalesce(s.submission_id_norm, rss.submission_id) || ' MF ' || s.map_feature_id::text,
            100
        ) as feature_business_identifier,
        s.revision_count,
        s.entry_timestamp as created_at,
        s.entry_userid_norm as created_by,
        s.update_timestamp as updated_at,
        s.update_userid_norm as updated_by
    from source s
    join rst.recreation_spatial_submission rss
        on rss.status_request_guid = s.tenure_app_guid_norm
       and (s.rec_resource_id_norm is null or rss.tenure_id = s.rec_resource_id_norm)
    join rst.recreation_resource rr
        on rr.rec_resource_id = rss.tenure_id
)
insert into rst.recreation_spatial_submission_map_feature (
    application_guid,
    rec_resource_id,
    section_id,
    purpose_code,
    amend_status_code,
    amendment_id,
    recreation_resource_type,
    retirement_date,
    map_feature_guid,
    feature_record_guid,
    feature_business_identifier,
    revision_count,
    created_at,
    created_by,
    updated_at,
    updated_by
)
select
    p.application_guid,
    p.rec_resource_id,
    p.section_id,
    p.purpose_code,
    p.amend_status_code,
    p.amendment_id,
    p.recreation_resource_type,
    p.retirement_date,
    p.map_feature_guid,
    p.feature_record_guid,
    p.feature_business_identifier,
    p.revision_count,
    p.created_at,
    p.created_by,
    p.updated_at,
    p.updated_by
from prepared p
on conflict (application_guid, map_feature_guid) do update
set
    rec_resource_id = excluded.rec_resource_id,
    section_id = excluded.section_id,
    purpose_code = excluded.purpose_code,
    amend_status_code = excluded.amend_status_code,
    amendment_id = excluded.amendment_id,
    recreation_resource_type = excluded.recreation_resource_type,
    retirement_date = excluded.retirement_date,
    feature_record_guid = excluded.feature_record_guid,
    feature_business_identifier = excluded.feature_business_identifier,
    revision_count = excluded.revision_count,
    updated_at = excluded.updated_at,
    updated_by = excluded.updated_by;
