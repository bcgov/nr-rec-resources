-- Create the resource_images table if it doesn't exist
create table if not exists rst.recreation_resource_images
(
    rec_resource_id varchar(10) references rst.recreation_resource,
    ref_id          varchar unique ,
    caption         varchar,
    primary key (rec_resource_id, ref_id)
);

select upsert_timestamp_columns('rst', 'recreation_resource_images');

select setup_temporal_table('rst', 'recreation_resource_images');


create table if not exists rst.recreation_resource_image_variants
(
    ref_id    varchar references rst.recreation_resource_images (ref_id),
    size_code varchar(20),
    url       text,
    width     integer,
    height    integer,
    extension varchar(10),
    primary key (ref_id, size_code)
);

select upsert_timestamp_columns('rst', 'recreation_resource_image_variants');

select setup_temporal_table('rst', 'recreation_resource_image_variants');
