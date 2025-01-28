create extension if not exists "postgis";

create schema if not exists rst;

create table if not exists rst.recreation_resource (
    rec_resource_id varchar(200) not null primary key,
    name varchar(200),
    description varchar(5000),
    site_location varchar(200),
    display_on_public_site boolean default false
);

comment on table rst.recreation_resource is 'Resource information relating to a recreational file. A recreation file can have only one resource. A recreation resource must be of type Site, Reserve, Trail, or Interpretive Forest.';

comment on column rst.recreation_resource.rec_resource_id is 'Identification manually assigned to a Recreation Resource.';

comment on column rst.recreation_resource.name is 'Name of the Recreation Project.';

comment on column rst.recreation_resource.site_location is 'A text description generally describing the closest community or, for more isolated sites and trails, it could be a geographic feature to a recreation site or trail. e.g. VERNON, KELOWNA, PRINCE GEORGE.';
