CREATE SCHEMA IF NOT EXISTS USERS;

CREATE SEQUENCE IF NOT EXISTS USERS."USER_SEQ"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 100;

CREATE TABLE IF NOT EXISTS USERS.USERS
(
    ID numeric not null
        constraint "USER_PK"
        primary key DEFAULT nextval('USERS."USER_SEQ"'),
    NAME  varchar(200) not null,
    EMAIL varchar(200) not null
);
INSERT INTO USERS.USERS (NAME, EMAIL)
VALUES ('John', 'John.ipsum@test.com'),
       ('Jane', 'Jane.ipsum@test.com'),
       ('Jack', 'Jack.ipsum@test.com'),
       ('Jill', 'Jill.ipsum@test.com'),
       ('Joe', 'Joe.ipsum@test.com');



CREATE SCHEMA IF NOT EXISTS RST;

CREATE TABLE IF NOT EXISTS RST.RECREATION_RESOURCE
(
    FOREST_FILE_ID varchar(200) not null primary key,
    NAME           varchar(200) not null,
    DESCRIPTION    varchar(200) not null
);

INSERT INTO RST.RECREATION_RESOURCE (FOREST_FILE_ID, NAME, DESCRIPTION)
VALUES ('1', 'Rec site 1', 'Rec site 1 description'),
       ('2', 'Rec site 2', 'Rec site 2 description'),
       ('3', 'Rec site 3', 'Rec site 3 description'),
       ('4', 'Rec site 4', 'Rec site 4 description'),
       ('5', 'Rec site 5', 'Rec site 5 description');
