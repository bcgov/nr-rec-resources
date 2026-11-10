CREATE TABLE IF NOT EXISTS rst.recreation_resource_user_days_code
(
    recreation_resource_user_days_code character varying(3) COLLATE pg_catalog."default" NOT NULL,
    description character varying(120) COLLATE pg_catalog."default",
    effective_date date,
    expiry_date date,
    update_timestamp timestamp without time zone,
    CONSTRAINT recreation_resource_user_days_code_pkey PRIMARY KEY (recreation_resource_user_days_code)
);

COMMENT ON TABLE rst.recreation_resource_user_days_code
    IS 'Codes describing the Recreation Resource User Days associated with a project.';

COMMENT ON COLUMN rst.recreation_resource_user_days_code.recreation_resource_user_days_code
    IS 'Code describing the Recreation Resource User Days.';

COMMENT ON COLUMN rst.recreation_resource_user_days_code.description
    IS 'Description of the code value';

COMMENT ON COLUMN rst.recreation_resource_user_days_code.effective_date
    IS 'Date the code becomes effective';

COMMENT ON COLUMN rst.recreation_resource_user_days_code.expiry_date
    IS 'Date the code expires';

COMMENT ON COLUMN rst.recreation_resource_user_days_code.update_timestamp
    IS 'The date and time the value was last modified.';

INSERT INTO rst.recreation_resource_user_days_code (
    recreation_resource_user_days_code,
    description,
    effective_date,
    expiry_date,
    update_timestamp
) VALUES
('0K', '< 1000', '2002-03-13', '9999-12-31', '2005-06-23 11:21:06'),
('1K', '1000 - 5000', '2002-03-13', '9999-12-31', '2005-06-23 11:21:06'),
('5K', '> 5000', '2002-03-13', '9999-12-31', '2005-06-23 11:21:06');

ALTER TABLE IF EXISTS rst.recreation_resource
  ADD COLUMN IF NOT EXISTS
  recreation_user_days_code character varying(3);

ALTER TABLE IF EXISTS rst.recreation_resource
  ADD CONSTRAINT recreation_resource_recreation_user_days_code_fkey FOREIGN KEY (recreation_user_days_code)
        REFERENCES rst.recreation_resource_user_days_code (recreation_resource_user_days_code) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION;

COMMENT ON COLUMN rst.recreation_resource.recreation_user_days_code
  IS 'Code describing the Recreation User Days.';

ALTER TABLE IF EXISTS rst.recreation_resource_history
  ADD COLUMN IF NOT EXISTS
  recreation_user_days_code character varying(3);
