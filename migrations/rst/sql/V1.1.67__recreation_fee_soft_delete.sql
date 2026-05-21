alter table rst.recreation_fee
    add column if not exists is_deleted boolean not null default false;

alter table rst.recreation_fee
    add column if not exists deleted_at timestamp null;

alter table rst.recreation_fee
    add column if not exists deleted_by text null;

-- Keep history table aligned without calling sync function
alter table rst.recreation_fee_history
    add column if not exists fee_id integer;

alter table rst.recreation_fee_history
    add column if not exists is_deleted boolean;

alter table rst.recreation_fee_history
    add column if not exists deleted_at timestamp null;

alter table rst.recreation_fee_history
    add column if not exists deleted_by text null;
