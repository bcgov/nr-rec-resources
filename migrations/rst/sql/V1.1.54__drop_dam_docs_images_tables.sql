-- Drop previous image and document tables
-- New tables are rst.recreation_resource_image and rst.recreation_resource_document
drop table if exists rst.recreation_resource_images cascade;
drop table if exists rst.recreation_resource_image_variants;
drop table if exists rst.recreation_resource_docs;
