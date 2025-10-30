-- Create table for recreation access codes and sub-access codes in heirarchical manner
create table if not exists rst.recreation_access_and_sub_access_code (
  access_code varchar(3) NOT NULL,
  access_code_description varchar(100) NOT NULL,
  sub_access_code varchar(3) NOT NULL,
  sub_access_code_description varchar(100),
  PRIMARY KEY (access_code, sub_access_code)
);

-- add standard timestamp columns and temporal history support
select upsert_timestamp_columns ('rst', 'recreation_access_and_sub_access_code', true);

select setup_temporal_table ('rst', 'recreation_access_and_sub_access_code');

comment on table rst.recreation_access_and_sub_access_code is 'Codes pairing primary access codes with optional sub-access codes.';

comment on column rst.recreation_access_and_sub_access_code.access_code is 'Primary access code (e.g. R=Road, T=Trail).';
comment on column rst.recreation_access_and_sub_access_code.access_code_description is 'Description of the primary access code.';
comment on column rst.recreation_access_and_sub_access_code.sub_access_code is 'Sub access code (optional detail for primary access).';
comment on column rst.recreation_access_and_sub_access_code.sub_access_code_description is 'Description of the sub access code.';

INSERT INTO rst.recreation_access_and_sub_access_code (
  access_code, access_code_description, sub_access_code, sub_access_code_description
)
VALUES
  ('B', 'Boat-in', 'BM', 'Motorized'),
  ('B', 'Boat-in', 'BN', 'Non-motorized'),

  ('F', 'Fly-in',  'FI', 'Fly-in (floatplane)'),

  ('R', 'Road',    '2W', '2 wheel drive'),
  ('R', 'Road',    '4W', '4 wheel drive'),
  ('R', 'Road',    'MH', 'Motorhome'),

  ('T', 'Trail',   'TM', 'Multi-use'),
  ('T', 'Trail',   'TN', 'Non-motorized');
