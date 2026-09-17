alter table rst.recreation_agreement_holder
    add column if not exists recreation_operator boolean not null default false;

-- A recreation operator is an active partner on a resource that currently has fees.
with resources_with_fees as (
    select distinct rf.rec_resource_id
    from rst.recreation_fee rf
    where rf.is_deleted = false
)
update rst.recreation_agreement_holder rah
set recreation_operator = (
    coalesce(rah.agreement_start_date, current_date) <= current_date
    and rah.agreement_end_date is not null
    and rah.agreement_end_date > current_date
    and exists (
        select 1
        from resources_with_fees rwf
        where rwf.rec_resource_id = rah.rec_resource_id
    )
);

alter table rst.recreation_agreement_holder
    drop column if exists partner_relationship_type_code;

alter table rst.recreation_agreement_holder_history
    drop column if exists partner_relationship_type_code;


alter table rst.recreation_agreement_holder_history
    add column if not exists recreation_operator boolean;

select setup_temporal_table ('rst', 'recreation_agreement_holder', true);

comment on column rst.recreation_agreement_holder.recreation_operator is
    'True when the partner is active and the associated recreation resource has at least one non-deleted fee.';
