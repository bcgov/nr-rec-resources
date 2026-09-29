-- Cancel one of the two REC204117 partners added in V1.1.25 so the cancelled
-- chip, the one-way guard, and the public-site filter all have data to exercise.
update rst.recreation_agreement_holder
set cancelled = true
where rec_resource_id = 'REC204117'
  and client_number = '00033837';
