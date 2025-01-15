
create table fta.recreation_project (
    forest_file_id varchar(20) primary key,
    project_name varchar(200),
    recreation_control_access_code varchar(10) null,
    recreation_feature_code varchar(3) null,
    recreation_maintain_std_code varchar(10) null,
    recreation_risk_rating_code varchar(3) null,
    utm_zone int null,
    last_rec_inspection_date date null,
    rec_project_skey varchar(20) null,
    resource_feature_ind varchar(1) default 'N',
    last_hzrd_tree_assess_date date null,
    site_description varchar(500) null,
    recreation_user_days_code varchar(3) null,
    overflow_campsites int null,
    utm_northing int null,
    utm_easting int null,
    right_of_way numeric(7, 1) null,
    arch_impact_assess_ind varchar(20) null,
    site_location varchar(500) null,
    project_established_date date null,
    recreation_view_ind varchar(1) default 'N',
    revision_count int null,
    entry_userid varchar(30) null,
    entry_timestamp date null,
    update_userid varchar(30) null,
    update_timestamp date null,
    arch_impact_date date null,
    borden_no varchar(200) null,
    camp_host_ind varchar(1) default 'N',
    low_mobility_access_ind varchar(1) default 'N',
    constraint chk_resource_feature_ind check (resource_feature_ind in ('N', 'Y')),
    constraint chk_arch_impact_assess_ind check (arch_impact_assess_ind in ('Y', 'N')),
    constraint chk_recreation_view_ind check (recreation_view_ind in ('Y', 'N')),
    constraint chk_camp_host_ind check (camp_host_ind in ('Y', 'N'))
);

comment on table fta.recreation_project is 'Project information relating to a recreational file. A recreation file can have only one project. A project must be of type Site, Reserve, Trail, or Interpretive Forest.';

comment on column fta.recreation_project.forest_file_id is 'File identification assigned to Provincial Forest Use files. Assigned file number. Usually the Licence, Tenure or Private Mark number.';

comment on column fta.recreation_project.project_name is 'Name of the Recreation Project.';

comment on column fta.recreation_project.recreation_control_access_code is 'Describes the Controlled Access Code for a project. E.g. “Gated”, “Restricted Use”.';

comment on column fta.recreation_project.recreation_feature_code is 'Code describing the Recreation Feature.';

comment on column fta.recreation_project.recreation_maintain_std_code is 'Code describing the Maintenance Standard of a given site. E.g. User Maintained, Maintained to Standard, Not Maintained.';

comment on column fta.recreation_project.recreation_risk_rating_code is 'Code describing the Recreation Risk Rating.';

comment on column fta.recreation_project.utm_zone is 'The Universal Transverse Mercator location reference known as the Zone reference.';

comment on column fta.recreation_project.last_rec_inspection_date is 'The last date of inspection for the project.';

comment on column fta.recreation_project.rec_project_skey is 'Concatenation of Forest File Id and project.';

comment on column fta.recreation_project.resource_feature_ind is 'The resource feature for a recreation project.';

comment on column fta.recreation_project.last_hzrd_tree_assess_date is 'Identifies the date of the last hazard tree assessment for the recreation project.';

comment on column fta.recreation_project.site_description is 'Field notes related to a recreation site. e.g. A managed, 11 unit site with 2WD access, gravel beach launch and a small float. Watch for hazards on the lake. This column is for internal use and is not a description for public use.';

comment on column fta.recreation_project.recreation_user_days_code is 'Code describing the Recreation User Days.';

comment on column fta.recreation_project.overflow_campsites is 'The number of overflow spaces that the project site can handle.';

comment on column fta.recreation_project.utm_northing is 'The Universal Transverse Mercator location reference. This is the Northing reference (metres north of the Equator).';

comment on column fta.recreation_project.utm_easting is 'The Universal Transverse Mercator location reference for the project. This is the Easting reference (metres east of the Central Meridian of the zone).';

comment on column fta.recreation_project.right_of_way is 'Identifies the Right of Way width for a linear feature. This attribute will likely be replaced by a spatial attribute in the future.';

comment on column fta.recreation_project.arch_impact_assess_ind is 'Indicates if an archaeological impact assessment has been performed for the given project.';

comment on column fta.recreation_project.site_location is 'A text description generally describing the closest community or, for more isolated sites and trails, it could be a geographic feature to a recreation site or trail. e.g. VERNON, KELOWNA, PRINCE GEORGE.';

comment on column fta.recreation_project.project_established_date is 'Date on which the project was legally established.';

comment on column fta.recreation_project.recreation_view_ind is 'Indicates whether a Recreation project must be shown in the Recreation View web mapping tool. Allowable values are “Y” and “N”.';

comment on column fta.recreation_project.revision_count is 'A count of the number of times an entry in the entity has been modified. Used to validate if the current information displayed on a user''s web browser is the most current.';

comment on column fta.recreation_project.entry_userid is 'The userid responsible for inserting data into a table.';

comment on column fta.recreation_project.entry_timestamp is 'Contains the system timestamp when data in a table was inserted.';

comment on column fta.recreation_project.update_userid is 'The userid of the individual who last updated this road section record.';

comment on column fta.recreation_project.update_timestamp is 'The timestamp of the last update to the road section record.';

comment on column fta.recreation_project.arch_impact_date is 'Identifies the archaeological impact assessment date.';

comment on column fta.recreation_project.borden_no is 'Identifies the borden numbers of the archaeological site.';

comment on column fta.recreation_project.camp_host_ind is 'Identifies whether or not there is a camp host or operator.';

comment on column fta.recreation_project.low_mobility_access_ind is 'Identifies whether or not there is low mobility access to the site.';

create table fta.recreation_access (
    forest_file_id varchar(10),
    recreation_access_code varchar(3) not null,
    recreation_sub_access_code varchar(3) not null,
    revision_count integer,
    entry_userid varchar(30),
    entry_timestamp timestamp,
    update_userid varchar(30),
    update_timestamp timestamp
);

comment on table fta.recreation_access is 'Information relating to modes of access to a recreation project.';

comment on column fta.recreation_access.forest_file_id is 'File identification assigned to Provincial Forest Use files. Assigned file number. Usually the Licence, Tenure or Private Mark number.';

comment on column fta.recreation_access.recreation_access_code is 'Code describing the Recreation Objective.';

comment on column fta.recreation_access.recreation_sub_access_code is 'Code describing the Recreation Sub Access types.';

comment on column fta.recreation_access.revision_count is 'A count of the number of times an entry in the entity has been modified. Used to validate if the current information displayed on a user''s web browser is the most current.';

comment on column fta.recreation_access.entry_userid is 'The userid responsible for inserting data into a table.';

comment on column fta.recreation_access.entry_timestamp is 'Contains the system timestamp when data in a table was inserted.';

comment on column fta.recreation_access.update_userid is 'The userid of the individual who last updated this road section record.';

comment on column fta.recreation_access.update_timestamp is 'The timestamp of the last update to the road section record.';

create table fta.recreation_access_code (
    recreation_access_code varchar(3) not null,
    description varchar(120),
    effective_date date,
    expiry_date date,
    update_timestamp timestamp
);

-- There was no table description in the original RECREATION_ACCESS_CODE table
comment on column fta.recreation_access_code.recreation_access_code is 'Code describing the Recreation Objective.';

comment on column fta.recreation_access_code.description is 'Description of the code value.';

comment on column fta.recreation_access_code.effective_date is 'Date the code becomes effective.';

comment on column fta.recreation_access_code.expiry_date is 'Date the code expires.';

comment on column fta.recreation_access_code.update_timestamp is 'The date and time the value was last modified.';

create table fta.recreation_access_xref (
    recreation_access_code varchar(3) not null,
    recreation_sub_access_code varchar(3) not null,
    revision_count integer,
    entry_userid varchar(30),
    entry_timestamp timestamp,
    update_userid varchar(30),
    update_timestamp timestamp
);

comment on table fta.recreation_access_xref is 'Describes valid combinations between Recreation Access and Recreation Sub Access types. E.g. Boat in - Motor Boat, Boat in - Canoe, Trail-MultiUse, Trail-Snowmobile.';

comment on column fta.recreation_access_xref.recreation_access_code is 'Code describing the Recreation Objective.';

comment on column fta.recreation_access_xref.recreation_sub_access_code is 'Code describing the Recreation Sub Access types.';

comment on column fta.recreation_access_xref.revision_count is 'A count of the number of times an entry in the entity has been modified. Used to validate if the current information displayed on a user''s web browser is the most current.';

comment on column fta.recreation_access_xref.entry_userid is 'The userid responsible for inserting data into a table.';

comment on column fta.recreation_access_xref.entry_timestamp is 'Contains the system timestamp when data in a table was inserted.';

comment on column fta.recreation_access_xref.update_userid is 'The userid of the individual who last updated this road section record.';

comment on column fta.recreation_access_xref.update_timestamp is 'The timestamp of the last update to the road section record.';

create table fta.recreation_activity (
    forest_file_id varchar(10),
    recreation_activity_code varchar(3) not null,
    activity_rank int,
    revision_count int,
    entry_userid varchar(30),
    entry_timestamp timestamp,
    update_userid varchar(30),
    update_timestamp timestamp
);

comment on table fta.recreation_activity is 'The types of available activities for a given project.';

comment on column fta.recreation_activity.forest_file_id is 'File identification assigned to Provincial Forest Use files. Assigned file number. Usually the Licence, Tenure or Private Mark number.';

comment on column fta.recreation_activity.recreation_activity_code is 'Code describing the Recreation Activity.';

comment on column fta.recreation_activity.activity_rank is 'The order of importance of this activity for the given project as a number from 1 to 3.';

comment on column fta.recreation_activity.revision_count is 'A count of the number of times an entry in the entity has been modified. Used to validate if the current information displayed on a user''s web browser is the most current.';

comment on column fta.recreation_activity.entry_userid is 'The userid responsible for inserting data into a table.';

comment on column fta.recreation_activity.entry_timestamp is 'Contains the system timestamp when data in a table was inserted.';

comment on column fta.recreation_activity.update_userid is 'The userid of the individual who last updated this road section record.';

comment on column fta.recreation_activity.update_timestamp is 'The timestamp of the last update to the road section record.';

create table fta.recreation_activity_code (
    recreation_activity_code varchar(3) primary key,
    description varchar(120),
    effective_date date,
    expiry_date date,
    update_timestamp timestamp default current_timestamp
);

comment on table fta.recreation_activity_code is 'Activity code types for recreation projects.';

comment on column fta.recreation_activity_code.recreation_activity_code is 'Code describing the Recreation Activity.';

comment on column fta.recreation_activity_code.description is 'Description of the code value.';

comment on column fta.recreation_activity_code.effective_date is 'Date the code becomes effective.';

comment on column fta.recreation_activity_code.expiry_date is 'Date the code expires.';

comment on column fta.recreation_activity_code.update_timestamp is 'The date and time the value was last modified.';

create table fta.recreation_agreement_holder (
    agreement_holder_id serial primary key,
    forest_file_id varchar(10) references fta.recreation_project (forest_file_id) on delete restrict,
    client_number varchar(8),
    client_locn_code varchar(2),
    agreement_start_date date,
    agreement_end_date date,
    revision_count int,
    entry_userid varchar(30),
    entry_timestamp timestamp default current_timestamp,
    update_userid varchar(30),
    update_timestamp timestamp default current_timestamp
);

comment on table fta.recreation_agreement_holder is 'Identifies the Agreement Holder responsible for maintaining a project for a given time frame.';

comment on column fta.recreation_agreement_holder.agreement_holder_id is 'The unique identifier for a recreation agreement holder.';

comment on column fta.recreation_agreement_holder.forest_file_id is 'File identification assigned to Provincial Forest Use files. Assigned file number. Usually the Licence, Tenure or Private Mark number.';

comment on column fta.recreation_agreement_holder.client_number is 'Sequentially assigned number to identify a ministry client.';

comment on column fta.recreation_agreement_holder.client_locn_code is 'Retrofitted from column CLIENT_LOCN_CODE of table FOR_CLIENT_LINK.';

comment on column fta.recreation_agreement_holder.agreement_start_date is 'Start date of the agreement held between the ministry and the agreement holder.';

comment on column fta.recreation_agreement_holder.agreement_end_date is 'End date of the agreement held between the ministry and the agreement holder.';

comment on column fta.recreation_agreement_holder.revision_count is 'A count of the number of times an entry in the entity has been modified. Used to validate if the current information displayed on a user''s web browser is the most current.';

comment on column fta.recreation_agreement_holder.entry_userid is 'The userid responsible for inserting data into a table.';

comment on column fta.recreation_agreement_holder.entry_timestamp is 'Contains the system timestamp when data in a table was inserted.';

comment on column fta.recreation_agreement_holder.update_userid is 'The userid of the individual who last updated this road section record.';

comment on column fta.recreation_agreement_holder.update_timestamp is 'The timestamp of the last update to the road section record.';

create table fta.recreation_attachment (
    forest_file_id varchar(10),
    recreation_attachment_id serial not null,
    attachment_file_name varchar(50),
    revision_count int,
    entry_userid varchar(30),
    entry_timestamp timestamp,
    update_userid varchar(30),
    update_timestamp timestamp
);

comment on table fta.recreation_attachment is 'Stores a reference to each attachment related to the Recreation project such as the Establishment Order document.';

comment on column fta.recreation_attachment.forest_file_id is 'File identification assigned to Provincial Forest Use files. Assigned file number. Usually the Licence, Tenure or Private Mark number.';

comment on column fta.recreation_attachment.recreation_attachment_id is 'System-generated ID for the attachment.';

comment on column fta.recreation_attachment.attachment_file_name is 'File name, not including the path, of the attached file at the time it was uploaded.';

comment on column fta.recreation_attachment.revision_count is 'A count of the number of times an entry in the entity has been modified. Used to validate if the current information displayed on a user''s web browser is the most current.';

comment on column fta.recreation_attachment.entry_userid is 'The userid of the user that inserted data into the record.';

comment on column fta.recreation_attachment.entry_timestamp is 'Timestamp indicating when data was last inserted into the record.';

comment on column fta.recreation_attachment.update_userid is 'The userid of the user that last updated the declared area record.';

comment on column fta.recreation_attachment.update_timestamp is 'The timestamp of the last update to the declared area record.';

create table fta.recreation_attachment_content (
    forest_file_id varchar(10) references fta.recreation_attachment (forest_file_id) on delete restrict,
    recreation_attachment_id int,
    attachment_content bytea,
    primary key (forest_file_id, recreation_attachment_id),
    constraint fk_recreation_attachment_forest_file_id foreign key (forest_file_id) references fta.recreation_project (forest_file_id) on delete restrict
);

comment on table fta.recreation_attachment_content is 'Stores attachment content for each attachment related to the Recreation project.';

comment on column fta.recreation_attachment_content.forest_file_id is 'File identification assigned to Provincial Forest Use files. Assigned file number. Usually the Licence, Tenure or Private Mark number.';

comment on column fta.recreation_attachment_content.recreation_attachment_id is 'System-generated ID for the attachment.';

comment on column fta.recreation_attachment_content.attachment_content is 'Content for the attachment.';

create table fta.recreation_comment (
    forest_file_id varchar(10) references fta.recreation_project (forest_file_id) on delete restrict,
    recreation_comment_id serial primary key,
    rec_comment_type_code varchar(4),
    closure_ind char(1) default 'N',
    project_comment varchar(2000),
    comment_date date,
    revision_count int,
    entry_userid varchar(30),
    entry_timestamp timestamp,
    update_userid varchar(30),
    update_timestamp timestamp,
    constraint chk_closure_ind check (closure_ind in ('Y', 'N'))
);

comment on table fta.recreation_comment is 'Stores comments related to the Recreation project such as driving directions and closures.';

comment on column fta.recreation_comment.forest_file_id is 'File identification assigned to Provincial Forest Use files. Assigned file number. Usually the Licence, Tenure or Private Mark number.';

comment on column fta.recreation_comment.recreation_comment_id is 'A system-generated unique identifier for the comment.';

comment on column fta.recreation_comment.rec_comment_type_code is 'A code which specifies the type of comment. Eg. Driving Directions, Closures.';

comment on column fta.recreation_comment.closure_ind is 'Indicates whether there is a closure within the Recreation project site. Allowable values are “Y” and “N”.';

comment on column fta.recreation_comment.project_comment is 'The comment content.';

comment on column fta.recreation_comment.comment_date is 'The user-entered date on which the comment was entered.';

comment on column fta.recreation_comment.revision_count is 'A count of the number of times an entry in the entity has been modified. Used to validate if the current information displayed on a user''s web browser is the most current.';

comment on column fta.recreation_comment.entry_userid is 'The userid of the user that inserted data into the record.';

comment on column fta.recreation_comment.entry_timestamp is 'Timestamp indicating when data was last inserted into the record.';

comment on column fta.recreation_comment.update_userid is 'The userid of the user that last updated the declared area record.';

comment on column fta.recreation_comment.update_timestamp is 'The timestamp of the last update to the declared area record.';

create table fta.recreation_control_access_code (
    recreation_control_access_code varchar(1) primary key,
    description varchar(120),
    effective_date date,
    expiry_date date,
    update_timestamp timestamp
);

comment on table fta.recreation_control_access_code is 'Control access codes for recreation projects.';

comment on column fta.recreation_control_access_code.recreation_control_access_code is 'Describes the Controlled Access Code for a project. E.g. “Gated”, “Restricted Use”.';

comment on column fta.recreation_control_access_code.description is 'Description of the code value.';

comment on column fta.recreation_control_access_code.effective_date is 'Date the code becomes effective.';

comment on column fta.recreation_control_access_code.expiry_date is 'Date the code expires.';

comment on column fta.recreation_control_access_code.update_timestamp is 'The date and time the value was last modified.';

create table fta.recreation_def_cs_rpr_history (
    forest_file_id varchar(10) not null,
    campsite_number int not null,
    recreation_remed_repair_code varchar(2) null,
    estimated_repair_cost numeric(7, 2) null,
    repair_complete_date date null,
    revision_count int null,
    entry_userid varchar(30) null,
    entry_timestamp timestamp null,
    update_userid varchar(30) null,
    update_timestamp timestamp null,
    primary key (forest_file_id, campsite_number)
);

comment on table fta.recreation_def_cs_rpr_history is 'Recreation Defined Campsite repair history audit log. Note that defined campsites can be deleted, while retaining the repair history.';

comment on column fta.recreation_def_cs_rpr_history.forest_file_id is 'File identification assigned to Recreation Project.';

comment on column fta.recreation_def_cs_rpr_history.campsite_number is 'The number assigned to a defined campsite by Recreation staff.';

comment on column fta.recreation_def_cs_rpr_history.recreation_remed_repair_code is 'Indicates the type of remedial repair applicable to the defined campsite.';

comment on column fta.recreation_def_cs_rpr_history.estimated_repair_cost is 'Identifies the estimated remedial repair cost for a campsite.';

comment on column fta.recreation_def_cs_rpr_history.repair_complete_date is 'Identifies the completion date for the campsite repair.';

comment on column fta.recreation_def_cs_rpr_history.revision_count is 'A count of the number of times an entry in the entity has been modified. Used to validate if the current information displayed on a user''s web browser is the most current.';

comment on column fta.recreation_def_cs_rpr_history.entry_userid is 'The userid responsible for inserting data into a table.';

comment on column fta.recreation_def_cs_rpr_history.entry_timestamp is 'Contains the system timestamp when data in a table was inserted.';

comment on column fta.recreation_def_cs_rpr_history.update_userid is 'The userid of the individual who last updated this road section record.';

comment on column fta.recreation_def_cs_rpr_history.update_timestamp is 'The timestamp of the last update to the road section record.';

create table fta.recreation_defined_campsite (
    forest_file_id varchar(10) primary key,
    campsite_number int not null,
    estimated_repair_cost numeric(7, 2),
    recreation_remed_repair_code varchar(2),
    repair_complete_date date,
    revision_count int,
    entry_userid varchar(30),
    entry_timestamp timestamp default current_timestamp,
    update_userid varchar(30),
    update_timestamp timestamp default current_timestamp
);

comment on table fta.recreation_defined_campsite is 'A defined campsite is a camping area within a project designated by the Recreation officer. This may contain recreation structures.';

comment on column fta.recreation_defined_campsite.forest_file_id is 'File identification assigned to Provincial Forest Use files. Assigned file number. Usually the Licence, Tenure or Private Mark number.';

comment on column fta.recreation_defined_campsite.campsite_number is 'The number assigned to a defined campsite by Recreation staff.';

comment on column fta.recreation_defined_campsite.estimated_repair_cost is 'Identifies the estimated remedial repair cost for a campsite.';

comment on column fta.recreation_defined_campsite.recreation_remed_repair_code is 'Indicates the type of remedial repair applicable to the defined campsite.';

comment on column fta.recreation_defined_campsite.repair_complete_date is 'Identifies the completion date for the campsite repair.';

comment on column fta.recreation_defined_campsite.revision_count is 'A count of the number of times an entry in the entity has been modified. Used to validate if the current information displayed on a user''s web browser is the most current.';

comment on column fta.recreation_defined_campsite.entry_userid is 'The userid responsible for inserting data into a table.';

comment on column fta.recreation_defined_campsite.entry_timestamp is 'Contains the system timestamp when data in a table was inserted.';

comment on column fta.recreation_defined_campsite.update_userid is 'The userid of the individual who last updated this road section record.';

comment on column fta.recreation_defined_campsite.update_timestamp is 'The timestamp of the last update to the road section record.';

create table fta.recreation_district_code (
    recreation_district_code varchar(4) primary key,
    description varchar(120),
    effective_date date,
    expiry_date date,
    update_timestamp timestamp
);

comment on table fta.recreation_district_code is 'Recreation district codes for classification of areas within a project.';

comment on column fta.recreation_district_code.recreation_district_code is 'A code indicating a recreation district boundary. EG Cascades, Chilliwack, Discovery Coast. Note: There are 17 Recreation District Boundaries, most of which have different geographical boundaries than Forest District Boundaries. Because of this, Rec District Boundary Codes are different from Forest District Boundary Codes.';

comment on column fta.recreation_district_code.description is 'Description of the recreation district boundary type.';

comment on column fta.recreation_district_code.effective_date is 'Date the code becomes effective.';

comment on column fta.recreation_district_code.expiry_date is 'Date the code expires.';

comment on column fta.recreation_district_code.update_timestamp is 'The date and time the value was last modified.';

create table fta.recreation_district_xref (
    forest_file_id varchar(10) not null,
    recreation_district_code varchar(4) not null,
    revision_count int,
    entry_userid varchar(30),
    entry_timestamp timestamp,
    update_userid varchar(30),
    update_timestamp timestamp
);

-- There was no table description in the original RECREATION_DISTRICT_XREF table
comment on column fta.recreation_district_xref.forest_file_id is 'File identification assigned to Provincial Forest Use files. Assigned file number. Usually the Licence, Tenure or Private Mark number.';

comment on column fta.recreation_district_xref.recreation_district_code is 'A code indicating a recreation district boundary. EG Cascades, Chilliwack, Discovery Coast. Note: There are 17 Recreation District Boundaries, most of which have different geographical boundaries than Forest District Boundaries. Because of this, Rec District Boundary Codes are different from Forest District Boundary Codes.';

comment on column fta.recreation_district_xref.revision_count is 'A count of the number of times an entry in the entity has been modified. Used to validate if the current information displayed on a user"s web browser is the most current.';

comment on column fta.recreation_district_xref.entry_userid is 'The unique user id of the resource who initially added the entry.';

comment on column fta.recreation_district_xref.entry_timestamp is 'Timestamp when the event information was entered.';

comment on column fta.recreation_district_xref.update_userid is 'The userid of the individual who last updated this information.';

comment on column fta.recreation_district_xref.update_timestamp is 'The date and time of the last update.';

create table fta.recreation_feature_code (
    recreation_feature_code varchar(3) primary key,
    description varchar(120),
    effective_date date,
    expiry_date date,
    update_timestamp timestamp
);

comment on table fta.recreation_feature_code is 'Codes describing the recreation features within a project.';

comment on column fta.recreation_feature_code.recreation_feature_code is 'Code describing the Recreation Feature.';

comment on column fta.recreation_feature_code.description is 'Description of the code value.';

comment on column fta.recreation_feature_code.effective_date is 'Date the code becomes effective.';

comment on column fta.recreation_feature_code.expiry_date is 'Date the code expires.';

comment on column fta.recreation_feature_code.update_timestamp is 'The date and time the value was last modified.';

create table fta.recreation_fee_code (
    recreation_fee_code varchar(3) primary key,
    description varchar(120),
    effective_date date,
    expiry_date date,
    update_timestamp timestamp
);

comment on table fta.recreation_fee_code is 'Fee code types for recreation projects.';

comment on column fta.recreation_fee_code.recreation_fee_code is 'Code describing the Recreation Fee.';

comment on column fta.recreation_fee_code.description is 'Description of the code value.';

comment on column fta.recreation_fee_code.effective_date is 'Date the code becomes effective.';

comment on column fta.recreation_fee_code.expiry_date is 'Date the code expires.';

comment on column fta.recreation_fee_code.update_timestamp is 'The date and time the value was last modified.';

create table fta.recreation_fee (
    fee_id serial primary key,
    forest_file_id varchar(10) references fta.recreation_project (forest_file_id) on delete restrict,
    fee_amount numeric(5, 2) default null,
    fee_start_date date default null,
    fee_end_date date default null,
    monday_ind varchar(1) default 'N',
    tuesday_ind varchar(1) default 'N',
    wednesday_ind varchar(1) default 'N',
    thursday_ind varchar(1) default 'N',
    friday_ind varchar(1) default 'N',
    saturday_ind varchar(1) default 'N',
    sunday_ind varchar(1) default 'N',
    recreation_fee_code varchar(3) references fta.recreation_fee_code (recreation_fee_code) on delete restrict,
    revision_count numeric(5) default null,
    entry_userid varchar(30) default null,
    entry_timestamp timestamp default current_timestamp,
    update_userid varchar(30) default null,
    update_timestamp timestamp default current_timestamp,
    constraint chk_monday_ind check (monday_ind in ('Y', 'N')),
    constraint chk_tuesday_ind check (tuesday_ind in ('Y', 'N')),
    constraint chk_wednesday_ind check (wednesday_ind in ('Y', 'N')),
    constraint chk_thursday_ind check (thursday_ind in ('Y', 'N')),
    constraint chk_friday_ind check (friday_ind in ('Y', 'N')),
    constraint chk_saturday_ind check (saturday_ind in ('Y', 'N')),
    constraint chk_sunday_ind check (sunday_ind in ('Y', 'N'))
);

comment on table fta.recreation_fee is 'The types of fees for a given project (e.g., Overnight, firewood, etc.).';

comment on column fta.recreation_fee.fee_id is 'The unique identifier for a Recreation fee.';

comment on column fta.recreation_fee.forest_file_id is 'File identification assigned to Provincial Forest Use files. Assigned file number. Usually the Licence, Tenure or Private Mark number.';

comment on column fta.recreation_fee.fee_amount is 'The fee amount for a given recreation fee type.';

comment on column fta.recreation_fee.fee_start_date is 'Identifies the start date for the given fee type.';

comment on column fta.recreation_fee.fee_end_date is 'Identifies the end date for the given fee type.';

comment on column fta.recreation_fee.monday_ind is 'Identifies if fees are applicable for the day of Monday in the given date range.';

comment on column fta.recreation_fee.tuesday_ind is 'Identifies if fees are applicable for the day of Tuesday in the given date range.';

comment on column fta.recreation_fee.wednesday_ind is 'Identifies if fees are applicable for the day of Wednesday in the given date range.';

comment on column fta.recreation_fee.thursday_ind is 'Identifies if fees are applicable for the day of Thursday in the given date range.';

comment on column fta.recreation_fee.friday_ind is 'Identifies if fees are applicable for the day of Friday in the given date range.';

comment on column fta.recreation_fee.saturday_ind is 'Identifies if fees are applicable for the day of Saturday in the given date range.';

comment on column fta.recreation_fee.sunday_ind is 'Identifies if fees are applicable for the day of Sunday in the given date range.';

comment on column fta.recreation_fee.recreation_fee_code is 'Code describing the Recreation Fee.';

comment on column fta.recreation_fee.revision_count is 'A count of the number of times an entry in the entity has been modified. Used to validate if the current information displayed on a user"s web browser is the most current.';

comment on column fta.recreation_fee.entry_userid is 'The userid responsible for inserting data into a table.';

comment on column fta.recreation_fee.entry_timestamp is 'Contains the system timestamp when data in a table was inserted.';

comment on column fta.recreation_fee.update_userid is 'The userid of the individual who last updated this road section record.';

comment on column fta.recreation_fee.update_timestamp is 'The timestamp of the last update to the road section record.';

create table fta.recreation_file_status_code (
    recreation_file_status_code varchar(3) primary key,
    description varchar(120),
    effective_date date,
    expiry_date date,
    update_timestamp timestamp
);

comment on table fta.recreation_file_status_code is 'Codes describing the status of a recreation file.';

comment on column fta.recreation_file_status_code.recreation_file_status_code is 'Code describing the Status of a Recreation File';

comment on column fta.recreation_file_status_code.description is 'Description of the code value';

comment on column fta.recreation_file_status_code.effective_date is 'Date the code becomes effective';

comment on column fta.recreation_file_status_code.expiry_date is 'Date the code expires';

comment on column fta.recreation_file_status_code.update_timestamp is 'The date and time the value was last modified';

create table fta.recreation_file_type_code (
    recreation_file_type_code varchar(3) primary key,
    description varchar(120),
    effective_date date,
    expiry_date date,
    update_timestamp date
);

comment on table fta.recreation_file_type_code is 'Describes the RECREATION FILE TYPE CODE for categorizing recreation files.';

-- There were no descriptions for the columns in the original RECREATION_FILE_TYPE_CODE table
create table fta.recreation_inspection_report (
    inspection_id numeric primary key,
    forest_file_id varchar(10),
    site_occupancy_code varchar(10),
    rec_file_type_code varchar(10),
    site_name varchar(50),
    location varchar(100),
    inspected_by varchar(30),
    campsite_no numeric,
    occupied_campsite_no numeric,
    vehicle_no numeric,
    camping_party_no numeric,
    day_use_party_no numeric,
    with_pass_no numeric,
    without_pass_no numeric,
    absent_owner_no numeric,
    total_inspected_no numeric,
    purchased_pass_no numeric,
    refused_pass_no numeric,
    contract_id varchar(20),
    contractor varchar(30),
    rec_project_skey numeric,
    entry_userid varchar(30) default null,
    entry_timestamp timestamp default current_timestamp,
    update_userid varchar(30) default null,
    update_timestamp timestamp default current_timestamp
);

comment on table fta.recreation_inspection_report is 'Contains the reports for inspections related to recreation projects.';

-- There were no descriptions for the columns in the original RECREATION_INSPECTION_REPORT table
create table fta.recreation_maintain_std_code (
    recreation_maintain_std_code varchar(1) primary key,
    description varchar(120),
    effective_date date,
    expiry_date date,
    update_timestamp timestamp
);

comment on table fta.recreation_maintain_std_code is 'Codes describing the maintenance standards for recreation projects.';

comment on column fta.recreation_maintain_std_code.recreation_maintain_std_code is 'Code describing the Maintenance Standard of a given site. E.g. User Maintained, Maintained to Standard, Not Maintained.';

comment on column fta.recreation_maintain_std_code.description is 'Description of the code value';

comment on column fta.recreation_maintain_std_code.effective_date is 'Date the code becomes effective';

comment on column fta.recreation_maintain_std_code.expiry_date is 'Date the code expires';

comment on column fta.recreation_maintain_std_code.update_timestamp is 'The date and time the value was last modified';

create table fta.recreation_map_feature_code (
    recreation_map_feature_code varchar(3) primary key,
    description varchar(120),
    effective_date date,
    expiry_date date,
    update_timestamp timestamp
);

comment on table fta.recreation_map_feature_code is 'Codes describing types of map features within a recreation project.';

comment on column fta.recreation_map_feature_code.recreation_map_feature_code is 'Identifies the RECREATION MAP FEATURE TYPE CODE.';

comment on column fta.recreation_map_feature_code.description is 'Description of the code value.';

comment on column fta.recreation_map_feature_code.effective_date is 'Date the code becomes effective.';

comment on column fta.recreation_map_feature_code.expiry_date is 'Date the code expires.';

comment on column fta.recreation_map_feature_code.update_timestamp is 'The date and time the value was last modified.';

create table fta.recreation_map_feature_geom (
    rmf_skey serial primary key,
    map_feature_id int,
    geometry_type_code varchar(4),
    geometry geometry,
    feature_area numeric(11, 4),
    feature_length numeric(11, 4),
    feature_perimeter numeric(11, 4),
    revision_count int,
    entry_userid varchar(30),
    entry_timestamp timestamp,
    update_userid varchar(30),
    update_timestamp timestamp
);

comment on table fta.recreation_map_feature_geom is 'Captures amendments to spatial geometry for recreation applications received via the electronic submission process.';

comment on column fta.recreation_map_feature_geom.rmf_skey is 'The SKEY for the RECREATION MAP FEATURE.';

comment on column fta.recreation_map_feature_geom.map_feature_id is 'A unique identifier to a version of a map object. This is very similar to the feature ID in INCOSADA except it was universally unique. If a new version of a cut block came in it would be assigned a new identifier.';

comment on column fta.recreation_map_feature_geom.geometry_type_code is 'Identifies linear or polygonal geometry types for a tenure application feature.';

comment on column fta.recreation_map_feature_geom.geometry is 'The geometry for this feature.';

comment on column fta.recreation_map_feature_geom.feature_area is 'Spatial feature area in hectares. This value is calculated.';

comment on column fta.recreation_map_feature_geom.feature_length is 'Spatial feature length in kilometres. This value is calculated.';

comment on column fta.recreation_map_feature_geom.feature_perimeter is 'Spatial feature perimeter in kilometres. This value is calculated.';

comment on column fta.recreation_map_feature_geom.revision_count is 'A count of the number of times an entry in the entity has been modified. Used to validate if the current information displayed on a user''s web browser is the most current.';

comment on column fta.recreation_map_feature_geom.entry_userid is 'The userid responsible for inserting data into a table.';

comment on column fta.recreation_map_feature_geom.entry_timestamp is 'Contains the system timestamp when data in a table was inserted.';

comment on column fta.recreation_map_feature_geom.update_userid is 'The userid of the individual who last updated this road section record.';

comment on column fta.recreation_map_feature_geom.update_timestamp is 'The timestamp of the last update to the road section record.';

create table fta.recreation_map_feature_xguid (rmf_guid bytea primary key, rmf_skey int);

comment on table fta.recreation_map_feature_xguid is 'Global unique identifier for map features related to recreation projects.';

-- There were no descriptions for the columns in the original RECREATION_MAP_FEATURE_XGUID table
create table fta.recreation_map_feature (
    rmf_skey integer primary key,
    forest_file_id varchar(10),
    section_id varchar(30) null,
    amendment_id integer,
    amend_status_code varchar(3),
    recreation_map_feature_code varchar(3),
    current_ind varchar(1),
    amend_status_date date,
    retirement_date date null,
    revision_count integer,
    entry_userid varchar(30),
    entry_timestamp date,
    update_userid varchar(30),
    update_timestamp date,
    recreation_map_feature_guid uuid default gen_random_uuid ()
);

comment on table fta.recreation_map_feature is 'Captures both current and historical attributes for Recreation Map Features.';

comment on column fta.recreation_map_feature.rmf_skey is 'The SKEY for the RECREATION MAP FEATURE.';

comment on column fta.recreation_map_feature.forest_file_id is 'File identification assigned to Provincial Forest Use files. Assigned file number. Usually the Licence, Tenure or Private Mark number.';

comment on column fta.recreation_map_feature.section_id is 'The section id for the RECREATION MAP FEATURE.';

comment on column fta.recreation_map_feature.amendment_id is 'The amendment id for the RECREATION MAP FEATURE.';

comment on column fta.recreation_map_feature.amend_status_code is 'Code to indicate status of amendment, that is, pending, approved or disallowed. This references Timber_Status_Code.';

comment on column fta.recreation_map_feature.recreation_map_feature_code is 'Identifies the RECREATION MAP FEATURE TYPE CODE.';

comment on column fta.recreation_map_feature.current_ind is 'Indicates the current version of the record for this entity.';

comment on column fta.recreation_map_feature.amend_status_date is 'The date the amendment status was changed.';

comment on column fta.recreation_map_feature.retirement_date is 'The date the entry is retired.';

comment on column fta.recreation_map_feature.revision_count is 'A count of the number of times an entry in the entity has been modified. Used to validate if the current information displayed on a user''s web browser is the most current.';

comment on column fta.recreation_map_feature.entry_userid is 'The userid responsible for inserting data into a table.';

comment on column fta.recreation_map_feature.entry_timestamp is 'Contains the system timestamp when data in a table was inserted.';

comment on column fta.recreation_map_feature.update_userid is 'The userid of the individual who last updated this road section record.';

comment on column fta.recreation_map_feature.update_timestamp is 'The timestamp of the last update to the road section record.';

comment on column fta.recreation_map_feature.recreation_map_feature_guid is 'Global Unique Identifier generated by the system for new records. It was added for FTA 5.';

create table fta.recreation_objective (
    objective_id serial primary key,
    forest_file_id varchar(10) not null,
    objective_description varchar(2000),
    objective_established_date date,
    objective_amended_date date,
    objective_cancelled_date date,
    revision_count integer default 0,
    entry_userid varchar(30),
    entry_timestamp timestamp default current_timestamp,
    update_userid varchar(30),
    update_timestamp timestamp default current_timestamp
);

comment on table fta.recreation_objective is 'The objectives pertaining to a recreation project.';

comment on column fta.recreation_objective.objective_id is 'The unique identifier for a recreation objective.';

comment on column fta.recreation_objective.forest_file_id is 'File identification assigned to Provincial Forest Use files. Assigned file number. Usually the Licence, Tenure or Private Mark number.';

comment on column fta.recreation_objective.objective_description is 'The description of the objective.';

comment on column fta.recreation_objective.objective_established_date is 'The date an objective was established.';

comment on column fta.recreation_objective.objective_amended_date is 'The date an objective was amended.';

comment on column fta.recreation_objective.objective_cancelled_date is 'The date an objective was cancelled.';

comment on column fta.recreation_objective.revision_count is 'A count of the number of times an entry in the entity has been modified. Used to validate if the current information displayed on a user''s web browser is the most current.';

comment on column fta.recreation_objective.entry_userid is 'The userid responsible for inserting data into a table.';

comment on column fta.recreation_objective.entry_timestamp is 'Contains the system timestamp when data in a table was inserted.';

comment on column fta.recreation_objective.update_userid is 'The userid of the individual who last updated this road section record.';

comment on column fta.recreation_objective.update_timestamp is 'The timestamp of the last update to the road section record.';

create table fta.recreation_occupancy_code (
    recreation_occupancy_code varchar(10) primary key,
    description varchar(120),
    effective_date date,
    expiry_date date,
    update_timestamp timestamp default current_timestamp
);

comment on table fta.recreation_occupancy_code is 'Codes describing the occupancy of recreation projects.';

-- There were no descriptions for the columns in the original RECREATION_OCCUPANCY_CODE table
create table fta.recreation_plan (
    forest_file_id varchar(10),
    rec_project_skey int,
    plan_type_code char(1),
    remarks varchar(254),
    primary key (forest_file_id, rec_project_skey, plan_type_code)
);

comment on table fta.recreation_plan is 'Plans and details related to recreation projects.';

-- There were no descriptions for the columns in the original RECREATION_PLAN table
create table fta.recreation_remed_repair_code (
    recreation_remed_repair_code varchar(2) primary key,
    description varchar(120),
    effective_date date,
    expiry_date date,
    update_timestamp timestamp
);

comment on table fta.recreation_remed_repair_code is 'Codes describing types of remedial repairs for recreation structures.';

comment on column fta.recreation_remed_repair_code.recreation_remed_repair_code is 'Indicates the type of remedial repair applicable to the defined campsite.';

comment on column fta.recreation_remed_repair_code.description is 'Description of the code value';

comment on column fta.recreation_remed_repair_code.effective_date is 'Date the code becomes effective';

comment on column fta.recreation_remed_repair_code.expiry_date is 'Date the code expires';

comment on column fta.recreation_remed_repair_code.update_timestamp is 'The date and time the value was last modified.';

create table fta.recreation_risk_evaluation (
    risk_evaluation_id bigint primary key,
    recreation_user_days_code varchar(10),
    recreation_occupancy_code varchar(10),
    entry_timestamp timestamp default current_timestamp,
    entry_userid varchar(30),
    update_timestamp timestamp default current_timestamp,
    update_userid varchar(30)
);

comment on table fta.recreation_risk_evaluation is 'Evaluation of risks associated with recreation projects.';

-- There were no descriptions for the columns in the original RECREATION_RISK_EVALUATION table
create table fta.recreation_risk_rating_code (
    recreation_risk_rating_code varchar(3) primary key,
    description varchar(120),
    effective_date date,
    expiry_date date,
    update_timestamp timestamp default current_timestamp
);

comment on table fta.recreation_risk_rating_code is 'Codes describing the Recreation Risk Rating for a project.';

comment on column fta.recreation_risk_rating_code.recreation_risk_rating_code is 'Code describing the Recreation Risk Rating.';

comment on column fta.recreation_risk_rating_code.description is 'Description of the code value';

comment on column fta.recreation_risk_rating_code.effective_date is 'Date the code becomes effective';

comment on column fta.recreation_risk_rating_code.expiry_date is 'Date the code expires';

comment on column fta.recreation_risk_rating_code.update_timestamp is 'The date and time the value was last modified.';

create table fta.recreation_risk_site (
    risk_site_id serial primary key,
    forest_file_id varchar(10),
    entry_timestamp date,
    entry_userid varchar(30),
    update_timestamp date,
    update_userid varchar(30)
);

comment on table fta.recreation_risk_site is 'Sites that have been identified as having specific risks within a recreation project.';

-- There were no descriptions for the columns in the original RECREATION_RISK_SITE table
create table fta.recreation_search_result (
    forest_file_id varchar(10) null,
    org_unit_code varchar(6) null,
    org_unit_name varchar(100) null,
    file_status_code varchar(3) null,
    project_name varchar(100) null,
    project_type varchar(240) null,
    recreation_project_code varchar(3) null,
    recreation_project_code_desc varchar(120) null
);

comment on table fta.recreation_search_result is 'The global temp table used to facilitate Recreation Searches.';

-- There were no descriptions for the columns in the original RECREATION_SEARCH_RESULT table
create table fta.recreation_site (
    forest_file_id varchar(10) primary key,
    rec_site_name varchar(50) null
);

comment on table fta.recreation_site is 'Stores information about recreation sites.';

-- There were no descriptions for the columns in the original RECREATION_SITE table
create table fta.recreation_site_point (
    forest_file_id varchar(10) primary key,
    geometry geometry,
    revision_count integer,
    entry_userid varchar(30),
    entry_timestamp timestamp,
    update_userid varchar(30),
    update_timestamp timestamp
);

comment on table fta.recreation_site_point is 'Stores the location of a Recreation Site as an oracle locator point. The data is used to provide the public a map location of the Recreation Site.';

comment on column fta.recreation_site_point.forest_file_id is 'File identification assigned to Provincial Forest Use files. Assigned file number. Usually the Licence, Tenure or Private Mark number.';

comment on column fta.recreation_site_point.geometry is 'A point geometry location represented by a single X,Y pair';

comment on column fta.recreation_site_point.revision_count is 'A count of the number of times an entry in the entity has been modified. Used to validate if the current information displayed on a user"s web browser is the most current.';

comment on column fta.recreation_site_point.entry_userid is 'The userid of the user that inserted data into the record.';

comment on column fta.recreation_site_point.entry_timestamp is 'Timestamp indicating when data was last inserted into the record.';

comment on column fta.recreation_site_point.update_userid is 'The userid of the user that last updated the declared area record.';

comment on column fta.recreation_site_point.update_timestamp is 'The timestamp of the last update to the declared area record.';

create table fta.recreation_struct_dimen_code (
    recreation_struct_dimen_code varchar(2) primary key,
    description varchar(120) null,
    effective_date date null,
    expiry_date date null,
    update_timestamp date null
);

comment on table fta.recreation_struct_dimen_code is 'Codes describing the dimensions of recreation structures (e.g., Length, Area).';

comment on column fta.recreation_struct_dimen_code.recreation_struct_dimen_code is 'Code describing the unit of measure for a Recreation Structure. (e.g. Length or Area)';

comment on column fta.recreation_struct_dimen_code.description is 'Description of the code value';

comment on column fta.recreation_struct_dimen_code.effective_date is 'Date the code becomes effective';

comment on column fta.recreation_struct_dimen_code.expiry_date is 'Date the code expires';

comment on column fta.recreation_struct_dimen_code.update_timestamp is 'The date and time the value was last modified.';

create table fta.recreation_struct_dimen_xref (
    recreation_structure_code varchar(3),
    recreation_struct_dimen_code varchar(2),
    revision_count int null,
    entry_userid varchar(30) null,
    entry_timestamp timestamp null,
    update_userid varchar(30) null,
    update_timestamp timestamp null,
    primary key (
        recreation_structure_code,
        recreation_struct_dimen_code
    )
);

comment on table fta.recreation_struct_dimen_xref is 'Describes the applicable dimensions for the given structure type. E.g., Paths may have count and length, docks may have length and area.';

comment on column fta.recreation_struct_dimen_xref.recreation_structure_code is 'Indicates the type of structure (man-made improvement).';

comment on column fta.recreation_struct_dimen_xref.recreation_struct_dimen_code is 'Code describing the unit of measure for a Recreation Structure. (e.g. Length or Area)';

comment on column fta.recreation_struct_dimen_xref.revision_count is 'A count of the number of times an entry in the entity has been modified. Used to validate if the current information displayed on a user''s web browser is the most current.';

comment on column fta.recreation_struct_dimen_xref.entry_userid is 'The userid responsible for inserting data into a table.';

comment on column fta.recreation_struct_dimen_xref.entry_timestamp is 'Contains the system timestamp when data in a table was inserted.';

comment on column fta.recreation_struct_dimen_xref.update_userid is 'The userid of the individual who last updated this road section record.';

comment on column fta.recreation_struct_dimen_xref.update_timestamp is 'The timestamp of the last update to the road section record.';

create table fta.recreation_structure_code (
    recreation_structure_code varchar(3) primary key,
    description varchar(120),
    effective_date date,
    expiry_date date,
    update_timestamp date
);

comment on table fta.recreation_structure_code is 'Codes describing the type of structure (man-made improvement) within a recreation project.';

comment on column fta.recreation_structure_code.recreation_structure_code is 'Indicates the type of structure (man-made improvement).';

comment on column fta.recreation_structure_code.description is 'Description of the code value.';

comment on column fta.recreation_structure_code.effective_date is 'Date the code becomes effective.';

comment on column fta.recreation_structure_code.expiry_date is 'Date the code expires.';

comment on column fta.recreation_structure_code.update_timestamp is 'The date and time the value was last modified.';

create table fta.recreation_structure (
    structure_id numeric(10) primary key,
    forest_file_id varchar(10) not null references fta.recreation_project (forest_file_id) on delete restrict,
    campsite_forest_file_id varchar(10) null,
    campsite_number numeric(3) null,
    recreation_structure_code varchar(3) null references fta.recreation_structure_code (recreation_structure_code) on delete restrict,
    structure_name varchar(100),
    structure_count numeric(3),
    structure_length numeric(7, 1),
    structure_width numeric(7, 1),
    structure_area numeric(7, 1),
    actual_value numeric(7, 2),
    recreation_remed_repair_code varchar(2) null references fta.recreation_remed_repair_code (recreation_remed_repair_code) on delete restrict,
    estimated_repair_cost numeric(10, 2),
    repair_completed_date date,
    revision_count numeric(5),
    entry_userid varchar(30),
    entry_timestamp timestamp default current_timestamp,
    update_userid varchar(30),
    update_timestamp timestamp default current_timestamp
);

comment on table fta.recreation_structure is 'Information relating to a recreation site improvement in a recreational tenure. All improvements are man-made.';

comment on column fta.recreation_structure.structure_id is 'The unique identifier for the structure.';

comment on column fta.recreation_structure.forest_file_id is 'File identification assigned to Provincial Forest Use files. Assigned file number. Usually the Licence, Tenure or Private Mark number.';

comment on column fta.recreation_structure.campsite_forest_file_id is 'File identification assigned to Provincial Forest Use files. Assigned file number. Usually the Licence, Tenure or Private Mark number.';

comment on column fta.recreation_structure.recreation_structure_code is 'Indicates the type of structure (man-made improvement).';

comment on column fta.recreation_structure.structure_name is 'The name of the structure.';

comment on column fta.recreation_structure.structure_count is 'The number of structures for a given project''s structure type.';

comment on column fta.recreation_structure.structure_length is 'Total length in metres for length-based structure types. (E.g. paths).';

comment on column fta.recreation_structure.structure_width is 'Total width in metres for width-based structure types. (E.g. parking lots).';

comment on column fta.recreation_structure.structure_area is 'Total area in square metres for area-based structure types. This will be applicable to only certain structures. E.g. Shelter.';

comment on column fta.recreation_structure.actual_value is 'The actual value of the recreation structure. This value takes precedence over the structure type value.';

comment on column fta.recreation_structure.campsite_number is 'The number assigned to a defined campsite by Recreation staff.';

comment on column fta.recreation_structure.recreation_remed_repair_code is 'Indicates the type of remedial repair applicable to the defined campsite.';

comment on column fta.recreation_structure.estimated_repair_cost is 'The estimated repair cost for the structure.';

comment on column fta.recreation_structure.repair_completed_date is 'The date on which the structure repair was completed.';

comment on column fta.recreation_structure.revision_count is 'A count of the number of times an entry in the entity has been modified. Used to validate if the current information displayed on a user''s web browser is the most current.';

comment on column fta.recreation_structure.entry_userid is 'The userid responsible for inserting data into a table.';

comment on column fta.recreation_structure.update_userid is 'The userid of the individual who last updated this road section record.';

comment on column fta.recreation_structure.update_timestamp is 'The timestamp of the last update to the road section record.';

comment on column fta.recreation_structure.entry_timestamp is 'Contains the system timestamp when data in a table was inserted.';

create table fta.recreation_structure_value (
    recreation_structure_code varchar(3) not null,
    structure_value numeric(7, 2),
    dimension varchar(1) default 'U',
    revision_count numeric(5),
    entry_userid varchar(30),
    entry_timestamp date,
    update_userid varchar(30),
    update_timestamp date,
    primary key (recreation_structure_code)
);

comment on table fta.recreation_structure_value is 'Identifies the value and dimension for a given structure. E.g., Barrel Shelters, 300/u, or Boardwalks, $50/m.';

comment on column fta.recreation_structure_value.recreation_structure_code is 'Indicates the type of structure (man-made improvement).';

comment on column fta.recreation_structure_value.structure_value is 'Identifies the value for a given structure.';

comment on column fta.recreation_structure_value.dimension is 'Identifies the dimension for the given structure value. E.g. Unit, or Metres.';

comment on column fta.recreation_structure_value.revision_count is 'A count of the number of times an entry in the entity has been modified. Used to validate if the current information displayed on a user''s web browser is the most current.';

comment on column fta.recreation_structure_value.entry_userid is 'The userid responsible for inserting data into a table.';

comment on column fta.recreation_structure_value.entry_timestamp is 'Contains the system timestamp when data in a table was inserted.';

comment on column fta.recreation_structure_value.update_userid is 'The userid of the individual who last updated this road section record.';

comment on column fta.recreation_structure_value.update_timestamp is 'The timestamp of the last update to the road section record.';

create table fta.recreation_sub_access_code (
    recreation_sub_access_code varchar(3) primary key,
    description varchar(120),
    effective_date date,
    expiry_date date,
    update_timestamp timestamp
);

comment on table fta.recreation_sub_access_code is 'Codes describing the Recreation Sub Access types within a project.';

comment on column fta.recreation_sub_access_code.recreation_sub_access_code is 'Code describing the Recreation Sub Access types.';

comment on column fta.recreation_sub_access_code.description is 'Description of the code value.';

comment on column fta.recreation_sub_access_code.effective_date is 'Date the code becomes effective';

comment on column fta.recreation_sub_access_code.expiry_date is 'Date the code expires';

comment on column fta.recreation_sub_access_code.update_timestamp is 'The date and time the value was last modified.';

create table fta.recreation_trail_segment (
    forest_file_id varchar(10) not null,
    recreation_trail_seg_id serial not null,
    trail_segment_name varchar(50),
    start_station numeric(11, 4),
    end_station numeric(11, 4),
    recreation_remed_repair_code varchar(2),
    estimated_repair_cost numeric(10, 2),
    actual_repair_cost numeric(10, 2),
    repair_completed_date date,
    wheelchair_accessible_ind char(1),
    revision_count integer,
    entry_userid varchar(30),
    entry_timestamp timestamp,
    update_userid varchar(30),
    update_timestamp timestamp,
    primary key (forest_file_id, recreation_trail_seg_id),
    unique (forest_file_id, trail_segment_name)
);

comment on table fta.recreation_trail_segment is 'Stores coordinate and repair information for trail segments in a Recreation project. May also store coordinate and repair information for a project trail.';

comment on column fta.recreation_trail_segment.forest_file_id is 'File identification assigned to Provincial Forest Use files. Assigned file number. Usually the Licence, Tenure or Private Mark number.';

comment on column fta.recreation_trail_segment.recreation_trail_seg_id is 'A system-generated unique identifier for the trail.';

comment on column fta.recreation_trail_segment.trail_segment_name is 'The user-entered name specified for the trail segment.';

comment on column fta.recreation_trail_segment.start_station is 'The start station of the trail segment. Identified in the field by the user-entered name given to the trail segment. START_STATION is measured in meters from the start of the trail.';

comment on column fta.recreation_trail_segment.end_station is 'The end station of the trail segment. END_STATION is measured in meters from the start of the trail. The END_STATION of a trail segment must be greater than the START_STATION of the trail segment.';

comment on column fta.recreation_trail_segment.recreation_remed_repair_code is 'Indicates the type of remedial repair applicable to the defined campsite.';

comment on column fta.recreation_trail_segment.estimated_repair_cost is 'The estimated repair cost for the trail.';

comment on column fta.recreation_trail_segment.actual_repair_cost is 'The actual repair cost of the trail or trail segment.';

comment on column fta.recreation_trail_segment.repair_completed_date is 'The date on which the trail repair was completed.';

comment on column fta.recreation_trail_segment.wheelchair_accessible_ind is 'Indicates when the trail is wheelchair accessible (Y, N or NULL).';

comment on column fta.recreation_trail_segment.revision_count is 'A count of the number of times an entry in the entity has been modified. Used to validate if the current information displayed on a user''s web browser is the most current.';

comment on column fta.recreation_trail_segment.entry_userid is 'The userid of the user that inserted data into the record.';

comment on column fta.recreation_trail_segment.entry_timestamp is 'Timestamp indicating when data was last inserted into the record.';

comment on column fta.recreation_trail_segment.update_userid is 'The userid of the user that last updated the declared area record.';

comment on column fta.recreation_trail_segment.update_timestamp is 'The timestamp of the last update to the declared area record.';

create table fta.recreation_user_days_code (
    recreation_user_days_code varchar(10) not null primary key,
    description varchar(120),
    effective_date date,
    expiry_date date,
    update_timestamp timestamp
);

comment on table fta.recreation_user_days_code is 'Codes describing the Recreation User Days associated with a project.';

comment on column fta.recreation_user_days_code.recreation_user_days_code is 'Code describing the Recreation User Days.';

comment on column fta.recreation_user_days_code.description is 'Description of the code value';

comment on column fta.recreation_user_days_code.effective_date is 'Date the code becomes effective';

comment on column fta.recreation_user_days_code.expiry_date is 'Date the code expires';

comment on column fta.recreation_user_days_code.update_timestamp is 'The date and time the value was last modified.';
