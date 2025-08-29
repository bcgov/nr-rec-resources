create table if not exists rst.recreation_resource_reservation_info (
    rec_resource_id varchar(10) primary key references rst.recreation_resource(rec_resource_id),
    reservation_instructions varchar(200),
    reservation_website varchar(200),
    reservation_phone_number varchar(50),
    reservation_email varchar(100),
    reservation_comments varchar(400)
);

comment on table rst.recreation_resource_reservation_info is 'Identifies the reservation information on the specific recreation resource.';

comment on column rst.recreation_resource_reservation_info.rec_resource_id is 'File identification assigned to Provincial Forest Use files. Assigned file number. Usually the Licence, Tenure or Private Mark number.';

comment on column rst.recreation_resource_reservation_info.reservation_instructions is 'Reservation website instructions.';

comment on column rst.recreation_resource_reservation_info.reservation_website is 'Reservation website if availiable.';

comment on column rst.recreation_resource_reservation_info.reservation_phone_number is 'Reservation phone number if availiable.';

comment on column rst.recreation_resource_reservation_info.reservation_email is 'Reservation email if availiable.';

comment on column rst.recreation_resource_reservation_info.reservation_comments is 'Reservation comments if availiable.';

select upsert_timestamp_columns('rst', 'recreation_resource_reservation_info');

select setup_temporal_table('rst', 'recreation_resource_reservation_info');
