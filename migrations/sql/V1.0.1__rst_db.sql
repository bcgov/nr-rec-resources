CREATE EXTENSION IF NOT EXISTS "postgis";

CREATE TABLE RECREATION_PROJECT (
    FOREST_FILE_ID VARCHAR(10) PRIMARY KEY,
    PROJECT_NAME VARCHAR(100),
    RECREATION_CONTROL_ACCESS_CODE VARCHAR(1) NULL,
    RECREATION_FEATURE_CODE VARCHAR(3) NULL,
    RECREATION_MAINTAIN_STD_CODE VARCHAR(1) NULL,
    RECREATION_RISK_RATING_CODE VARCHAR(3) NULL,
    UTM_ZONE INT NULL,
    LAST_REC_INSPECTION_DATE DATE NULL,
    REC_PROJECT_SKEY INT NULL,
    RESOURCE_FEATURE_IND VARCHAR(1) DEFAULT 'N',
    LAST_HZRD_TREE_ASSESS_DATE DATE NULL,
    SITE_DESCRIPTION VARCHAR(500) NULL,
    RECREATION_USER_DAYS_CODE VARCHAR(3) NULL,
    OVERFLOW_CAMPSITES INT NULL,
    UTM_NORTHING INT NULL,
    UTM_EASTING INT NULL,
    RIGHT_OF_WAY NUMERIC(7, 1) NULL,
    ARCH_IMPACT_ASSESS_IND VARCHAR(1) NULL,
    SITE_LOCATION VARCHAR(500) NULL,
    PROJECT_ESTABLISHED_DATE DATE NULL,
    RECREATION_VIEW_IND VARCHAR(1) DEFAULT 'N',
    REVISION_COUNT INT NULL,
    ENTRY_USERID VARCHAR(30) NULL,
    ENTRY_TIMESTAMP DATE NULL,
    UPDATE_USERID VARCHAR(30) NULL,
    UPDATE_TIMESTAMP DATE NULL,
    ARCH_IMPACT_DATE DATE NULL,
    BORDEN_NO VARCHAR(200) NULL,
    CAMP_HOST_IND VARCHAR(1) DEFAULT 'N',
    LOW_MOBILITY_ACCESS_IND VARCHAR(1) DEFAULT 'N'
);

CREATE TABLE RECREATION_ACCESS (
    FOREST_FILE_ID VARCHAR(10) PRIMARY KEY,
    RECREATION_ACCESS_CODE VARCHAR(3) NOT NULL,
    RECREATION_SUB_ACCESS_CODE VARCHAR(3) NOT NULL,
    REVISION_COUNT INTEGER,
    ENTRY_USERID VARCHAR(30),
    ENTRY_TIMESTAMP TIMESTAMP,
    UPDATE_USERID VARCHAR(30),
    UPDATE_TIMESTAMP TIMESTAMP
);

CREATE TABLE RECREATION_ACCESS_CODE (
    RECREATION_ACCESS_CODE VARCHAR(3) NOT NULL,
    DESCRIPTION VARCHAR(120),
    EFFECTIVE_DATE DATE,
    EXPIRY_DATE DATE,
    UPDATE_TIMESTAMP TIMESTAMP
);

CREATE TABLE RECREATION_ACCESS_XREF (
    RECREATION_ACCESS_CODE VARCHAR(3) NOT NULL,
    RECREATION_SUB_ACCESS_CODE VARCHAR(3) NOT NULL,
    REVISION_COUNT INTEGER,
    ENTRY_USERID VARCHAR(30),
    ENTRY_TIMESTAMP TIMESTAMP,
    UPDATE_USERID VARCHAR(30),
    UPDATE_TIMESTAMP TIMESTAMP,
    FOREST_FILE_ID VARCHAR(10)
);

CREATE TABLE RECREATION_ACTIVITY (
    FOREST_FILE_ID VARCHAR(10) PRIMARY KEY,
    RECREATION_ACTIVITY_CODE VARCHAR(3) NOT NULL,
    ACTIVITY_RANK INT,
    REVISION_COUNT INT,
    ENTRY_USERID VARCHAR(30),
    ENTRY_TIMESTAMP TIMESTAMP,
    UPDATE_USERID VARCHAR(30),
    UPDATE_TIMESTAMP TIMESTAMP
);

CREATE TABLE RECREATION_ACTIVITY_CODE (
    RECREATION_ACTIVITY_CODE VARCHAR(3) PRIMARY KEY,
    DESCRIPTION VARCHAR(120),
    EFFECTIVE_DATE DATE,
    EXPIRY_DATE DATE,
    UPDATE_TIMESTAMP TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE RECREATION_AGREEMENT_HOLDER (
    AGREEMENT_HOLDER_ID SERIAL PRIMARY KEY,
    FOREST_FILE_ID VARCHAR(10) REFERENCES RECREATION_PROJECT(FOREST_FILE_ID) ON DELETE RESTRICT,
    CLIENT_NUMBER VARCHAR(8),
    CLIENT_LOCN_CODE VARCHAR(2),
    AGREEMENT_START_DATE DATE,
    AGREEMENT_END_DATE DATE,
    REVISION_COUNT INT,
    ENTRY_USERID VARCHAR(30),
    ENTRY_TIMESTAMP TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UPDATE_USERID VARCHAR(30),
    UPDATE_TIMESTAMP TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE RECREATION_ATTACHMENT (
    FOREST_FILE_ID VARCHAR(10) PRIMARY KEY,
    RECREATION_ATTACHMENT_ID SERIAL NOT NULL,
    ATTACHMENT_FILE_NAME VARCHAR(50),
    REVISION_COUNT INT,
    ENTRY_USERID VARCHAR(30),
    ENTRY_TIMESTAMP TIMESTAMP,
    UPDATE_USERID VARCHAR(30),
    UPDATE_TIMESTAMP TIMESTAMP
);

CREATE TABLE RECREATION_ATTACHMENT_CONTENT (
    FOREST_FILE_ID VARCHAR(10) REFERENCES RECREATION_ATTACHMENT(FOREST_FILE_ID) ON DELETE RESTRICT,
    RECREATION_ATTACHMENT_ID INT,
    ATTACHMENT_CONTENT BYTEA,
    PRIMARY KEY (FOREST_FILE_ID, RECREATION_ATTACHMENT_ID)
);

CREATE TABLE RECREATION_COMMENT (
    FOREST_FILE_ID VARCHAR(10) REFERENCES RECREATION_PROJECT(FOREST_FILE_ID) ON DELETE RESTRICT,
    RECREATION_COMMENT_ID SERIAL PRIMARY KEY,
    REC_COMMENT_TYPE_CODE VARCHAR(4),
    CLOSURE_IND CHAR(1) DEFAULT 'N',
    PROJECT_COMMENT VARCHAR(2000),
    COMMENT_DATE DATE,
    REVISION_COUNT INT,
    ENTRY_USERID VARCHAR(30),
    ENTRY_TIMESTAMP TIMESTAMP,
    UPDATE_USERID VARCHAR(30),
    UPDATE_TIMESTAMP TIMESTAMP
);

CREATE TABLE RECREATION_CONTROL_ACCESS_CODE (
    RECREATION_CONTROL_ACCESS_CODE VARCHAR(1) PRIMARY KEY,
    DESCRIPTION VARCHAR(120),
    EFFECTIVE_DATE DATE,
    EXPIRY_DATE DATE,
    UPDATE_TIMESTAMP TIMESTAMP
);

CREATE TABLE RECREATION_DEF_CS_RPR_HISTORY (
    FOREST_FILE_ID VARCHAR(10) NOT NULL,
    CAMPSITE_NUMBER INT NOT NULL,
    RECREATION_REMED_REPAIR_CODE VARCHAR(2) NULL,
    ESTIMATED_REPAIR_COST NUMERIC(7, 2) NULL,
    REPAIR_COMPLETE_DATE DATE NULL,
    REVISION_COUNT INT NULL,
    ENTRY_USERID VARCHAR(30) NULL,
    ENTRY_TIMESTAMP TIMESTAMP NULL,
    UPDATE_USERID VARCHAR(30) NULL,
    UPDATE_TIMESTAMP TIMESTAMP NULL,
    PRIMARY KEY (FOREST_FILE_ID, CAMPSITE_NUMBER)
);

CREATE TABLE RECREATION_DEFINED_CAMPSITE (
    FOREST_FILE_ID VARCHAR(10) PRIMARY KEY,
    CAMPSITE_NUMBER INT NOT NULL,
    ESTIMATED_REPAIR_COST NUMERIC(7,2),
    RECREATION_REMED_REPAIR_CODE VARCHAR(2),
    REPAIR_COMPLETE_DATE DATE,
    REVISION_COUNT INT,
    ENTRY_USERID VARCHAR(30),
    ENTRY_TIMESTAMP TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UPDATE_USERID VARCHAR(30),
    UPDATE_TIMESTAMP TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE RECREATION_DISTRICT_CODE (
    RECREATION_DISTRICT_CODE VARCHAR(4) PRIMARY KEY,
    DESCRIPTION VARCHAR(120),
    EFFECTIVE_DATE DATE,
    EXPIRY_DATE DATE,
    UPDATE_TIMESTAMP TIMESTAMP
);

CREATE TABLE RECREATION_DISTRICT_XREF (
    FOREST_FILE_ID VARCHAR(10) NOT NULL,
    RECREATION_DISTRICT_CODE VARCHAR(4) NOT NULL,
    REVISION_COUNT INT,
    ENTRY_USERID VARCHAR(30),
    ENTRY_TIMESTAMP TIMESTAMP,
    UPDATE_USERID VARCHAR(30),
    UPDATE_TIMESTAMP TIMESTAMP
);

CREATE TABLE RECREATION_FEATURE_CODE (
    RECREATION_FEATURE_CODE VARCHAR(3) PRIMARY KEY,
    DESCRIPTION VARCHAR(120),
    EFFECTIVE_DATE DATE,
    EXPIRY_DATE DATE,
    UPDATE_TIMESTAMP TIMESTAMP
);

CREATE TABLE RECREATION_FEE_CODE (
    RECREATION_FEE_CODE VARCHAR(3) PRIMARY KEY,
    DESCRIPTION VARCHAR(120),
    EFFECTIVE_DATE DATE,
    EXPIRY_DATE DATE,
    UPDATE_TIMESTAMP TIMESTAMP
);

CREATE TABLE RECREATION_FEE (
    FEE_ID SERIAL PRIMARY KEY,
    FOREST_FILE_ID VARCHAR(10) REFERENCES RECREATION_PROJECT(FOREST_FILE_ID) ON DELETE RESTRICT,
    FEE_AMOUNT NUMERIC(5,2) DEFAULT NULL,
    FEE_START_DATE DATE DEFAULT NULL,
    FEE_END_DATE DATE DEFAULT NULL,
    MONDAY_IND VARCHAR(1) DEFAULT 'N',
    TUESDAY_IND VARCHAR(1) DEFAULT 'N',
    WEDNESDAY_IND VARCHAR(1) DEFAULT 'N',
    THURSDAY_IND VARCHAR(1) DEFAULT 'N',
    FRIDAY_IND VARCHAR(1) DEFAULT 'N',
    SATURDAY_IND VARCHAR(1) DEFAULT 'N',
    SUNDAY_IND VARCHAR(1) DEFAULT 'N',
    RECREATION_FEE_CODE VARCHAR(3) REFERENCES RECREATION_FEE_CODE(RECREATION_FEE_CODE) ON DELETE RESTRICT,
    REVISION_COUNT NUMERIC(5) DEFAULT NULL,
    ENTRY_USERID VARCHAR(30) DEFAULT NULL,
    ENTRY_TIMESTAMP TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UPDATE_USERID VARCHAR(30) DEFAULT NULL,
    UPDATE_TIMESTAMP TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE RECREATION_FILE_STATUS_CODE (
    RECREATION_FILE_STATUS_CODE VARCHAR(3) PRIMARY KEY,
    DESCRIPTION VARCHAR(120),
    EFFECTIVE_DATE DATE,
    EXPIRY_DATE DATE,
    UPDATE_TIMESTAMP TIMESTAMP
);

CREATE TABLE RECREATION_FILE_TYPE_CODE (
    RECREATION_FILE_TYPE_CODE VARCHAR(3) PRIMARY KEY,
    DESCRIPTION VARCHAR(120),
    EFFECTIVE_DATE DATE,
    EXPIRY_DATE DATE,
    UPDATE_TIMESTAMP DATE
);

CREATE TABLE RECREATION_INSPECTION_REPORT (
    INSPECTION_ID NUMERIC PRIMARY KEY,
    FOREST_FILE_ID VARCHAR(10),
    SITE_OCCUPANCY_CODE VARCHAR(10),
    REC_FILE_TYPE_CODE VARCHAR(10),
    SITE_NAME VARCHAR(50),
    LOCATION VARCHAR(100),
    INSPECTED_BY VARCHAR(30),
    CAMPSITE_NO NUMERIC,
    OCCUPIED_CAMPSITE_NO NUMERIC,
    VEHICLE_NO NUMERIC,
    CAMPING_PARTY_NO NUMERIC,
    DAY_USE_PARTY_NO NUMERIC,
    WITH_PASS_NO NUMERIC,
    WITHOUT_PASS_NO NUMERIC,
    ABSENT_OWNER_NO NUMERIC,
    TOTAL_INSPECTED_NO NUMERIC,
    PURCHASED_PASS_NO NUMERIC,
    REFUSED_PASS_NO NUMERIC,
    CONTRACT_ID VARCHAR(20),
    CONTRACTOR VARCHAR(30),
    REC_PROJECT_SKEY NUMERIC,
    ENTRY_USERID VARCHAR(30) DEFAULT NULL,
    ENTRY_TIMESTAMP TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UPDATE_USERID VARCHAR(30) DEFAULT NULL,
    UPDATE_TIMESTAMP TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE RECREATION_MAINTAIN_STD_CODE (
    RECREATION_MAINTAIN_STD_CODE VARCHAR(1) PRIMARY KEY,
    DESCRIPTION VARCHAR(120),
    EFFECTIVE_DATE DATE,
    EXPIRY_DATE DATE,
    UPDATE_TIMESTAMP TIMESTAMP
);

CREATE TABLE RECREATION_MAP_FEATURE_CODE (
    RECREATION_MAP_FEATURE_CODE VARCHAR(3) PRIMARY KEY,
    DESCRIPTION VARCHAR(120),
    EFFECTIVE_DATE DATE,
    EXPIRY_DATE DATE,
    UPDATE_TIMESTAMP TIMESTAMP
);

CREATE TABLE RECREATION_MAP_FEATURE_GEOM (
    RMF_SKEY SERIAL PRIMARY KEY,
    MAP_FEATURE_ID INT,
    GEOMETRY_TYPE_CODE VARCHAR(4),
    GEOMETRY GEOMETRY,
    FEATURE_AREA NUMERIC(11,4),
    FEATURE_LENGTH NUMERIC(11,4),
    FEATURE_PERIMETER NUMERIC(11,4),
    REVISION_COUNT INT,
    ENTRY_USERID VARCHAR(30),
    ENTRY_TIMESTAMP TIMESTAMP,
    UPDATE_USERID VARCHAR(30),
    UPDATE_TIMESTAMP TIMESTAMP
);

CREATE TABLE RECREATION_MAP_FEATURE_XGUID (
    RMF_GUID BYTEA PRIMARY KEY,
    RMF_SKEY INT
);

CREATE TABLE RECREATION_MAP_FEATURE (
    RMF_SKEY INTEGER PRIMARY KEY,
    FOREST_FILE_ID VARCHAR(10),
    SECTION_ID VARCHAR(30) NULL,
    AMENDMENT_ID INTEGER,
    AMEND_STATUS_CODE VARCHAR(3),
    RECREATION_MAP_FEATURE_CODE VARCHAR(3),
    CURRENT_IND VARCHAR(1),
    AMEND_STATUS_DATE DATE,
    RETIREMENT_DATE DATE NULL,
    REVISION_COUNT INTEGER,
    ENTRY_USERID VARCHAR(30),
    ENTRY_TIMESTAMP DATE,
    UPDATE_USERID VARCHAR(30),
    UPDATE_TIMESTAMP DATE,
    RECREATION_MAP_FEATURE_GUID UUID DEFAULT gen_random_uuid()
);

CREATE TABLE RECREATION_OBJECTIVE (
    OBJECTIVE_ID SERIAL PRIMARY KEY,
    FOREST_FILE_ID VARCHAR(10) NOT NULL,
    OBJECTIVE_DESCRIPTION VARCHAR(2000),
    OBJECTIVE_ESTABLISHED_DATE DATE,
    OBJECTIVE_AMENDED_DATE DATE,
    OBJECTIVE_CANCELLED_DATE DATE,
    REVISION_COUNT INTEGER DEFAULT 0,
    ENTRY_USERID VARCHAR(30),
    ENTRY_TIMESTAMP TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UPDATE_USERID VARCHAR(30),
    UPDATE_TIMESTAMP TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE RECREATION_OCCUPANCY_CODE (
    RECREATION_OCCUPANCY_CODE VARCHAR(10) PRIMARY KEY,
    DESCRIPTION VARCHAR(120),
    EFFECTIVE_DATE DATE,
    EXPIRY_DATE DATE,
    UPDATE_TIMESTAMP TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE RECREATION_PLAN (
    FOREST_FILE_ID VARCHAR(10),
    REC_PROJECT_SKEY INT,
    PLAN_TYPE_CODE CHAR(1),
    REMARKS VARCHAR(254),
    PRIMARY KEY (FOREST_FILE_ID, REC_PROJECT_SKEY, PLAN_TYPE_CODE)
);

CREATE TABLE RECREATION_REMED_REPAIR_CODE (
    RECREATION_REMED_REPAIR_CODE VARCHAR(2) PRIMARY KEY,
    DESCRIPTION VARCHAR(120),
    EFFECTIVE_DATE DATE,
    EXPIRY_DATE DATE,
    UPDATE_TIMESTAMP TIMESTAMP
);

CREATE TABLE RECREATION_RISK_EVALUATION (
    RISK_EVALUATION_ID BIGINT PRIMARY KEY,
    RECREATION_USER_DAYS_CODE VARCHAR(10),
    RECREATION_OCCUPANCY_CODE VARCHAR(10),
    ENTRY_TIMESTAMP TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ENTRY_USERID VARCHAR(30),
    UPDATE_TIMESTAMP TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UPDATE_USERID VARCHAR(30)
);

CREATE TABLE RECREATION_RISK_RATING_CODE (
    RECREATION_RISK_RATING_CODE VARCHAR(3) PRIMARY KEY,
    DESCRIPTION VARCHAR(120),
    EFFECTIVE_DATE DATE,
    EXPIRY_DATE DATE,
    UPDATE_TIMESTAMP TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE RECREATION_RISK_SITE (
    RISK_SITE_ID SERIAL PRIMARY KEY,
    FOREST_FILE_ID VARCHAR(10),
    ENTRY_TIMESTAMP DATE,
    ENTRY_USERID VARCHAR(30),
    UPDATE_TIMESTAMP DATE,
    UPDATE_USERID VARCHAR(30)
);

CREATE TABLE RECREATION_SEARCH_RESULT (
    FOREST_FILE_ID VARCHAR(10) NULL,
    ORG_UNIT_CODE VARCHAR(6) NULL,
    ORG_UNIT_NAME VARCHAR(100) NULL,
    FILE_STATUS_CODE VARCHAR(3) NULL,
    PROJECT_NAME VARCHAR(100) NULL,
    PROJECT_TYPE VARCHAR(240) NULL,
    RECREATION_PROJECT_CODE VARCHAR(3) NULL,
    RECREATION_PROJECT_CODE_DESC VARCHAR(120) NULL
);

CREATE TABLE RECREATION_SITE (
    FOREST_FILE_ID VARCHAR(10) PRIMARY KEY,
    REC_SITE_NAME VARCHAR(50) NULL
);

CREATE TABLE RECREATION_SITE_POINT (
    FOREST_FILE_ID VARCHAR(10) PRIMARY KEY,
    GEOMETRY GEOMETRY,
    REVISION_COUNT INTEGER,
    ENTRY_USERID VARCHAR(30),
    ENTRY_TIMESTAMP TIMESTAMP,
    UPDATE_USERID VARCHAR(30),
    UPDATE_TIMESTAMP TIMESTAMP
);

CREATE TABLE RECREATION_STRUCT_DIMEN_CODE (
    RECREATION_STRUCT_DIMEN_CODE VARCHAR(2) PRIMARY KEY,
    DESCRIPTION VARCHAR(120) NULL,
    EFFECTIVE_DATE DATE NULL,
    EXPIRY_DATE DATE NULL,
    UPDATE_TIMESTAMP DATE NULL
);

CREATE TABLE RECREATION_STRUCT_DIMEN_XREF (
    RECREATION_STRUCTURE_CODE VARCHAR(3),
    RECREATION_STRUCT_DIMEN_CODE VARCHAR(2),
    REVISION_COUNT INT NULL,
    ENTRY_USERID VARCHAR(30) NULL,
    ENTRY_TIMESTAMP TIMESTAMP NULL,
    UPDATE_USERID VARCHAR(30) NULL,
    UPDATE_TIMESTAMP TIMESTAMP NULL,
    PRIMARY KEY (RECREATION_STRUCTURE_CODE, RECREATION_STRUCT_DIMEN_CODE)
);

CREATE TABLE RECREATION_STRUCTURE_CODE (
    RECREATION_STRUCTURE_CODE VARCHAR(3) PRIMARY KEY,
    DESCRIPTION VARCHAR(120),
    EFFECTIVE_DATE DATE,
    EXPIRY_DATE DATE,
    UPDATE_TIMESTAMP DATE
);

CREATE TABLE RECREATION_STRUCTURE (
    STRUCTURE_ID NUMERIC(10) PRIMARY KEY,
    FOREST_FILE_ID VARCHAR(10) NOT NULL REFERENCES RECREATION_PROJECT (FOREST_FILE_ID) ON DELETE RESTRICT,
    CAMPSITE_FOREST_FILE_ID VARCHAR(10) NULL,
    CAMPSITE_NUMBER NUMERIC(3) NULL,
    RECREATION_STRUCTURE_CODE VARCHAR(3) NULL REFERENCES RECREATION_STRUCTURE_CODE (RECREATION_STRUCTURE_CODE) ON DELETE RESTRICT,
    STRUCTURE_NAME VARCHAR(100),
    STRUCTURE_COUNT NUMERIC(3),
    STRUCTURE_LENGTH NUMERIC(7, 1),
    STRUCTURE_WIDTH NUMERIC(7, 1),
    STRUCTURE_AREA NUMERIC(7, 1),
    ACTUAL_VALUE NUMERIC(7, 2),
    RECREATION_REMED_REPAIR_CODE VARCHAR(2) NULL REFERENCES RECREATION_REMED_REPAIR_CODE (RECREATION_REMED_REPAIR_CODE) ON DELETE RESTRICT,
    ESTIMATED_REPAIR_COST NUMERIC(10, 2),
    REPAIR_COMPLETED_DATE DATE,
    REVISION_COUNT NUMERIC(5),
    ENTRY_USERID VARCHAR(30),
    ENTRY_TIMESTAMP TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UPDATE_USERID VARCHAR(30),
    UPDATE_TIMESTAMP TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE RECREATION_STRUCTURE_VALUE (
    RECREATION_STRUCTURE_CODE VARCHAR(3) NOT NULL,
    STRUCTURE_VALUE NUMERIC(7, 2),
    DIMENSION VARCHAR(1) DEFAULT 'U',
    REVISION_COUNT NUMERIC(5),
    ENTRY_USERID VARCHAR(30),
    ENTRY_TIMESTAMP DATE,
    UPDATE_USERID VARCHAR(30),
    UPDATE_TIMESTAMP DATE,
    PRIMARY KEY (RECREATION_STRUCTURE_CODE)
);

CREATE TABLE RECREATION_SUB_ACCESS_CODE (
    RECREATION_SUB_ACCESS_CODE VARCHAR(3) PRIMARY KEY,
    DESCRIPTION VARCHAR(120),
    EFFECTIVE_DATE DATE,
    EXPIRY_DATE DATE,
    UPDATE_TIMESTAMP TIMESTAMP
);

CREATE TABLE RECREATION_TRAIL_SEGMENT (
    FOREST_FILE_ID VARCHAR(10) NOT NULL,
    RECREATION_TRAIL_SEG_ID SERIAL NOT NULL,
    TRAIL_SEGMENT_NAME VARCHAR(50),
    START_STATION NUMERIC(11, 4),
    END_STATION NUMERIC(11, 4),
    RECREATION_REMED_REPAIR_CODE VARCHAR(2),
    ESTIMATED_REPAIR_COST NUMERIC(10, 2),
    ACTUAL_REPAIR_COST NUMERIC(10, 2),
    REPAIR_COMPLETED_DATE DATE,
    WHEELCHAIR_ACCESSIBLE_IND CHAR(1),
    REVISION_COUNT INTEGER,
    ENTRY_USERID VARCHAR(30),
    ENTRY_TIMESTAMP TIMESTAMP,
    UPDATE_USERID VARCHAR(30),
    UPDATE_TIMESTAMP TIMESTAMP,
    PRIMARY KEY (FOREST_FILE_ID, RECREATION_TRAIL_SEG_ID),
    UNIQUE (FOREST_FILE_ID, TRAIL_SEGMENT_NAME)
);

CREATE TABLE RECREATION_USER_DAYS_CODE (
    RECREATION_USER_DAYS_CODE VARCHAR(10) NOT NULL PRIMARY KEY,
    DESCRIPTION VARCHAR(120),
    EFFECTIVE_DATE DATE,
    EXPIRY_DATE DATE,
    UPDATE_TIMESTAMP TIMESTAMP
);