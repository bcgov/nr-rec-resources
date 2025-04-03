create table rst.recreation_remed_repair_code (
    recreation_remed_repair_code varchar(2) primary key,
    description varchar(120)
);

select upsert_timestamp_columns ('rst', 'recreation_remed_repair_code', true);

select setup_temporal_table ('rst', 'recreation_remed_repair_code');

comment on table rst.recreation_remed_repair_code is 'Codes describing types of remedial repairs for recreation structures.';

comment on column rst.recreation_remed_repair_code.recreation_remed_repair_code is 'Indicates the type of remedial repair applicable to the defined campsite.';

comment on column rst.recreation_remed_repair_code.description is 'Description of the code value';

insert into rst.recreation_remed_repair_code (recreation_remed_repair_code, description) values
('BR', 'Brushing'),
('CL', 'Clean'),
('MA', 'Major repair'),
('MI', 'Minor repairs'),
('RE', 'Remove'),
('RR', 'Relocate');

create table rst.recreation_defined_campsite (
    rec_resource_id varchar(10) not null references rst.recreation_resource (rec_resource_id),
    campsite_number int not null,
    estimated_repair_cost numeric(10, 2),
    recreation_remed_repair_code varchar(2) references rst.recreation_remed_repair_code (recreation_remed_repair_code),
    repair_complete_date date,
    unique (rec_resource_id, campsite_number)
);

select upsert_timestamp_columns ('rst', 'recreation_defined_campsite');

select setup_temporal_table ('rst', 'recreation_defined_campsite');

comment on table rst.recreation_defined_campsite is 'A defined campsite is a camping area within a project designated by the Recreation officer. This may contain recreation structures.';

comment on column rst.recreation_defined_campsite.rec_resource_id is 'File identification assigned to Provincial Forest Use files. Assigned file number. Usually the Licence, Tenure or Private Mark number.';

comment on column rst.recreation_defined_campsite.campsite_number is 'The number assigned to a defined campsite by Recreation staff.';

comment on column rst.recreation_defined_campsite.estimated_repair_cost is 'Identifies the estimated remedial repair cost for a campsite.';

comment on column rst.recreation_defined_campsite.recreation_remed_repair_code is 'Indicates the type of remedial repair applicable to the defined campsite.';

comment on column rst.recreation_defined_campsite.repair_complete_date is 'Identifies the completion date for the campsite repair.';
