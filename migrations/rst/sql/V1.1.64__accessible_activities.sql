alter table if exists rst.recreation_activity_code
    add COLUMN if not exists details text,
    add COLUMN if not exists is_accessible boolean default false;

comment on column rst.recreation_activity_code.details is 'Additional details about the activity, such as accessibility features or specific accommodations available.';
comment on column rst.recreation_activity_code.is_accessible is 'Indicates whether the activity is accessible to individuals with disabilities or special needs.';

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'trail_types') THEN
        create type rst.trail_types as ENUM
		(
			'BLUE',
			'GREEN',
			'BLACK'
		);
    END IF;
END$$;

create sequence if not exists rst.recreation_activity_code_trails_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

create table if not exists rst.recreation_activity_code_trails (
    recreation_activity_code_trails_id integer NOT NULL DEFAULT nextval('rst.recreation_activity_code_trails_id_seq'::regclass),
    recreation_activity_code integer NOT NULL,
    rec_resource_id character varying(20) NOT NULL,
    trail_type rst.trail_types NOT NULL,
    name character varying(120) NOT NULL,
    description text,
    PRIMARY KEY (recreation_activity_code_trails_id),
    CONSTRAINT recreation_activity_code_trails_rec_resource_id_fkey FOREIGN KEY (rec_resource_id)
        REFERENCES rst.recreation_resource (rec_resource_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT recreation_activity_code_trails_recreation_activity_code_fkey FOREIGN KEY (recreation_activity_code)
        REFERENCES rst.recreation_activity_code (recreation_activity_code) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

-- add standard timestamp columns and temporal history support
select upsert_timestamp_columns ('rst', 'recreation_activity_code_trails', true);

select setup_temporal_table ('rst', 'recreation_activity_code_trails', true);

comment on table rst.recreation_activity_code_trails is 'Table linking recreational resources to detailed information about recreation activity codes, including trail types and descriptions.';
comment on column rst.recreation_activity_code_trails.rec_resource_id is 'Identifier for the recreational resource (e.g. a specific trail or facility).';
comment on column rst.recreation_activity_code_trails.recreation_activity_code is 'Foreign key referencing the type of recreational activity (e.g. hiking, biking).';
comment on column rst.recreation_activity_code_trails.trail_type is 'Classification of the trail based on difficulty or accessibility (e.g. Blue, Green, Black).';
comment on column rst.recreation_activity_code_trails.name is 'Name of the accessible activity or trail.';
comment on column rst.recreation_activity_code_trails.description is 'Detailed description of the accessible activity, including any specific accommodations or features that enhance accessibility.';
