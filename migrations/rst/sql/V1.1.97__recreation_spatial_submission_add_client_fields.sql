alter table rst.recreation_spatial_submission
    add column if not exists client_number varchar(10),
    add column if not exists client_locn_code varchar(4);

comment on column rst.recreation_spatial_submission.client_number is 'Client number linked to the tenure application submission.';
comment on column rst.recreation_spatial_submission.client_locn_code is 'Client location code linked to the tenure application submission.';

alter table rst.recreation_spatial_submission_history
    add column if not exists client_number varchar(10),
    add column if not exists client_locn_code varchar(4);
