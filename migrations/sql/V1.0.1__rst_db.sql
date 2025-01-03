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
    LOW_MOBILITY_ACCESS_IND VARCHAR(1) DEFAULT 'N',
    CONSTRAINT CHK_RESOURCE_FEATURE_IND CHECK (RESOURCE_FEATURE_IND IN ('N', 'Y')),
    CONSTRAINT CHK_ARCH_IMPACT_ASSESS_IND CHECK (ARCH_IMPACT_ASSESS_IND IN ('Y', 'N')),
    CONSTRAINT CHK_RECREATION_VIEW_IND CHECK (RECREATION_VIEW_IND IN ('Y', 'N')),
    CONSTRAINT CHK_CAMP_HOST_IND CHECK (CAMP_HOST_IND IN ('Y', 'N'))
);

COMMENT ON TABLE RECREATION_PROJECT IS 'Project information relating to a recreational file. A recreation file can have only one project. A project must be of type Site, Reserve, Trail, or Interpretive Forest.';

COMMENT ON COLUMN RECREATION_PROJECT.FOREST_FILE_ID IS 'File identification assigned to Provincial Forest Use files. Assigned file number. Usually the Licence, Tenure or Private Mark number.';
COMMENT ON COLUMN RECREATION_PROJECT.PROJECT_NAME IS 'Name of the Recreation Project.';
COMMENT ON COLUMN RECREATION_PROJECT.RECREATION_CONTROL_ACCESS_CODE IS 'Describes the Controlled Access Code for a project. E.g. “Gated”, “Restricted Use”.';
COMMENT ON COLUMN RECREATION_PROJECT.RECREATION_FEATURE_CODE IS 'Code describing the Recreation Feature.';
COMMENT ON COLUMN RECREATION_PROJECT.RECREATION_MAINTAIN_STD_CODE IS 'Code describing the Maintenance Standard of a given site. E.g. User Maintained, Maintained to Standard, Not Maintained.';
COMMENT ON COLUMN RECREATION_PROJECT.RECREATION_RISK_RATING_CODE IS 'Code describing the Recreation Risk Rating.';
COMMENT ON COLUMN RECREATION_PROJECT.UTM_ZONE IS 'The Universal Transverse Mercator location reference known as the Zone reference.';
COMMENT ON COLUMN RECREATION_PROJECT.LAST_REC_INSPECTION_DATE IS 'The last date of inspection for the project.';
COMMENT ON COLUMN RECREATION_PROJECT.REC_PROJECT_SKEY IS 'Concatenation of Forest File Id and project.';
COMMENT ON COLUMN RECREATION_PROJECT.RESOURCE_FEATURE_IND IS 'The resource feature for a recreation project.';
COMMENT ON COLUMN RECREATION_PROJECT.LAST_HZRD_TREE_ASSESS_DATE IS 'Identifies the date of the last hazard tree assessment for the recreation project.';
COMMENT ON COLUMN RECREATION_PROJECT.SITE_DESCRIPTION IS 'Field notes related to a recreation site. e.g. A managed, 11 unit site with 2WD access, gravel beach launch and a small float. Watch for hazards on the lake. This column is for internal use and is not a description for public use.';
COMMENT ON COLUMN RECREATION_PROJECT.RECREATION_USER_DAYS_CODE IS 'Code describing the Recreation User Days.';
COMMENT ON COLUMN RECREATION_PROJECT.OVERFLOW_CAMPSITES IS 'The number of overflow spaces that the project site can handle.';
COMMENT ON COLUMN RECREATION_PROJECT.UTM_NORTHING IS 'The Universal Transverse Mercator location reference. This is the Northing reference (metres north of the Equator).';
COMMENT ON COLUMN RECREATION_PROJECT.UTM_EASTING IS 'The Universal Transverse Mercator location reference for the project. This is the Easting reference (metres east of the Central Meridian of the zone).';
COMMENT ON COLUMN RECREATION_PROJECT.RIGHT_OF_WAY IS 'Identifies the Right of Way width for a linear feature. This attribute will likely be replaced by a spatial attribute in the future.';
COMMENT ON COLUMN RECREATION_PROJECT.ARCH_IMPACT_ASSESS_IND IS 'Indicates if an archaeological impact assessment has been performed for the given project.';
COMMENT ON COLUMN RECREATION_PROJECT.SITE_LOCATION IS 'A text description generally describing the closest community or, for more isolated sites and trails, it could be a geographic feature to a recreation site or trail. e.g. VERNON, KELOWNA, PRINCE GEORGE.';
COMMENT ON COLUMN RECREATION_PROJECT.PROJECT_ESTABLISHED_DATE IS 'Date on which the project was legally established.';
COMMENT ON COLUMN RECREATION_PROJECT.RECREATION_VIEW_IND IS 'Indicates whether a Recreation project must be shown in the Recreation View web mapping tool. Allowable values are “Y” and “N”.';
COMMENT ON COLUMN RECREATION_PROJECT.REVISION_COUNT IS 'A count of the number of times an entry in the entity has been modified. Used to validate if the current information displayed on a user''s web browser is the most current.';
COMMENT ON COLUMN RECREATION_PROJECT.ENTRY_USERID IS 'The userid responsible for inserting data into a table.';
COMMENT ON COLUMN RECREATION_PROJECT.ENTRY_TIMESTAMP IS 'Contains the system timestamp when data in a table was inserted.';
COMMENT ON COLUMN RECREATION_PROJECT.UPDATE_USERID IS 'The userid of the individual who last updated this road section record.';
COMMENT ON COLUMN RECREATION_PROJECT.UPDATE_TIMESTAMP IS 'The timestamp of the last update to the road section record.';
COMMENT ON COLUMN RECREATION_PROJECT.ARCH_IMPACT_DATE IS 'Identifies the archaeological impact assessment date.';
COMMENT ON COLUMN RECREATION_PROJECT.BORDEN_NO IS 'Identifies the borden numbers of the archaeological site.';
COMMENT ON COLUMN RECREATION_PROJECT.CAMP_HOST_IND IS 'Identifies whether or not there is a camp host or operator.';
COMMENT ON COLUMN RECREATION_PROJECT.LOW_MOBILITY_ACCESS_IND IS 'Identifies whether or not there is low mobility access to the site.';

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

COMMENT ON TABLE RECREATION_ACCESS IS 'Information relating to modes of access to a recreation project.';

COMMENT ON COLUMN RECREATION_ACCESS.FOREST_FILE_ID IS 'File identification assigned to Provincial Forest Use files. Assigned file number. Usually the Licence, Tenure or Private Mark number.';
COMMENT ON COLUMN RECREATION_ACCESS.RECREATION_ACCESS_CODE IS 'Code describing the Recreation Objective.';
COMMENT ON COLUMN RECREATION_ACCESS.RECREATION_SUB_ACCESS_CODE IS 'Code describing the Recreation Sub Access types.';
COMMENT ON COLUMN RECREATION_ACCESS.REVISION_COUNT IS 'A count of the number of times an entry in the entity has been modified. Used to validate if the current information displayed on a user''s web browser is the most current.';
COMMENT ON COLUMN RECREATION_ACCESS.ENTRY_USERID IS 'The userid responsible for inserting data into a table.';
COMMENT ON COLUMN RECREATION_ACCESS.ENTRY_TIMESTAMP IS 'Contains the system timestamp when data in a table was inserted.';
COMMENT ON COLUMN RECREATION_ACCESS.UPDATE_USERID IS 'The userid of the individual who last updated this road section record.';
COMMENT ON COLUMN RECREATION_ACCESS.UPDATE_TIMESTAMP IS 'The timestamp of the last update to the road section record.';

CREATE TABLE RECREATION_ACCESS_CODE (
    RECREATION_ACCESS_CODE VARCHAR(3) NOT NULL,
    DESCRIPTION VARCHAR(120),
    EFFECTIVE_DATE DATE,
    EXPIRY_DATE DATE,
    UPDATE_TIMESTAMP TIMESTAMP
);

-- There was no table description in the original RECREATION_ACCESS_CODE table

COMMENT ON COLUMN RECREATION_ACCESS_CODE.RECREATION_ACCESS_CODE IS 'Code describing the Recreation Objective.';
COMMENT ON COLUMN RECREATION_ACCESS_CODE.DESCRIPTION IS 'Description of the code value.';
COMMENT ON COLUMN RECREATION_ACCESS_CODE.EFFECTIVE_DATE IS 'Date the code becomes effective.';
COMMENT ON COLUMN RECREATION_ACCESS_CODE.EXPIRY_DATE IS 'Date the code expires.';
COMMENT ON COLUMN RECREATION_ACCESS_CODE.UPDATE_TIMESTAMP IS 'The date and time the value was last modified.';

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

COMMENT ON TABLE RECREATION_ACCESS_XREF IS 'Describes valid combinations between Recreation Access and Recreation Sub Access types. E.g. Boat in - Motor Boat, Boat in - Canoe, Trail-MultiUse, Trail-Snowmobile.';

COMMENT ON COLUMN RECREATION_ACCESS_XREF.RECREATION_ACCESS_CODE IS 'Code describing the Recreation Objective.';
COMMENT ON COLUMN RECREATION_ACCESS_XREF.RECREATION_SUB_ACCESS_CODE IS 'Code describing the Recreation Sub Access types.';
COMMENT ON COLUMN RECREATION_ACCESS_XREF.REVISION_COUNT IS 'A count of the number of times an entry in the entity has been modified. Used to validate if the current information displayed on a user''s web browser is the most current.';
COMMENT ON COLUMN RECREATION_ACCESS_XREF.ENTRY_USERID IS 'The userid responsible for inserting data into a table.';
COMMENT ON COLUMN RECREATION_ACCESS_XREF.ENTRY_TIMESTAMP IS 'Contains the system timestamp when data in a table was inserted.';
COMMENT ON COLUMN RECREATION_ACCESS_XREF.UPDATE_USERID IS 'The userid of the individual who last updated this road section record.';
COMMENT ON COLUMN RECREATION_ACCESS_XREF.UPDATE_TIMESTAMP IS 'The timestamp of the last update to the road section record.';

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

COMMENT ON TABLE RECREATION_ACTIVITY IS 'The types of available activities for a given project.';

COMMENT ON COLUMN RECREATION_ACTIVITY.FOREST_FILE_ID IS 'File identification assigned to Provincial Forest Use files. Assigned file number. Usually the Licence, Tenure or Private Mark number.';
COMMENT ON COLUMN RECREATION_ACTIVITY.RECREATION_ACTIVITY_CODE IS 'Code describing the Recreation Activity.';
COMMENT ON COLUMN RECREATION_ACTIVITY.ACTIVITY_RANK IS 'The order of importance of this activity for the given project as a number from 1 to 3.';
COMMENT ON COLUMN RECREATION_ACTIVITY.REVISION_COUNT IS 'A count of the number of times an entry in the entity has been modified. Used to validate if the current information displayed on a user''s web browser is the most current.';
COMMENT ON COLUMN RECREATION_ACTIVITY.ENTRY_USERID IS 'The userid responsible for inserting data into a table.';
COMMENT ON COLUMN RECREATION_ACTIVITY.ENTRY_TIMESTAMP IS 'Contains the system timestamp when data in a table was inserted.';
COMMENT ON COLUMN RECREATION_ACTIVITY.UPDATE_USERID IS 'The userid of the individual who last updated this road section record.';
COMMENT ON COLUMN RECREATION_ACTIVITY.UPDATE_TIMESTAMP IS 'The timestamp of the last update to the road section record.';

CREATE TABLE RECREATION_ACTIVITY_CODE (
    RECREATION_ACTIVITY_CODE VARCHAR(3) PRIMARY KEY,
    DESCRIPTION VARCHAR(120),
    EFFECTIVE_DATE DATE,
    EXPIRY_DATE DATE,
    UPDATE_TIMESTAMP TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE RECREATION_ACTIVITY_CODE IS 'Activity code types for recreation projects.';

COMMENT ON COLUMN RECREATION_ACTIVITY_CODE.RECREATION_ACTIVITY_CODE IS 'Code describing the Recreation Activity.';
COMMENT ON COLUMN RECREATION_ACTIVITY_CODE.DESCRIPTION IS 'Description of the code value.';
COMMENT ON COLUMN RECREATION_ACTIVITY_CODE.EFFECTIVE_DATE IS 'Date the code becomes effective.';
COMMENT ON COLUMN RECREATION_ACTIVITY_CODE.EXPIRY_DATE IS 'Date the code expires.';
COMMENT ON COLUMN RECREATION_ACTIVITY_CODE.UPDATE_TIMESTAMP IS 'The date and time the value was last modified.';

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

COMMENT ON TABLE RECREATION_AGREEMENT_HOLDER IS 'Identifies the Agreement Holder responsible for maintaining a project for a given time frame.';

COMMENT ON COLUMN RECREATION_AGREEMENT_HOLDER.AGREEMENT_HOLDER_ID IS 'The unique identifier for a recreation agreement holder.';
COMMENT ON COLUMN RECREATION_AGREEMENT_HOLDER.FOREST_FILE_ID IS 'File identification assigned to Provincial Forest Use files. Assigned file number. Usually the Licence, Tenure or Private Mark number.';
COMMENT ON COLUMN RECREATION_AGREEMENT_HOLDER.CLIENT_NUMBER IS 'Sequentially assigned number to identify a ministry client.';
COMMENT ON COLUMN RECREATION_AGREEMENT_HOLDER.CLIENT_LOCN_CODE IS 'Retrofitted from column CLIENT_LOCN_CODE of table FOR_CLIENT_LINK.';
COMMENT ON COLUMN RECREATION_AGREEMENT_HOLDER.AGREEMENT_START_DATE IS 'Start date of the agreement held between the ministry and the agreement holder.';
COMMENT ON COLUMN RECREATION_AGREEMENT_HOLDER.AGREEMENT_END_DATE IS 'End date of the agreement held between the ministry and the agreement holder.';
COMMENT ON COLUMN RECREATION_AGREEMENT_HOLDER.REVISION_COUNT IS 'A count of the number of times an entry in the entity has been modified. Used to validate if the current information displayed on a user''s web browser is the most current.';
COMMENT ON COLUMN RECREATION_AGREEMENT_HOLDER.ENTRY_USERID IS 'The userid responsible for inserting data into a table.';
COMMENT ON COLUMN RECREATION_AGREEMENT_HOLDER.ENTRY_TIMESTAMP IS 'Contains the system timestamp when data in a table was inserted.';
COMMENT ON COLUMN RECREATION_AGREEMENT_HOLDER.UPDATE_USERID IS 'The userid of the individual who last updated this road section record.';
COMMENT ON COLUMN RECREATION_AGREEMENT_HOLDER.UPDATE_TIMESTAMP IS 'The timestamp of the last update to the road section record.';

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

COMMENT ON TABLE RECREATION_ATTACHMENT IS 'Stores a reference to each attachment related to the Recreation project such as the Establishment Order document.';

COMMENT ON COLUMN RECREATION_ATTACHMENT.FOREST_FILE_ID IS 'File identification assigned to Provincial Forest Use files. Assigned file number. Usually the Licence, Tenure or Private Mark number.';
COMMENT ON COLUMN RECREATION_ATTACHMENT.RECREATION_ATTACHMENT_ID IS 'System-generated ID for the attachment.';
COMMENT ON COLUMN RECREATION_ATTACHMENT.ATTACHMENT_FILE_NAME IS 'File name, not including the path, of the attached file at the time it was uploaded.';
COMMENT ON COLUMN RECREATION_ATTACHMENT.REVISION_COUNT IS 'A count of the number of times an entry in the entity has been modified. Used to validate if the current information displayed on a user''s web browser is the most current.';
COMMENT ON COLUMN RECREATION_ATTACHMENT.ENTRY_USERID IS 'The userid of the user that inserted data into the record.';
COMMENT ON COLUMN RECREATION_ATTACHMENT.ENTRY_TIMESTAMP IS 'Timestamp indicating when data was last inserted into the record.';
COMMENT ON COLUMN RECREATION_ATTACHMENT.UPDATE_USERID IS 'The userid of the user that last updated the declared area record.';
COMMENT ON COLUMN RECREATION_ATTACHMENT.UPDATE_TIMESTAMP IS 'The timestamp of the last update to the declared area record.';

CREATE TABLE RECREATION_ATTACHMENT_CONTENT (
    FOREST_FILE_ID VARCHAR(10) REFERENCES RECREATION_ATTACHMENT(FOREST_FILE_ID) ON DELETE RESTRICT,
    RECREATION_ATTACHMENT_ID INT,
    ATTACHMENT_CONTENT BYTEA,
    PRIMARY KEY (FOREST_FILE_ID, RECREATION_ATTACHMENT_ID),
    CONSTRAINT FK_RECREATION_ATTACHMENT_FOREST_FILE_ID FOREIGN KEY (FOREST_FILE_ID) REFERENCES RECREATION_PROJECT (FOREST_FILE_ID) ON DELETE RESTRICT
);

COMMENT ON TABLE RECREATION_ATTACHMENT_CONTENT IS 'Stores attachment content for each attachment related to the Recreation project.';

COMMENT ON COLUMN RECREATION_ATTACHMENT_CONTENT.FOREST_FILE_ID IS 'File identification assigned to Provincial Forest Use files. Assigned file number. Usually the Licence, Tenure or Private Mark number.';
COMMENT ON COLUMN RECREATION_ATTACHMENT_CONTENT.RECREATION_ATTACHMENT_ID IS 'System-generated ID for the attachment.';
COMMENT ON COLUMN RECREATION_ATTACHMENT_CONTENT.ATTACHMENT_CONTENT IS 'Content for the attachment.';

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
    UPDATE_TIMESTAMP TIMESTAMP,
    CONSTRAINT CHK_CLOSURE_IND CHECK (CLOSURE_IND IN ('Y', 'N'))
);

COMMENT ON TABLE RECREATION_COMMENT IS 'Stores comments related to the Recreation project such as driving directions and closures.';

COMMENT ON COLUMN RECREATION_COMMENT.FOREST_FILE_ID IS 'File identification assigned to Provincial Forest Use files. Assigned file number. Usually the Licence, Tenure or Private Mark number.';
COMMENT ON COLUMN RECREATION_COMMENT.RECREATION_COMMENT_ID IS 'A system-generated unique identifier for the comment.';
COMMENT ON COLUMN RECREATION_COMMENT.REC_COMMENT_TYPE_CODE IS 'A code which specifies the type of comment. Eg. Driving Directions, Closures.';
COMMENT ON COLUMN RECREATION_COMMENT.CLOSURE_IND IS 'Indicates whether there is a closure within the Recreation project site. Allowable values are “Y” and “N”.';
COMMENT ON COLUMN RECREATION_COMMENT.PROJECT_COMMENT IS 'The comment content.';
COMMENT ON COLUMN RECREATION_COMMENT.COMMENT_DATE IS 'The user-entered date on which the comment was entered.';
COMMENT ON COLUMN RECREATION_COMMENT.REVISION_COUNT IS 'A count of the number of times an entry in the entity has been modified. Used to validate if the current information displayed on a user''s web browser is the most current.';
COMMENT ON COLUMN RECREATION_COMMENT.ENTRY_USERID IS 'The userid of the user that inserted data into the record.';
COMMENT ON COLUMN RECREATION_COMMENT.ENTRY_TIMESTAMP IS 'Timestamp indicating when data was last inserted into the record.';
COMMENT ON COLUMN RECREATION_COMMENT.UPDATE_USERID IS 'The userid of the user that last updated the declared area record.';
COMMENT ON COLUMN RECREATION_COMMENT.UPDATE_TIMESTAMP IS 'The timestamp of the last update to the declared area record.';

CREATE TABLE RECREATION_CONTROL_ACCESS_CODE (
    RECREATION_CONTROL_ACCESS_CODE VARCHAR(1) PRIMARY KEY,
    DESCRIPTION VARCHAR(120),
    EFFECTIVE_DATE DATE,
    EXPIRY_DATE DATE,
    UPDATE_TIMESTAMP TIMESTAMP
);

COMMENT ON TABLE RECREATION_CONTROL_ACCESS_CODE IS 'Control access codes for recreation projects.';

COMMENT ON COLUMN RECREATION_CONTROL_ACCESS_CODE.RECREATION_CONTROL_ACCESS_CODE IS 'Describes the Controlled Access Code for a project. E.g. “Gated”, “Restricted Use”.';
COMMENT ON COLUMN RECREATION_CONTROL_ACCESS_CODE.DESCRIPTION IS 'Description of the code value.';
COMMENT ON COLUMN RECREATION_CONTROL_ACCESS_CODE.EFFECTIVE_DATE IS 'Date the code becomes effective.';
COMMENT ON COLUMN RECREATION_CONTROL_ACCESS_CODE.EXPIRY_DATE IS 'Date the code expires.';
COMMENT ON COLUMN RECREATION_CONTROL_ACCESS_CODE.UPDATE_TIMESTAMP IS 'The date and time the value was last modified.';

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

COMMENT ON TABLE RECREATION_DEF_CS_RPR_HISTORY IS 'Recreation Defined Campsite repair history audit log. Note that defined campsites can be deleted, while retaining the repair history.';

COMMENT ON COLUMN RECREATION_DEF_CS_RPR_HISTORY.FOREST_FILE_ID IS 'File identification assigned to Recreation Project.';
COMMENT ON COLUMN RECREATION_DEF_CS_RPR_HISTORY.CAMPSITE_NUMBER IS 'The number assigned to a defined campsite by Recreation staff.';
COMMENT ON COLUMN RECREATION_DEF_CS_RPR_HISTORY.RECREATION_REMED_REPAIR_CODE IS 'Indicates the type of remedial repair applicable to the defined campsite.';
COMMENT ON COLUMN RECREATION_DEF_CS_RPR_HISTORY.ESTIMATED_REPAIR_COST IS 'Identifies the estimated remedial repair cost for a campsite.';
COMMENT ON COLUMN RECREATION_DEF_CS_RPR_HISTORY.REPAIR_COMPLETE_DATE IS 'Identifies the completion date for the campsite repair.';
COMMENT ON COLUMN RECREATION_DEF_CS_RPR_HISTORY.REVISION_COUNT IS 'A count of the number of times an entry in the entity has been modified. Used to validate if the current information displayed on a user''s web browser is the most current.';
COMMENT ON COLUMN RECREATION_DEF_CS_RPR_HISTORY.ENTRY_USERID IS 'The userid responsible for inserting data into a table.';
COMMENT ON COLUMN RECREATION_DEF_CS_RPR_HISTORY.ENTRY_TIMESTAMP IS 'Contains the system timestamp when data in a table was inserted.';
COMMENT ON COLUMN RECREATION_DEF_CS_RPR_HISTORY.UPDATE_USERID IS 'The userid of the individual who last updated this road section record.';
COMMENT ON COLUMN RECREATION_DEF_CS_RPR_HISTORY.UPDATE_TIMESTAMP IS 'The timestamp of the last update to the road section record.';

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

COMMENT ON TABLE RECREATION_DEFINED_CAMPSITE IS 'A defined campsite is a camping area within a project designated by the Recreation officer. This may contain recreation structures.';

COMMENT ON COLUMN RECREATION_DEFINED_CAMPSITE.FOREST_FILE_ID IS 'File identification assigned to Provincial Forest Use files. Assigned file number. Usually the Licence, Tenure or Private Mark number.';
COMMENT ON COLUMN RECREATION_DEFINED_CAMPSITE.CAMPSITE_NUMBER IS 'The number assigned to a defined campsite by Recreation staff.';
COMMENT ON COLUMN RECREATION_DEFINED_CAMPSITE.ESTIMATED_REPAIR_COST IS 'Identifies the estimated remedial repair cost for a campsite.';
COMMENT ON COLUMN RECREATION_DEFINED_CAMPSITE.RECREATION_REMED_REPAIR_CODE IS 'Indicates the type of remedial repair applicable to the defined campsite.';
COMMENT ON COLUMN RECREATION_DEFINED_CAMPSITE.REPAIR_COMPLETE_DATE IS 'Identifies the completion date for the campsite repair.';
COMMENT ON COLUMN RECREATION_DEFINED_CAMPSITE.REVISION_COUNT IS 'A count of the number of times an entry in the entity has been modified. Used to validate if the current information displayed on a user''s web browser is the most current.';
COMMENT ON COLUMN RECREATION_DEFINED_CAMPSITE.ENTRY_USERID IS 'The userid responsible for inserting data into a table.';
COMMENT ON COLUMN RECREATION_DEFINED_CAMPSITE.ENTRY_TIMESTAMP IS 'Contains the system timestamp when data in a table was inserted.';
COMMENT ON COLUMN RECREATION_DEFINED_CAMPSITE.UPDATE_USERID IS 'The userid of the individual who last updated this road section record.';
COMMENT ON COLUMN RECREATION_DEFINED_CAMPSITE.UPDATE_TIMESTAMP IS 'The timestamp of the last update to the road section record.';

CREATE TABLE RECREATION_DISTRICT_CODE (
    RECREATION_DISTRICT_CODE VARCHAR(4) PRIMARY KEY,
    DESCRIPTION VARCHAR(120),
    EFFECTIVE_DATE DATE,
    EXPIRY_DATE DATE,
    UPDATE_TIMESTAMP TIMESTAMP
);

COMMENT ON TABLE RECREATION_DISTRICT_CODE IS 'Recreation district codes for classification of areas within a project.';

COMMENT ON COLUMN RECREATION_DISTRICT_CODE.RECREATION_DISTRICT_CODE IS 'A code indicating a recreation district boundary. EG Cascades, Chilliwack, Discovery Coast. Note: There are 17 Recreation District Boundaries, most of which have different geographical boundaries than Forest District Boundaries. Because of this, Rec District Boundary Codes are different from Forest District Boundary Codes.';
COMMENT ON COLUMN RECREATION_DISTRICT_CODE.DESCRIPTION IS 'Description of the recreation district boundary type.';
COMMENT ON COLUMN RECREATION_DISTRICT_CODE.EFFECTIVE_DATE IS 'Date the code becomes effective.';
COMMENT ON COLUMN RECREATION_DISTRICT_CODE.EXPIRY_DATE IS 'Date the code expires.';
COMMENT ON COLUMN RECREATION_DISTRICT_CODE.UPDATE_TIMESTAMP IS 'The date and time the value was last modified.';

CREATE TABLE RECREATION_DISTRICT_XREF (
    FOREST_FILE_ID VARCHAR(10) NOT NULL,
    RECREATION_DISTRICT_CODE VARCHAR(4) NOT NULL,
    REVISION_COUNT INT,
    ENTRY_USERID VARCHAR(30),
    ENTRY_TIMESTAMP TIMESTAMP,
    UPDATE_USERID VARCHAR(30),
    UPDATE_TIMESTAMP TIMESTAMP
);

-- There was no table description in the original RECREATION_DISTRICT_XREF table

COMMENT ON COLUMN RECREATION_DISTRICT_XREF.FOREST_FILE_ID IS 'File identification assigned to Provincial Forest Use files. Assigned file number. Usually the Licence, Tenure or Private Mark number.';
COMMENT ON COLUMN RECREATION_DISTRICT_XREF.RECREATION_DISTRICT_CODE IS 'A code indicating a recreation district boundary. EG Cascades, Chilliwack, Discovery Coast. Note: There are 17 Recreation District Boundaries, most of which have different geographical boundaries than Forest District Boundaries. Because of this, Rec District Boundary Codes are different from Forest District Boundary Codes.';
COMMENT ON COLUMN RECREATION_DISTRICT_XREF.REVISION_COUNT IS 'A count of the number of times an entry in the entity has been modified. Used to validate if the current information displayed on a user"s web browser is the most current.';
COMMENT ON COLUMN RECREATION_DISTRICT_XREF.ENTRY_USERID IS 'The unique user id of the resource who initially added the entry.';
COMMENT ON COLUMN RECREATION_DISTRICT_XREF.ENTRY_TIMESTAMP IS 'Timestamp when the event information was entered.';
COMMENT ON COLUMN RECREATION_DISTRICT_XREF.UPDATE_USERID IS 'The userid of the individual who last updated this information.';
COMMENT ON COLUMN RECREATION_DISTRICT_XREF.UPDATE_TIMESTAMP IS 'The date and time of the last update.';

CREATE TABLE RECREATION_FEATURE_CODE (
    RECREATION_FEATURE_CODE VARCHAR(3) PRIMARY KEY,
    DESCRIPTION VARCHAR(120),
    EFFECTIVE_DATE DATE,
    EXPIRY_DATE DATE,
    UPDATE_TIMESTAMP TIMESTAMP
);

COMMENT ON TABLE RECREATION_FEATURE_CODE IS 'Codes describing the recreation features within a project.';

COMMENT ON COLUMN RECREATION_FEATURE_CODE.RECREATION_FEATURE_CODE IS 'Code describing the Recreation Feature.';
COMMENT ON COLUMN RECREATION_FEATURE_CODE.DESCRIPTION IS 'Description of the code value.';
COMMENT ON COLUMN RECREATION_FEATURE_CODE.EFFECTIVE_DATE IS 'Date the code becomes effective.';
COMMENT ON COLUMN RECREATION_FEATURE_CODE.EXPIRY_DATE IS 'Date the code expires.';
COMMENT ON COLUMN RECREATION_FEATURE_CODE.UPDATE_TIMESTAMP IS 'The date and time the value was last modified.';

CREATE TABLE RECREATION_FEE_CODE (
    RECREATION_FEE_CODE VARCHAR(3) PRIMARY KEY,
    DESCRIPTION VARCHAR(120),
    EFFECTIVE_DATE DATE,
    EXPIRY_DATE DATE,
    UPDATE_TIMESTAMP TIMESTAMP
);

COMMENT ON TABLE RECREATION_FEE_CODE IS 'Fee code types for recreation projects.';

COMMENT ON COLUMN RECREATION_FEE_CODE.RECREATION_FEE_CODE IS 'Code describing the Recreation Fee.';
COMMENT ON COLUMN RECREATION_FEE_CODE.DESCRIPTION IS 'Description of the code value.';
COMMENT ON COLUMN RECREATION_FEE_CODE.EFFECTIVE_DATE IS 'Date the code becomes effective.';
COMMENT ON COLUMN RECREATION_FEE_CODE.EXPIRY_DATE IS 'Date the code expires.';
COMMENT ON COLUMN RECREATION_FEE_CODE.UPDATE_TIMESTAMP IS 'The date and time the value was last modified.';

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
    UPDATE_TIMESTAMP TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT CHK_MONDAY_IND CHECK (MONDAY_IND IN ('Y', 'N')),
    CONSTRAINT CHK_TUESDAY_IND CHECK (TUESDAY_IND IN ('Y', 'N')),
    CONSTRAINT CHK_WEDNESDAY_IND CHECK (WEDNESDAY_IND IN ('Y', 'N')),
    CONSTRAINT CHK_THURSDAY_IND CHECK (THURSDAY_IND IN ('Y', 'N')),
    CONSTRAINT CHK_FRIDAY_IND CHECK (FRIDAY_IND IN ('Y', 'N')),
    CONSTRAINT CHK_SATURDAY_IND CHECK (SATURDAY_IND IN ('Y', 'N')),
    CONSTRAINT CHK_SUNDAY_IND CHECK (SUNDAY_IND IN ('Y', 'N'))
);

COMMENT ON TABLE RECREATION_FEE IS 'The types of fees for a given project (e.g., Overnight, firewood, etc.).';

COMMENT ON COLUMN RECREATION_FEE.FEE_ID IS 'The unique identifier for a Recreation fee.';
COMMENT ON COLUMN RECREATION_FEE.FOREST_FILE_ID IS 'File identification assigned to Provincial Forest Use files. Assigned file number. Usually the Licence, Tenure or Private Mark number.';
COMMENT ON COLUMN RECREATION_FEE.FEE_AMOUNT IS 'The fee amount for a given recreation fee type.';
COMMENT ON COLUMN RECREATION_FEE.FEE_START_DATE IS 'Identifies the start date for the given fee type.';
COMMENT ON COLUMN RECREATION_FEE.FEE_END_DATE IS 'Identifies the end date for the given fee type.';
COMMENT ON COLUMN RECREATION_FEE.MONDAY_IND IS 'Identifies if fees are applicable for the day of Monday in the given date range.';
COMMENT ON COLUMN RECREATION_FEE.TUESDAY_IND IS 'Identifies if fees are applicable for the day of Tuesday in the given date range.';
COMMENT ON COLUMN RECREATION_FEE.WEDNESDAY_IND IS 'Identifies if fees are applicable for the day of Wednesday in the given date range.';
COMMENT ON COLUMN RECREATION_FEE.THURSDAY_IND IS 'Identifies if fees are applicable for the day of Thursday in the given date range.';
COMMENT ON COLUMN RECREATION_FEE.FRIDAY_IND IS 'Identifies if fees are applicable for the day of Friday in the given date range.';
COMMENT ON COLUMN RECREATION_FEE.SATURDAY_IND IS 'Identifies if fees are applicable for the day of Saturday in the given date range.';
COMMENT ON COLUMN RECREATION_FEE.SUNDAY_IND IS 'Identifies if fees are applicable for the day of Sunday in the given date range.';
COMMENT ON COLUMN RECREATION_FEE.RECREATION_FEE_CODE IS 'Code describing the Recreation Fee.';
COMMENT ON COLUMN RECREATION_FEE.REVISION_COUNT IS 'A count of the number of times an entry in the entity has been modified. Used to validate if the current information displayed on a user"s web browser is the most current.';
COMMENT ON COLUMN RECREATION_FEE.ENTRY_USERID IS 'The userid responsible for inserting data into a table.';
COMMENT ON COLUMN RECREATION_FEE.ENTRY_TIMESTAMP IS 'Contains the system timestamp when data in a table was inserted.';
COMMENT ON COLUMN RECREATION_FEE.UPDATE_USERID IS 'The userid of the individual who last updated this road section record.';
COMMENT ON COLUMN RECREATION_FEE.UPDATE_TIMESTAMP IS 'The timestamp of the last update to the road section record.';

CREATE TABLE RECREATION_FILE_STATUS_CODE (
    RECREATION_FILE_STATUS_CODE VARCHAR(3) PRIMARY KEY,
    DESCRIPTION VARCHAR(120),
    EFFECTIVE_DATE DATE,
    EXPIRY_DATE DATE,
    UPDATE_TIMESTAMP TIMESTAMP
);

COMMENT ON TABLE RECREATION_FILE_STATUS_CODE IS 'Codes describing the status of a recreation file.';

COMMENT ON COLUMN RECREATION_FILE_STATUS_CODE.RECREATION_FILE_STATUS_CODE IS 'Code describing the Status of a Recreation File';
COMMENT ON COLUMN RECREATION_FILE_STATUS_CODE.DESCRIPTION IS 'Description of the code value';
COMMENT ON COLUMN RECREATION_FILE_STATUS_CODE.EFFECTIVE_DATE IS 'Date the code becomes effective';
COMMENT ON COLUMN RECREATION_FILE_STATUS_CODE.EXPIRY_DATE IS 'Date the code expires';
COMMENT ON COLUMN RECREATION_FILE_STATUS_CODE.UPDATE_TIMESTAMP IS 'The date and time the value was last modified';

CREATE TABLE RECREATION_FILE_TYPE_CODE (
    RECREATION_FILE_TYPE_CODE VARCHAR(3) PRIMARY KEY,
    DESCRIPTION VARCHAR(120),
    EFFECTIVE_DATE DATE,
    EXPIRY_DATE DATE,
    UPDATE_TIMESTAMP DATE
);

COMMENT ON TABLE RECREATION_FILE_TYPE_CODE IS 'Describes the RECREATION FILE TYPE CODE for categorizing recreation files.';

-- There were no descriptions for the columns in the original RECREATION_FILE_TYPE_CODE table

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

COMMENT ON TABLE RECREATION_INSPECTION_REPORT IS 'Contains the reports for inspections related to recreation projects.';

-- There were no descriptions for the columns in the original RECREATION_INSPECTION_REPORT table

CREATE TABLE RECREATION_MAINTAIN_STD_CODE (
    RECREATION_MAINTAIN_STD_CODE VARCHAR(1) PRIMARY KEY,
    DESCRIPTION VARCHAR(120),
    EFFECTIVE_DATE DATE,
    EXPIRY_DATE DATE,
    UPDATE_TIMESTAMP TIMESTAMP
);

COMMENT ON TABLE RECREATION_MAINTAIN_STD_CODE IS 'Codes describing the maintenance standards for recreation projects.';

COMMENT ON COLUMN RECREATION_MAINTAIN_STD_CODE.RECREATION_MAINTAIN_STD_CODE IS 'Code describing the Maintenance Standard of a given site. E.g. User Maintained, Maintained to Standard, Not Maintained.';
COMMENT ON COLUMN RECREATION_MAINTAIN_STD_CODE.DESCRIPTION IS 'Description of the code value';
COMMENT ON COLUMN RECREATION_MAINTAIN_STD_CODE.EFFECTIVE_DATE IS 'Date the code becomes effective';
COMMENT ON COLUMN RECREATION_MAINTAIN_STD_CODE.EXPIRY_DATE IS 'Date the code expires';
COMMENT ON COLUMN RECREATION_MAINTAIN_STD_CODE.UPDATE_TIMESTAMP IS 'The date and time the value was last modified';

CREATE TABLE RECREATION_MAP_FEATURE_CODE (
    RECREATION_MAP_FEATURE_CODE VARCHAR(3) PRIMARY KEY,
    DESCRIPTION VARCHAR(120),
    EFFECTIVE_DATE DATE,
    EXPIRY_DATE DATE,
    UPDATE_TIMESTAMP TIMESTAMP
);

COMMENT ON TABLE RECREATION_MAP_FEATURE_CODE IS 'Codes describing types of map features within a recreation project.';

COMMENT ON COLUMN RECREATION_MAP_FEATURE_CODE.RECREATION_MAP_FEATURE_CODE IS 'Identifies the RECREATION MAP FEATURE TYPE CODE.';
COMMENT ON COLUMN RECREATION_MAP_FEATURE_CODE.DESCRIPTION IS 'Description of the code value.';
COMMENT ON COLUMN RECREATION_MAP_FEATURE_CODE.EFFECTIVE_DATE IS 'Date the code becomes effective.';
COMMENT ON COLUMN RECREATION_MAP_FEATURE_CODE.EXPIRY_DATE IS 'Date the code expires.';
COMMENT ON COLUMN RECREATION_MAP_FEATURE_CODE.UPDATE_TIMESTAMP IS 'The date and time the value was last modified.';

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

COMMENT ON TABLE RECREATION_MAP_FEATURE_GEOM IS 'Captures amendments to spatial geometry for recreation applications received via the electronic submission process.';

COMMENT ON COLUMN RECREATION_MAP_FEATURE_GEOM.RMF_SKEY IS 'The SKEY for the RECREATION MAP FEATURE.';
COMMENT ON COLUMN RECREATION_MAP_FEATURE_GEOM.MAP_FEATURE_ID IS 'A unique identifier to a version of a map object. This is very similar to the feature ID in INCOSADA except it was universally unique. If a new version of a cut block came in it would be assigned a new identifier.';
COMMENT ON COLUMN RECREATION_MAP_FEATURE_GEOM.GEOMETRY_TYPE_CODE IS 'Identifies linear or polygonal geometry types for a tenure application feature.';
COMMENT ON COLUMN RECREATION_MAP_FEATURE_GEOM.GEOMETRY IS 'The geometry for this feature.';
COMMENT ON COLUMN RECREATION_MAP_FEATURE_GEOM.FEATURE_AREA IS 'Spatial feature area in hectares. This value is calculated.';
COMMENT ON COLUMN RECREATION_MAP_FEATURE_GEOM.FEATURE_LENGTH IS 'Spatial feature length in kilometres. This value is calculated.';
COMMENT ON COLUMN RECREATION_MAP_FEATURE_GEOM.FEATURE_PERIMETER IS 'Spatial feature perimeter in kilometres. This value is calculated.';
COMMENT ON COLUMN RECREATION_MAP_FEATURE_GEOM.REVISION_COUNT IS 'A count of the number of times an entry in the entity has been modified. Used to validate if the current information displayed on a user''s web browser is the most current.';
COMMENT ON COLUMN RECREATION_MAP_FEATURE_GEOM.ENTRY_USERID IS 'The userid responsible for inserting data into a table.';
COMMENT ON COLUMN RECREATION_MAP_FEATURE_GEOM.ENTRY_TIMESTAMP IS 'Contains the system timestamp when data in a table was inserted.';
COMMENT ON COLUMN RECREATION_MAP_FEATURE_GEOM.UPDATE_USERID IS 'The userid of the individual who last updated this road section record.';
COMMENT ON COLUMN RECREATION_MAP_FEATURE_GEOM.UPDATE_TIMESTAMP IS 'The timestamp of the last update to the road section record.';

CREATE TABLE RECREATION_MAP_FEATURE_XGUID (
    RMF_GUID BYTEA PRIMARY KEY,
    RMF_SKEY INT
);

COMMENT ON TABLE RECREATION_MAP_FEATURE_XGUID IS 'Global unique identifier for map features related to recreation projects.';

-- There were no descriptions for the columns in the original RECREATION_MAP_FEATURE_XGUID table

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

COMMENT ON TABLE RECREATION_MAP_FEATURE IS 'Captures both current and historical attributes for Recreation Map Features.';

COMMENT ON COLUMN RECREATION_MAP_FEATURE.RMF_SKEY IS 'The SKEY for the RECREATION MAP FEATURE.';
COMMENT ON COLUMN RECREATION_MAP_FEATURE.FOREST_FILE_ID IS 'File identification assigned to Provincial Forest Use files. Assigned file number. Usually the Licence, Tenure or Private Mark number.';
COMMENT ON COLUMN RECREATION_MAP_FEATURE.SECTION_ID IS 'The section id for the RECREATION MAP FEATURE.';
COMMENT ON COLUMN RECREATION_MAP_FEATURE.AMENDMENT_ID IS 'The amendment id for the RECREATION MAP FEATURE.';
COMMENT ON COLUMN RECREATION_MAP_FEATURE.AMEND_STATUS_CODE IS 'Code to indicate status of amendment, that is, pending, approved or disallowed. This references Timber_Status_Code.';
COMMENT ON COLUMN RECREATION_MAP_FEATURE.RECREATION_MAP_FEATURE_CODE IS 'Identifies the RECREATION MAP FEATURE TYPE CODE.';
COMMENT ON COLUMN RECREATION_MAP_FEATURE.CURRENT_IND IS 'Indicates the current version of the record for this entity.';
COMMENT ON COLUMN RECREATION_MAP_FEATURE.AMEND_STATUS_DATE IS 'The date the amendment status was changed.';
COMMENT ON COLUMN RECREATION_MAP_FEATURE.RETIREMENT_DATE IS 'The date the entry is retired.';
COMMENT ON COLUMN RECREATION_MAP_FEATURE.REVISION_COUNT IS 'A count of the number of times an entry in the entity has been modified. Used to validate if the current information displayed on a user''s web browser is the most current.';
COMMENT ON COLUMN RECREATION_MAP_FEATURE.ENTRY_USERID IS 'The userid responsible for inserting data into a table.';
COMMENT ON COLUMN RECREATION_MAP_FEATURE.ENTRY_TIMESTAMP IS 'Contains the system timestamp when data in a table was inserted.';
COMMENT ON COLUMN RECREATION_MAP_FEATURE.UPDATE_USERID IS 'The userid of the individual who last updated this road section record.';
COMMENT ON COLUMN RECREATION_MAP_FEATURE.UPDATE_TIMESTAMP IS 'The timestamp of the last update to the road section record.';
COMMENT ON COLUMN RECREATION_MAP_FEATURE.RECREATION_MAP_FEATURE_GUID IS 'Global Unique Identifier generated by the system for new records. It was added for FTA 5.';

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

COMMENT ON TABLE RECREATION_OBJECTIVE IS 'The objectives pertaining to a recreation project.';

COMMENT ON COLUMN RECREATION_OBJECTIVE.OBJECTIVE_ID IS 'The unique identifier for a recreation objective.';
COMMENT ON COLUMN RECREATION_OBJECTIVE.FOREST_FILE_ID IS 'File identification assigned to Provincial Forest Use files. Assigned file number. Usually the Licence, Tenure or Private Mark number.';
COMMENT ON COLUMN RECREATION_OBJECTIVE.OBJECTIVE_DESCRIPTION IS 'The description of the objective.';
COMMENT ON COLUMN RECREATION_OBJECTIVE.OBJECTIVE_ESTABLISHED_DATE IS 'The date an objective was established.';
COMMENT ON COLUMN RECREATION_OBJECTIVE.OBJECTIVE_AMENDED_DATE IS 'The date an objective was amended.';
COMMENT ON COLUMN RECREATION_OBJECTIVE.OBJECTIVE_CANCELLED_DATE IS 'The date an objective was cancelled.';
COMMENT ON COLUMN RECREATION_OBJECTIVE.REVISION_COUNT IS 'A count of the number of times an entry in the entity has been modified. Used to validate if the current information displayed on a user''s web browser is the most current.';
COMMENT ON COLUMN RECREATION_OBJECTIVE.ENTRY_USERID IS 'The userid responsible for inserting data into a table.';
COMMENT ON COLUMN RECREATION_OBJECTIVE.ENTRY_TIMESTAMP IS 'Contains the system timestamp when data in a table was inserted.';
COMMENT ON COLUMN RECREATION_OBJECTIVE.UPDATE_USERID IS 'The userid of the individual who last updated this road section record.';
COMMENT ON COLUMN RECREATION_OBJECTIVE.UPDATE_TIMESTAMP IS 'The timestamp of the last update to the road section record.';

CREATE TABLE RECREATION_OCCUPANCY_CODE (
    RECREATION_OCCUPANCY_CODE VARCHAR(10) PRIMARY KEY,
    DESCRIPTION VARCHAR(120),
    EFFECTIVE_DATE DATE,
    EXPIRY_DATE DATE,
    UPDATE_TIMESTAMP TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE RECREATION_OCCUPANCY_CODE IS 'Codes describing the occupancy of recreation projects.';

-- There were no descriptions for the columns in the original RECREATION_OCCUPANCY_CODE table

CREATE TABLE RECREATION_PLAN (
    FOREST_FILE_ID VARCHAR(10),
    REC_PROJECT_SKEY INT,
    PLAN_TYPE_CODE CHAR(1),
    REMARKS VARCHAR(254),
    PRIMARY KEY (FOREST_FILE_ID, REC_PROJECT_SKEY, PLAN_TYPE_CODE)
);

COMMENT ON TABLE RECREATION_PLAN IS 'Plans and details related to recreation projects.';

-- There were no descriptions for the columns in the original RECREATION_PLAN table

CREATE TABLE RECREATION_REMED_REPAIR_CODE (
    RECREATION_REMED_REPAIR_CODE VARCHAR(2) PRIMARY KEY,
    DESCRIPTION VARCHAR(120),
    EFFECTIVE_DATE DATE,
    EXPIRY_DATE DATE,
    UPDATE_TIMESTAMP TIMESTAMP
);

COMMENT ON TABLE RECREATION_REMED_REPAIR_CODE IS 'Codes describing types of remedial repairs for recreation structures.';

COMMENT ON COLUMN RECREATION_REMED_REPAIR_CODE.RECREATION_REMED_REPAIR_CODE IS 'Indicates the type of remedial repair applicable to the defined campsite.';
COMMENT ON COLUMN RECREATION_REMED_REPAIR_CODE.DESCRIPTION IS 'Description of the code value';
COMMENT ON COLUMN RECREATION_REMED_REPAIR_CODE.EFFECTIVE_DATE IS 'Date the code becomes effective';
COMMENT ON COLUMN RECREATION_REMED_REPAIR_CODE.EXPIRY_DATE IS 'Date the code expires';
COMMENT ON COLUMN RECREATION_REMED_REPAIR_CODE.UPDATE_TIMESTAMP IS 'The date and time the value was last modified.';

CREATE TABLE RECREATION_RISK_EVALUATION (
    RISK_EVALUATION_ID BIGINT PRIMARY KEY,
    RECREATION_USER_DAYS_CODE VARCHAR(10),
    RECREATION_OCCUPANCY_CODE VARCHAR(10),
    ENTRY_TIMESTAMP TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ENTRY_USERID VARCHAR(30),
    UPDATE_TIMESTAMP TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UPDATE_USERID VARCHAR(30)
);

COMMENT ON TABLE RECREATION_RISK_EVALUATION IS 'Evaluation of risks associated with recreation projects.';

-- There were no descriptions for the columns in the original RECREATION_RISK_EVALUATION table

CREATE TABLE RECREATION_RISK_RATING_CODE (
    RECREATION_RISK_RATING_CODE VARCHAR(3) PRIMARY KEY,
    DESCRIPTION VARCHAR(120),
    EFFECTIVE_DATE DATE,
    EXPIRY_DATE DATE,
    UPDATE_TIMESTAMP TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE RECREATION_RISK_RATING_CODE IS 'Codes describing the Recreation Risk Rating for a project.';

COMMENT ON COLUMN RECREATION_RISK_RATING_CODE.RECREATION_RISK_RATING_CODE IS 'Code describing the Recreation Risk Rating.';
COMMENT ON COLUMN RECREATION_RISK_RATING_CODE.DESCRIPTION IS 'Description of the code value';
COMMENT ON COLUMN RECREATION_RISK_RATING_CODE.EFFECTIVE_DATE IS 'Date the code becomes effective';
COMMENT ON COLUMN RECREATION_RISK_RATING_CODE.EXPIRY_DATE IS 'Date the code expires';
COMMENT ON COLUMN RECREATION_RISK_RATING_CODE.UPDATE_TIMESTAMP IS 'The date and time the value was last modified.';

CREATE TABLE RECREATION_RISK_SITE (
    RISK_SITE_ID SERIAL PRIMARY KEY,
    FOREST_FILE_ID VARCHAR(10),
    ENTRY_TIMESTAMP DATE,
    ENTRY_USERID VARCHAR(30),
    UPDATE_TIMESTAMP DATE,
    UPDATE_USERID VARCHAR(30)
);

COMMENT ON TABLE RECREATION_RISK_SITE IS 'Sites that have been identified as having specific risks within a recreation project.';

-- There were no descriptions for the columns in the original RECREATION_RISK_SITE table

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

COMMENT ON TABLE RECREATION_SEARCH_RESULT IS 'The global temp table used to facilitate Recreation Searches.';

-- There were no descriptions for the columns in the original RECREATION_SEARCH_RESULT table

CREATE TABLE RECREATION_SITE (
    FOREST_FILE_ID VARCHAR(10) PRIMARY KEY,
    REC_SITE_NAME VARCHAR(50) NULL
);

COMMENT ON TABLE RECREATION_SITE IS 'Stores information about recreation sites.';

-- There were no descriptions for the columns in the original RECREATION_SITE table

CREATE TABLE RECREATION_SITE_POINT (
    FOREST_FILE_ID VARCHAR(10) PRIMARY KEY,
    GEOMETRY GEOMETRY,
    REVISION_COUNT INTEGER,
    ENTRY_USERID VARCHAR(30),
    ENTRY_TIMESTAMP TIMESTAMP,
    UPDATE_USERID VARCHAR(30),
    UPDATE_TIMESTAMP TIMESTAMP
);

COMMENT ON TABLE RECREATION_SITE_POINT IS 'Stores the location of a Recreation Site as an oracle locator point. The data is used to provide the public a map location of the Recreation Site.';

COMMENT ON COLUMN RECREATION_SITE_POINT.FOREST_FILE_ID IS 'File identification assigned to Provincial Forest Use files. Assigned file number. Usually the Licence, Tenure or Private Mark number.';
COMMENT ON COLUMN RECREATION_SITE_POINT.GEOMETRY IS 'A point geometry location represented by a single X,Y pair';
COMMENT ON COLUMN RECREATION_SITE_POINT.REVISION_COUNT IS 'A count of the number of times an entry in the entity has been modified. Used to validate if the current information displayed on a user"s web browser is the most current.';
COMMENT ON COLUMN RECREATION_SITE_POINT.ENTRY_USERID IS 'The userid of the user that inserted data into the record.';
COMMENT ON COLUMN RECREATION_SITE_POINT.ENTRY_TIMESTAMP IS 'Timestamp indicating when data was last inserted into the record.';
COMMENT ON COLUMN RECREATION_SITE_POINT.UPDATE_USERID IS 'The userid of the user that last updated the declared area record.';
COMMENT ON COLUMN RECREATION_SITE_POINT.UPDATE_TIMESTAMP IS 'The timestamp of the last update to the declared area record.';

CREATE TABLE RECREATION_STRUCT_DIMEN_CODE (
    RECREATION_STRUCT_DIMEN_CODE VARCHAR(2) PRIMARY KEY,
    DESCRIPTION VARCHAR(120) NULL,
    EFFECTIVE_DATE DATE NULL,
    EXPIRY_DATE DATE NULL,
    UPDATE_TIMESTAMP DATE NULL
);

COMMENT ON TABLE RECREATION_STRUCT_DIMEN_CODE IS 'Codes describing the dimensions of recreation structures (e.g., Length, Area).';

COMMENT ON COLUMN RECREATION_STRUCT_DIMEN_CODE.RECREATION_STRUCT_DIMEN_CODE IS 'Code describing the unit of measure for a Recreation Structure. (e.g. Length or Area)';
COMMENT ON COLUMN RECREATION_STRUCT_DIMEN_CODE.DESCRIPTION IS 'Description of the code value';
COMMENT ON COLUMN RECREATION_STRUCT_DIMEN_CODE.EFFECTIVE_DATE IS 'Date the code becomes effective';
COMMENT ON COLUMN RECREATION_STRUCT_DIMEN_CODE.EXPIRY_DATE IS 'Date the code expires';
COMMENT ON COLUMN RECREATION_STRUCT_DIMEN_CODE.UPDATE_TIMESTAMP IS 'The date and time the value was last modified.';

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

COMMENT ON TABLE RECREATION_STRUCT_DIMEN_XREF IS 'Describes the applicable dimensions for the given structure type. E.g., Paths may have count and length, docks may have length and area.';

COMMENT ON COLUMN RECREATION_STRUCT_DIMEN_XREF.RECREATION_STRUCTURE_CODE IS 'Indicates the type of structure (man-made improvement).';
COMMENT ON COLUMN RECREATION_STRUCT_DIMEN_XREF.RECREATION_STRUCT_DIMEN_CODE IS 'Code describing the unit of measure for a Recreation Structure. (e.g. Length or Area)';
COMMENT ON COLUMN RECREATION_STRUCT_DIMEN_XREF.REVISION_COUNT IS 'A count of the number of times an entry in the entity has been modified. Used to validate if the current information displayed on a user''s web browser is the most current.';
COMMENT ON COLUMN RECREATION_STRUCT_DIMEN_XREF.ENTRY_USERID IS 'The userid responsible for inserting data into a table.';
COMMENT ON COLUMN RECREATION_STRUCT_DIMEN_XREF.ENTRY_TIMESTAMP IS 'Contains the system timestamp when data in a table was inserted.';
COMMENT ON COLUMN RECREATION_STRUCT_DIMEN_XREF.UPDATE_USERID IS 'The userid of the individual who last updated this road section record.';
COMMENT ON COLUMN RECREATION_STRUCT_DIMEN_XREF.UPDATE_TIMESTAMP IS 'The timestamp of the last update to the road section record.';

CREATE TABLE RECREATION_STRUCTURE_CODE (
    RECREATION_STRUCTURE_CODE VARCHAR(3) PRIMARY KEY,
    DESCRIPTION VARCHAR(120),
    EFFECTIVE_DATE DATE,
    EXPIRY_DATE DATE,
    UPDATE_TIMESTAMP DATE
);

COMMENT ON TABLE RECREATION_STRUCTURE_CODE IS 'Codes describing the type of structure (man-made improvement) within a recreation project.';

COMMENT ON COLUMN RECREATION_STRUCTURE_CODE.RECREATION_STRUCTURE_CODE IS 'Indicates the type of structure (man-made improvement).';
COMMENT ON COLUMN RECREATION_STRUCTURE_CODE.DESCRIPTION IS 'Description of the code value.';
COMMENT ON COLUMN RECREATION_STRUCTURE_CODE.EFFECTIVE_DATE IS 'Date the code becomes effective.';
COMMENT ON COLUMN RECREATION_STRUCTURE_CODE.EXPIRY_DATE IS 'Date the code expires.';
COMMENT ON COLUMN RECREATION_STRUCTURE_CODE.UPDATE_TIMESTAMP IS 'The date and time the value was last modified.';

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

COMMENT ON TABLE RECREATION_STRUCTURE IS 'Information relating to a recreation site improvement in a recreational tenure. All improvements are man-made.';

COMMENT ON COLUMN RECREATION_STRUCTURE.STRUCTURE_ID IS 'The unique identifier for the structure.';
COMMENT ON COLUMN RECREATION_STRUCTURE.FOREST_FILE_ID IS 'File identification assigned to Provincial Forest Use files. Assigned file number. Usually the Licence, Tenure or Private Mark number.';
COMMENT ON COLUMN RECREATION_STRUCTURE.CAMPSITE_FOREST_FILE_ID IS 'File identification assigned to Provincial Forest Use files. Assigned file number. Usually the Licence, Tenure or Private Mark number.';
COMMENT ON COLUMN RECREATION_STRUCTURE.RECREATION_STRUCTURE_CODE IS 'Indicates the type of structure (man-made improvement).';
COMMENT ON COLUMN RECREATION_STRUCTURE.STRUCTURE_NAME IS 'The name of the structure.';
COMMENT ON COLUMN RECREATION_STRUCTURE.STRUCTURE_COUNT IS 'The number of structures for a given project''s structure type.';
COMMENT ON COLUMN RECREATION_STRUCTURE.STRUCTURE_LENGTH IS 'Total length in metres for length-based structure types. (E.g. paths).';
COMMENT ON COLUMN RECREATION_STRUCTURE.STRUCTURE_WIDTH IS 'Total width in metres for width-based structure types. (E.g. parking lots).';
COMMENT ON COLUMN RECREATION_STRUCTURE.STRUCTURE_AREA IS 'Total area in square metres for area-based structure types. This will be applicable to only certain structures. E.g. Shelter.';
COMMENT ON COLUMN RECREATION_STRUCTURE.ACTUAL_VALUE IS 'The actual value of the recreation structure. This value takes precedence over the structure type value.';
COMMENT ON COLUMN RECREATION_STRUCTURE.CAMPSITE_NUMBER IS 'The number assigned to a defined campsite by Recreation staff.';
COMMENT ON COLUMN RECREATION_STRUCTURE.RECREATION_REMED_REPAIR_CODE IS 'Indicates the type of remedial repair applicable to the defined campsite.';
COMMENT ON COLUMN RECREATION_STRUCTURE.ESTIMATED_REPAIR_COST IS 'The estimated repair cost for the structure.';
COMMENT ON COLUMN RECREATION_STRUCTURE.REPAIR_COMPLETED_DATE IS 'The date on which the structure repair was completed.';
COMMENT ON COLUMN RECREATION_STRUCTURE.REVISION_COUNT IS 'A count of the number of times an entry in the entity has been modified. Used to validate if the current information displayed on a user''s web browser is the most current.';
COMMENT ON COLUMN RECREATION_STRUCTURE.ENTRY_USERID IS 'The userid responsible for inserting data into a table.';
COMMENT ON COLUMN RECREATION_STRUCTURE.UPDATE_USERID IS 'The userid of the individual who last updated this road section record.';
COMMENT ON COLUMN RECREATION_STRUCTURE.UPDATE_TIMESTAMP IS 'The timestamp of the last update to the road section record.';
COMMENT ON COLUMN RECREATION_STRUCTURE.ENTRY_TIMESTAMP IS 'Contains the system timestamp when data in a table was inserted.';

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

COMMENT ON TABLE RECREATION_STRUCTURE_VALUE IS 'Identifies the value and dimension for a given structure. E.g., Barrel Shelters, 300/u, or Boardwalks, $50/m.';

COMMENT ON COLUMN RECREATION_STRUCTURE_VALUE.RECREATION_STRUCTURE_CODE IS 'Indicates the type of structure (man-made improvement).';
COMMENT ON COLUMN RECREATION_STRUCTURE_VALUE.STRUCTURE_VALUE IS 'Identifies the value for a given structure.';
COMMENT ON COLUMN RECREATION_STRUCTURE_VALUE.DIMENSION IS 'Identifies the dimension for the given structure value. E.g. Unit, or Metres.';
COMMENT ON COLUMN RECREATION_STRUCTURE_VALUE.REVISION_COUNT IS 'A count of the number of times an entry in the entity has been modified. Used to validate if the current information displayed on a user''s web browser is the most current.';
COMMENT ON COLUMN RECREATION_STRUCTURE_VALUE.ENTRY_USERID IS 'The userid responsible for inserting data into a table.';
COMMENT ON COLUMN RECREATION_STRUCTURE_VALUE.ENTRY_TIMESTAMP IS 'Contains the system timestamp when data in a table was inserted.';
COMMENT ON COLUMN RECREATION_STRUCTURE_VALUE.UPDATE_USERID IS 'The userid of the individual who last updated this road section record.';
COMMENT ON COLUMN RECREATION_STRUCTURE_VALUE.UPDATE_TIMESTAMP IS 'The timestamp of the last update to the road section record.';

CREATE TABLE RECREATION_SUB_ACCESS_CODE (
    RECREATION_SUB_ACCESS_CODE VARCHAR(3) PRIMARY KEY,
    DESCRIPTION VARCHAR(120),
    EFFECTIVE_DATE DATE,
    EXPIRY_DATE DATE,
    UPDATE_TIMESTAMP TIMESTAMP
);

COMMENT ON TABLE RECREATION_SUB_ACCESS_CODE IS 'Codes describing the Recreation Sub Access types within a project.';

COMMENT ON COLUMN RECREATION_SUB_ACCESS_CODE.RECREATION_SUB_ACCESS_CODE IS 'Code describing the Recreation Sub Access types.';
COMMENT ON COLUMN RECREATION_SUB_ACCESS_CODE.DESCRIPTION IS 'Description of the code value.';
COMMENT ON COLUMN RECREATION_SUB_ACCESS_CODE.EFFECTIVE_DATE IS 'Date the code becomes effective';
COMMENT ON COLUMN RECREATION_SUB_ACCESS_CODE.EXPIRY_DATE IS 'Date the code expires';
COMMENT ON COLUMN RECREATION_SUB_ACCESS_CODE.UPDATE_TIMESTAMP IS 'The date and time the value was last modified.';

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

COMMENT ON TABLE RECREATION_TRAIL_SEGMENT IS 'Stores coordinate and repair information for trail segments in a Recreation project. May also store coordinate and repair information for a project trail.';

COMMENT ON COLUMN RECREATION_TRAIL_SEGMENT.FOREST_FILE_ID IS 'File identification assigned to Provincial Forest Use files. Assigned file number. Usually the Licence, Tenure or Private Mark number.';
COMMENT ON COLUMN RECREATION_TRAIL_SEGMENT.RECREATION_TRAIL_SEG_ID IS 'A system-generated unique identifier for the trail.';
COMMENT ON COLUMN RECREATION_TRAIL_SEGMENT.TRAIL_SEGMENT_NAME IS 'The user-entered name specified for the trail segment.';
COMMENT ON COLUMN RECREATION_TRAIL_SEGMENT.START_STATION IS 'The start station of the trail segment. Identified in the field by the user-entered name given to the trail segment. START_STATION is measured in meters from the start of the trail.';
COMMENT ON COLUMN RECREATION_TRAIL_SEGMENT.END_STATION IS 'The end station of the trail segment. END_STATION is measured in meters from the start of the trail. The END_STATION of a trail segment must be greater than the START_STATION of the trail segment.';
COMMENT ON COLUMN RECREATION_TRAIL_SEGMENT.RECREATION_REMED_REPAIR_CODE IS 'Indicates the type of remedial repair applicable to the defined campsite.';
COMMENT ON COLUMN RECREATION_TRAIL_SEGMENT.ESTIMATED_REPAIR_COST IS 'The estimated repair cost for the trail.';
COMMENT ON COLUMN RECREATION_TRAIL_SEGMENT.ACTUAL_REPAIR_COST IS 'The actual repair cost of the trail or trail segment.';
COMMENT ON COLUMN RECREATION_TRAIL_SEGMENT.REPAIR_COMPLETED_DATE IS 'The date on which the trail repair was completed.';
COMMENT ON COLUMN RECREATION_TRAIL_SEGMENT.WHEELCHAIR_ACCESSIBLE_IND IS 'Indicates when the trail is wheelchair accessible (Y, N or NULL).';
COMMENT ON COLUMN RECREATION_TRAIL_SEGMENT.REVISION_COUNT IS 'A count of the number of times an entry in the entity has been modified. Used to validate if the current information displayed on a user''s web browser is the most current.';
COMMENT ON COLUMN RECREATION_TRAIL_SEGMENT.ENTRY_USERID IS 'The userid of the user that inserted data into the record.';
COMMENT ON COLUMN RECREATION_TRAIL_SEGMENT.ENTRY_TIMESTAMP IS 'Timestamp indicating when data was last inserted into the record.';
COMMENT ON COLUMN RECREATION_TRAIL_SEGMENT.UPDATE_USERID IS 'The userid of the user that last updated the declared area record.';
COMMENT ON COLUMN RECREATION_TRAIL_SEGMENT.UPDATE_TIMESTAMP IS 'The timestamp of the last update to the declared area record.';

CREATE TABLE RECREATION_USER_DAYS_CODE (
    RECREATION_USER_DAYS_CODE VARCHAR(10) NOT NULL PRIMARY KEY,
    DESCRIPTION VARCHAR(120),
    EFFECTIVE_DATE DATE,
    EXPIRY_DATE DATE,
    UPDATE_TIMESTAMP TIMESTAMP
);

COMMENT ON TABLE RECREATION_USER_DAYS_CODE IS 'Codes describing the Recreation User Days associated with a project.';

COMMENT ON COLUMN RECREATION_USER_DAYS_CODE.RECREATION_USER_DAYS_CODE IS 'Code describing the Recreation User Days.';
COMMENT ON COLUMN RECREATION_USER_DAYS_CODE.DESCRIPTION IS 'Description of the code value';
COMMENT ON COLUMN RECREATION_USER_DAYS_CODE.EFFECTIVE_DATE IS 'Date the code becomes effective';
COMMENT ON COLUMN RECREATION_USER_DAYS_CODE.EXPIRY_DATE IS 'Date the code expires';
COMMENT ON COLUMN RECREATION_USER_DAYS_CODE.UPDATE_TIMESTAMP IS 'The date and time the value was last modified.';
