CREATE SCHEMA IF NOT EXISTS RST;

CREATE TABLE IF NOT EXISTS RST.RECREATION_RESOURCE
(
    FOREST_FILE_ID varchar(200) not null primary key,
    NAME           varchar(200) not null,
    DESCRIPTION    varchar(200) not null
);

INSERT INTO RST.RECREATION_RESOURCE (FOREST_FILE_ID, NAME, DESCRIPTION)
VALUES ('REC0001', 'Rec site 1', 'Rec site 1 description'),
       ('REC0002', 'Rec site 2', 'Rec site 2 description'),
       ('REC0003', 'Rec site 3', 'Rec site 3 description'),
       ('REC0004', 'Rec site 4', 'Rec site 4 description'),
       ('REC0005', 'Rec site 5', 'Rec site 5 description');
