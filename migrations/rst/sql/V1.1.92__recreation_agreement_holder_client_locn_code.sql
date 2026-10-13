alter table rst.recreation_agreement_holder
    add column if not exists client_locn_code varchar(2);

alter table rst.recreation_agreement_holder_history
    add column if not exists client_locn_code varchar(2);

select setup_temporal_table('rst', 'recreation_agreement_holder', true);

comment on column rst.recreation_agreement_holder.client_locn_code is
    'location code for the client';
