create table if not exists rst.recreation_site_point
(
    rec_resource_id varchar(10) not null primary key,
    geometry        geometry,
    revision_count  integer,
    unique (rec_resource_id, geometry)
);

select upsert_timestamp_columns('rst', 'recreation_site_point');

select setup_temporal_table('rst', 'recreation_site_point');


comment on table rst.recreation_site_point is 'Stores the location of a Recreation Site as a point geometry. The data is used to provide the public a map location of the Recreation Site.';

comment on column rst.recreation_site_point.rec_resource_id is 'Identification manually assigned to a Recreation Resource.';


comment on column rst.recreation_site_point.geometry is 'A point geometry location represented by a single X,Y pair';

comment on column rst.recreation_site_point.revision_count is 'A count of the number of times an entry in the entity has been modified. Used to validate if the current information displayed on a user"s web browser is the most current.';
