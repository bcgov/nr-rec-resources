create extension if not exists "postgis";

create schema if not exists rst;

create table if not exists rst.recreation_resource
(
    forest_file_id varchar(200) not null primary key,
    name           varchar(200),
    description    varchar(5000),
    site_location  varchar(200)
);

comment on table rst.recreation_resource is 'Resource information relating to a recreational file. A recreation file can have only one resource. A recreation resource must be of type Site, Reserve, Trail, or Interpretive Forest.';
