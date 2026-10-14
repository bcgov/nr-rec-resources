-- Notes and references for a recreation resource.
--
-- Holds staff-authored notes alongside records imported from FTA. Imported rows
-- have source_system = 'FTA' and are read-only in the admin app.

create table if not exists rst.recreation_note_type_code (
    note_type_code varchar(20) primary key,
    description    varchar(120) not null
);

select upsert_timestamp_columns ('rst', 'recreation_note_type_code', true);

select setup_temporal_table ('rst', 'recreation_note_type_code', false);

comment on table rst.recreation_note_type_code is 'Codes describing the kind of note held against a recreation resource. Not FTA-synced; managed internally.';

comment on column rst.recreation_note_type_code.note_type_code is 'Code identifying the note type.';

comment on column rst.recreation_note_type_code.description is 'Description of the note type.';

insert into rst.recreation_note_type_code (note_type_code, description)
values
    ('NOTE', 'Note'),
    ('REFERENCE', 'Reference'),
    ('FILE', 'Associated file')
on conflict (note_type_code) do nothing;


-- Source of an associated file reference in FTA's ASSOCIATED_USE table. A few
-- descriptions are truncated at source and recorded here as observed.
create table if not exists rst.recreation_file_source_code (
    file_source_code varchar(1) primary key,
    description      varchar(120) not null
);

select upsert_timestamp_columns ('rst', 'recreation_file_source_code', true);

select setup_temporal_table ('rst', 'recreation_file_source_code', false);

comment on table rst.recreation_file_source_code is 'Codes identifying the system or authority an associated file reference originates from, imported from FTA ASSOCIATED_USE.';

comment on column rst.recreation_file_source_code.file_source_code is 'Single character code identifying the file source.';

comment on column rst.recreation_file_source_code.description is 'Description of the file source.';

insert into rst.recreation_file_source_code (file_source_code, description)
values
    ('A', 'Ministry of Agriculture and F'),
    ('B', 'BC Assessment Authority'),
    ('C', 'Cross Reference No./Previous'),
    ('D', 'Ministry of Regional and Econ'),
    ('E', 'Ministry of Energy, Mines and'),
    ('F', 'Forest Tenure System (FTAS)'),
    ('H', 'Ministry of Transportation an'),
    ('K', 'ORCS'),
    ('L', 'Land Titles Office'),
    ('M', 'Municipal'),
    ('N', 'Ministry of Native Affairs'),
    ('O', 'Order in Council (OIC)'),
    ('P', 'Ministry of Lands and Parks'),
    ('R', 'Regional District'),
    ('S', 'Silviculture'),
    ('V', 'Ministry of Environment'),
    ('W', 'Water Management Branch'),
    ('X', 'External Client Reference'),
    ('Y', 'Federal Fisheries and Oceans')
on conflict (file_source_code) do nothing;


create table if not exists rst.recreation_resource_note (
    note_id         uuid         primary key default gen_random_uuid(),
    rec_resource_id varchar(10)  not null references rst.recreation_resource,
    note_type_code  varchar(20)  not null default 'NOTE'
                                 references rst.recreation_note_type_code,
    title           varchar(100) not null,
    body            text         not null,
    date_logged     date         not null default current_date,
    source_system   varchar(10)  not null default 'RST',
    source_key      varchar(60)
);

select upsert_timestamp_columns ('rst', 'recreation_resource_note', false);

select setup_temporal_table ('rst', 'recreation_resource_note', false);

comment on table rst.recreation_resource_note is 'Notes and references held against a recreation resource. Staff-authored rows have source_system RST; rows imported from FTA have source_system FTA and are read-only.';

comment on column rst.recreation_resource_note.note_id is 'Unique UUID identifier for the note.';

comment on column rst.recreation_resource_note.rec_resource_id is 'Recreation Resource ID this note belongs to.';

comment on column rst.recreation_resource_note.note_type_code is 'Kind of note. Only NOTE is currently reachable from the admin app.';

comment on column rst.recreation_resource_note.title is 'Short title shown at the top of the note card.';

comment on column rst.recreation_resource_note.body is 'Note body as sanitised HTML.';

comment on column rst.recreation_resource_note.date_logged is 'Date the note was logged. For imported rows this is the FTA entry date, which predates the import.';

comment on column rst.recreation_resource_note.source_system is 'System the note originated in: RST for staff-authored, FTA for imported.';

comment on column rst.recreation_resource_note.source_key is 'Natural key of the row in the source system, used to make re-import idempotent. Null for staff-authored notes.';

-- Partial so staff-authored rows, which have no source_key, are unconstrained.
create unique index if not exists uq_recreation_resource_note_source
    on rst.recreation_resource_note (source_system, source_key)
    where source_key is not null;

create index if not exists idx_recreation_resource_note_rec_resource_id
    on rst.recreation_resource_note (rec_resource_id);
