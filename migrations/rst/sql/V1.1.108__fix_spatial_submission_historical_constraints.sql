alter table rst.recreation_spatial_submission
	drop constraint if exists chk_spatial_submission_status;

alter table rst.recreation_spatial_submission
	add constraint chk_spatial_submission_status
		check (status in ('CLR', 'APP', 'REJ', 'RET', 'PND', 'FAI'));

alter table rst.recreation_spatial_submission
	drop constraint if exists chk_spatial_submission_status_business_rules;

alter table rst.recreation_spatial_submission
	add constraint chk_spatial_submission_status_business_rules
		check (
			(status = 'CLR' and decision is null and adjudication_comment is null and adjudication_report_document_uri is null)
			or (status = 'APP' and decision = 'APPROVE')
			or (status = 'REJ' and decision = 'REJECT')
			or (status in ('RET', 'PND', 'FAI'))
		);

alter table rst.recreation_spatial_submission
	drop constraint if exists chk_spatial_submission_adjudication;

alter table rst.recreation_spatial_submission
	add constraint chk_spatial_submission_adjudication
		check (
			(adjudication_ind = true and status in ('APP', 'REJ'))
			or (adjudication_ind = false and status in ('RET', 'PND', 'CLR', 'FAI') and adjudicated_by is null and adjudication_date is null)
		);
