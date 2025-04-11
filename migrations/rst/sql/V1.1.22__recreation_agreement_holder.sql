create table if not exists rst.recreation_agreement_holder (
    rec_resource_id varchar(10) primary key references rst.recreation_resource(rec_resource_id),
    client_number varchar(8),
    agreement_start_date date,
    agreement_end_date date,
    revision_count int
);

comment on table rst.recreation_agreement_holder is 'Identifies the Agreement Holder responsible for maintaining a project for a given time frame.';

comment on column rst.recreation_agreement_holder.rec_resource_id is 'File identification assigned to Provincial Forest Use files. Assigned file number. Usually the Licence, Tenure or Private Mark number.';

comment on column rst.recreation_agreement_holder.client_number is 'Sequentially assigned number to identify a ministry client.';

comment on column rst.recreation_agreement_holder.agreement_start_date is 'Start date of the agreement held between the ministry and the agreement holder.';

comment on column rst.recreation_agreement_holder.agreement_end_date is 'End date of the agreement held between the ministry and the agreement holder.';

comment on column rst.recreation_agreement_holder.revision_count is 'A count of the number of times an entry in the entity has been modified. Used to validate if the current information displayed on a user''s web browser is the most current.';
