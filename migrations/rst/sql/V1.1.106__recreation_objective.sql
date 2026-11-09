-- Create rst.recreation_objective for objective-list export and objective migration.

CREATE TABLE IF NOT EXISTS rst.recreation_objective (
  rec_resource_id varchar(20) NOT NULL,
  objective_id integer NOT NULL,
  objective_description varchar(2000),
  objective_established_date date,
  objective_amended_date date,
  objective_cancelled_date date,
  revision_count integer,
  entry_userid varchar(30),
  entry_timestamp timestamp,
  update_userid varchar(30),
  update_timestamp timestamp,
  updated_at timestamp(6) DEFAULT now(),
  updated_by varchar(30),
  created_at timestamp(6) DEFAULT now(),
  created_by varchar(30),
  sys_period tstzrange DEFAULT tstzrange(CURRENT_TIMESTAMP, NULL::timestamp with time zone),
  CONSTRAINT recreation_objective_pk PRIMARY KEY (rec_resource_id, objective_id),
  CONSTRAINT recreation_objective_rec_resource_id_fk
    FOREIGN KEY (rec_resource_id)
    REFERENCES rst.recreation_resource (rec_resource_id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

COMMENT ON TABLE rst.recreation_objective IS
  'Objectives pertaining to a recreation resource. Backfilled from fta.recreation_objective.';

COMMENT ON COLUMN rst.recreation_objective.rec_resource_id IS
  'RST recreation resource identifier.';

COMMENT ON COLUMN rst.recreation_objective.objective_id IS
  'Objective identifier from FTA.';

COMMENT ON COLUMN rst.recreation_objective.objective_description IS
  'Objective description text.';

COMMENT ON COLUMN rst.recreation_objective.objective_established_date IS
  'Date objective was established.';

COMMENT ON COLUMN rst.recreation_objective.objective_amended_date IS
  'Date objective was amended.';

COMMENT ON COLUMN rst.recreation_objective.objective_cancelled_date IS
  'Date objective was cancelled.';

COMMENT ON COLUMN rst.recreation_objective.revision_count IS
  'Revision count value from source record.';

COMMENT ON COLUMN rst.recreation_objective.entry_userid IS
  'Source userid that inserted the objective record.';

COMMENT ON COLUMN rst.recreation_objective.entry_timestamp IS
  'Source timestamp for insert.';

COMMENT ON COLUMN rst.recreation_objective.update_userid IS
  'Source userid that last updated the objective record.';

COMMENT ON COLUMN rst.recreation_objective.update_timestamp IS
  'Source timestamp for last update.';

SELECT upsert_timestamp_columns('rst', 'recreation_objective');
SELECT setup_temporal_table('rst', 'recreation_objective', false);
