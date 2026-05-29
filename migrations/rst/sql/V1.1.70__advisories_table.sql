create table if not exists rst.act_advisories_flat (
    rec_resource_id character varying(20) NOT NULL,
    advisory_number integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    submitted_by character varying(120) NOT NULL,
    access_status_name character varying(100) NOT NULL,
    access_status_grouplabel character varying(50) NOT NULL,
    access_status_description text NULL,
    event_type character varying(100) NOT NULL,
    urgency character varying(25) NOT NULL,
    advisory_status character varying(100) NOT NULL,
    is_reservations_affected boolean NOT NULL,
    is_advisory_date_displayed boolean NOT NULL,
    is_effective_date_displayed boolean NOT NULL,
    is_end_date_displayed boolean NOT NULL,
    is_updated_date_displayed boolean NOT NULL,
    advisory_date timestamptz NOT NULL,
    effective_date timestamptz NOT NULL,
    end_date timestamptz NULL,
    expiry_date timestamptz NULL,
    removal_date timestamptz NULL,
    updated_date timestamptz NOT NULL,
    modified_date timestamptz NOT NULL,
    published_at timestamptz NULL,
    CONSTRAINT act_advisories_flat_rec_resource_id_fkey FOREIGN KEY (rec_resource_id)
        REFERENCES rst.recreation_resource (rec_resource_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

select setup_temporal_table ('rst', 'act_advisories_flat', true);

comment on table rst.act_advisories_flat is 'Flat table containing current and historical advisory information for recreational resources, including details about the advisory, its status, and relevant dates.';
comment on column rst.act_advisories_flat.rec_resource_id is 'Identifier for the recreational resource associated with the advisory.';
comment on column rst.act_advisories_flat.advisory_number is 'Unique number assigned to each advisory for a given resource.';
comment on column rst.act_advisories_flat.title is 'Title of the advisory, summarizing the issue or situation being reported.';
comment on column rst.act_advisories_flat.description is 'Detailed description of the advisory, providing more context about the issue, its impact, and any relevant information for users.';
comment on column rst.act_advisories_flat.submitted_by is 'Name of the individual who submitted the advisory, providing accountability and a point of contact for further information.';
comment on column rst.act_advisories_flat.access_status_name is 'Name of the access status associated with the advisory, indicating the current level of access to the resource (e.g. Open, Closed, Restricted).';
comment on column rst.act_advisories_flat.access_status_grouplabel is 'Group label for the access status, categorizing the status into broader groups (e.g. Open, Closed, Restricted).';
comment on column rst.act_advisories_flat.access_status_description is 'Detailed description of the access status, providing more information about what the status means for users and any specific conditions or restrictions that apply.';
comment on column rst.act_advisories_flat.event_type is 'Type of event that triggered the advisory, such as a natural disaster, maintenance work, or safety concern.';
comment on column rst.act_advisories_flat.urgency is 'Level of urgency associated with the advisory, indicating how quickly users should respond to the information (e.g. Low, Medium, High).';
comment on column rst.act_advisories_flat.advisory_status is 'Current status of the advisory, such as Active, Resolved, or Expired.';
comment on column rst.act_advisories_flat.is_reservations_affected is 'Indicates whether the advisory affects reservations for the resource, providing important information for users planning to visit.';
comment on column rst.act_advisories_flat.is_advisory_date_displayed is 'Indicates whether the advisory date should be displayed to users, allowing for flexibility in how information is presented.';
comment on column rst.act_advisories_flat.is_effective_date_displayed is 'Indicates whether the effective date of the advisory should be displayed to users, providing context about when the advisory takes effect.';
comment on column rst.act_advisories_flat.is_end_date_displayed is 'Indicates whether the end date of the advisory should be displayed to users, providing information about when the advisory is expected to be resolved.';
comment on column rst.act_advisories_flat.is_updated_date_displayed is 'Indicates whether the updated date of the advisory should be displayed to users, allowing for transparency about when information was last modified.';
comment on column rst.act_advisories_flat.advisory_date is 'Date when the advisory was created or submitted, providing a timeline for the advisory.';
comment on column rst.act_advisories_flat.effective_date is 'Date when the advisory takes effect, indicating when users should start following the advisory information.';
comment on column rst.act_advisories_flat.end_date is 'Date when the advisory is expected to end or be resolved, providing users with an expectation for how long the advisory will be in place.';
comment on column rst.act_advisories_flat.expiry_date is 'Date when the advisory expires  and is no longer relevant, allowing for automatic cleanup of outdated advisories.';
comment on column rst.act_advisories_flat.removal_date is 'Date when the advisory should  be removed from the system, providing a timeline for data retention and cleanup.';
comment on column rst.act_advisories_flat.updated_date is 'Date when the advisory was last updated, allowing users to see how current the information is.';
comment on column rst.act_advisories_flat.modified_date is 'Date when the advisory was last modified, providing a record of changes to the advisory information.';
comment on column rst.act_advisories_flat.published_at is 'Date when the advisory was published and made visible to users, indicating when the information became available for public consumption.'; 
