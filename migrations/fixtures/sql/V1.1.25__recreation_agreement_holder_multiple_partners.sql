-- Migrations run before fixtures, so the V1.1.88 backfill saw an empty table and
-- the V1.1.14 rows took the `false` default. Publish them before inserting the
-- extra partners below, which set the flag directly.
update rst.recreation_agreement_holder
set visible_on_public_website = true;

insert into rst.recreation_agreement_holder (
    rec_resource_id,
    client_number,
    agreement_start_date,
    agreement_end_date,
    revision_count,
    visible_on_public_website,
    partner_relationship_type_code
) values
    ('REC204117','00174782','2020-04-01','2030-03-31',1,true,'SITE_OPERATOR'),
    ('REC204117','00033837','2021-06-01','2026-05-31',1,false,'SITE_OPERATOR'),
    ('REC1222','00144891','2022-01-01','2027-12-31',2,false,'SITE_OPERATOR'),
    ('REC2094','00146387','2023-04-01','2028-03-31',1,true,'SITE_OPERATOR');
