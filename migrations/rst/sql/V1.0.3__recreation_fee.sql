-- Creating a fee code table
create table if not exists rst.recreation_fee_code (
    recreation_fee_code serial primary key,
    description varchar(120) not null
);

-- Inserting values into recreation_fee_code
insert into rst.recreation_fee_code (description)
values
    ('Camping'),
    ('Day Use'),
    ('Group Camping');

-- Creating the recreation_fee table
create table if not exists rst.recreation_fee (
    rec_resource_id varchar(200) not null references rst.recreation_resource (rec_resource_id) primary key,
    fee_amount int null,
    fee_start_date date null,
    fee_end_date date null,
    monday_ind varchar(1) default 'N',
    tuesday_ind varchar(1) default 'N',
    wednesday_ind varchar(1) default 'N',
    thursday_ind varchar(1) default 'N',
    friday_ind varchar(1) default 'N',
    saturday_ind varchar(1) default 'N',
    sunday_ind varchar(1) default 'N',
    recreation_fee_code int not null references rst.recreation_fee_code (recreation_fee_code)
);
