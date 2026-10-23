ALTER TABLE rst.recreation_resource
ADD recreation_resource_type character varying(3) COLLATE pg_catalog."default";
ALTER TABLE rst.recreation_resource
ADD CONSTRAINT recreation_resource_recreation_resource_type_fkey FOREIGN KEY (recreation_resource_type)
        REFERENCES rst.recreation_resource_type_code (rec_resource_type_code) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION;


UPDATE rst.recreation_resource AS r
SET recreation_resource_type = f.recreation_resource_type
FROM rst.recreation_map_feature AS f
WHERE r.rec_resource_id = f.rec_resource_id;
