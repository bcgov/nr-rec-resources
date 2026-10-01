alter table rst.recreation_agreement_holder
    drop column if exists recreation_operator;

alter table rst.recreation_agreement_holder_history
    drop column if exists recreation_operator;

select setup_temporal_table ('rst', 'recreation_agreement_holder', true);
