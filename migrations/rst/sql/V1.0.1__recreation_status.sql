-- In the current FTA database the site status is saved in the recreation_comment table as a closure type comment with closure_ind = 'Y'.

-- Creating a code table as there may be status other than open/closed in the future ie: open with advisories
create table if not exists rst.recreation_status_code (
    status_code varchar(3) primary key,
    description varchar(120) not null
);

insert into rst.recreation_status_code (status_code, description)
values
    ('01', 'Open'),
    ('02', 'Closed');

create table if not exists rst.recreation_status (
    rec_resource_id varchar(200) not null references rst.recreation_resource (rec_resource_id) primary key,
    status_code varchar(3) not null references rst.recreation_status_code (status_code),
    comment varchar(5000) not null
)
