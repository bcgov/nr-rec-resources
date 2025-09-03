create table if not exists rst.recreation_resource_reservation_info (
    rec_resource_id varchar(10) primary key references rst.recreation_resource(rec_resource_id),
    reservation_instructions varchar(200),
    reservation_website varchar(200),
    reservation_phone_number varchar(50),
    reservation_email varchar(100),
    reservation_comments varchar(400)
);

comment on table rst.recreation_resource_reservation_info is 'Identifies the reservation information on the specific recreation resource.';

comment on column rst.recreation_resource_reservation_info.rec_resource_id is 'File identification assigned to Provincial Forest Use files. Assigned file number. Usually the Licence, Tenure or Private Mark number.';

comment on column rst.recreation_resource_reservation_info.reservation_instructions is 'Reservation website instructions.';

comment on column rst.recreation_resource_reservation_info.reservation_website is 'Reservation website if availiable.';

comment on column rst.recreation_resource_reservation_info.reservation_phone_number is 'Reservation phone number if availiable.';

comment on column rst.recreation_resource_reservation_info.reservation_email is 'Reservation email if availiable.';

comment on column rst.recreation_resource_reservation_info.reservation_comments is 'Reservation comments if availiable.';

select upsert_timestamp_columns('rst', 'recreation_resource_reservation_info');

select setup_temporal_table('rst', 'recreation_resource_reservation_info');

DO $$
BEGIN
    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC97717','All reservations through partner, not RSTBC','https://accwhistler.ca/WendyThompson.html',null,null,null);
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC0078','All reservations through partner, not RSTBC','http://www.westharrisonreservations.com/',null,null,null);
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC0019','All reservations through partner, not RSTBC','https://campchilliwackvalley.ca/',null,null,null);
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC0066','All reservations through partner, not RSTBC','http://www.harrisoneastcamping.com/',null,null,null);
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC0011','All reservations through partner, not RSTBC','https://firesidecamping.ca/',null,null,null);
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC0087','All reservations through partner, not RSTBC','http://www.harrisoneastcamping.com/',null,null,null);
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC0065','All reservations through partner, not RSTBC','http://www.westharrisonreservations.com/',null,null,null);
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC3032','All reservations through partner, not RSTBC','https://firesidecamping.ca/',null,null,null);
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC3113','All reservations through partner, not RSTBC','http://www.harrisoneastcamping.com/',null,null,null);
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC136016','All reservations through partner, not RSTBC','http://www.westharrisonreservations.com/',null,null,null);
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC257447','All reservations through partner, not RSTBC','https://stavewestcamping.com/',null,null,null);
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC0024','All reservations through partner, not RSTBC','https://firesidecamping.ca/',null,null,null);
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC0013','All reservations through partner, not RSTBC','https://campchilliwackvalley.ca/',null,null,null);
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC257445','All reservations through partner, not RSTBC','https://stavewestcamping.com/',null,null,null);
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC257450','All reservations through partner, not RSTBC','https://stavewestcamping.com/',null,null,null);
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC3258','All reservations through partner, not RSTBC','https://stavewestcamping.com/',null,null,null);
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC0002','All reservations through partner, not RSTBC','https://firesidecamping.ca/',null,null,'There are 2 parts to this site: Tamihi East is first come-first-served and Tamihi West is reservable as it is operated by a different group');
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC3038','All reservations through partner, not RSTBC','https://campchilliwackvalley.ca/',null,null,null);
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC0067','All reservations through partner, not RSTBC','http://www.westharrisonreservations.com/',null,null,null);
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC169043','All reservations through partner, not RSTBC','http://www.westharrisonreservations.com/',null,null,null);
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC136018','All reservations through partner, not RSTBC','http://www.westharrisonreservations.com/',null,null,null);
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC0073','All reservations through partner, not RSTBC','http://www.westharrisonreservations.com/',null,null,null);
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC0159','All reservations through partner, not RSTBC','http://www.vicamping.com/',null,null,null);
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC16077','All reservations through partner, not RSTBC',null,null,'KeoghLake@gmail.com',null);
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC0188','All reservations through partner, not RSTBC','http://www.vicamping.com/',null,null,null);
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC261703','All reservations through partner, not RSTBC','http://www.vicamping.com/',null,null,null);
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC5114','All reservations through partner, not RSTBC','https://kootenaymountaineeringclub.ca/huts/the-copper-mountain-cabin/',null,null,null);
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC5111','All reservations through partner, not RSTBC','https://kootenaymountaineeringclub.ca/huts/the-grassy-hut/',null,null,null);
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC5036','All reservations through partner, not RSTBC','https://kootenaymountaineeringclub.ca/huts/the-huckleberry-hut/',null,null,null);
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC204739','All reservations through partner, not RSTBC','https://kootenaymountaineeringclub.ca/huts/the-steed-hut/',null,null,null);
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC6879','All reservations through partner, not RSTBC','https://cvhsinfo.org/david-white-hut/',null,null,'known on the partner site Dave White Hut - not cabin, we have in FTA as David White Cabin REC6879');
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC5217','All reservations through partner, not RSTBC','https://cvhsinfo.org/kingsbury-hut/',null,null,null);
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC2272','All reservations through partner, not RSTBC','https://cvhsinfo.org/jumbo-pass-hut/',null,null,null);
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC5214','All reservations through partner, not RSTBC','https://cvhsinfo.org/mcmurdo-cabin/',null,null,null);
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC6072','All reservations through partner, not RSTBC','https://cvhsinfo.org/olive-hut/',null,null,null);
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC6588','All reservations through partner, not RSTBC',null,'(250)427-5388',null,null);
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC33127','All reservations through partner, not RSTBC','http://fernietrails.com/tunnel-creek-hut/',null,null,'membership required to reserve');
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC0237','All reservations through partner, not RSTBC','https://pembertonwildlifeassociation.com/services/tenquille-lake-cabin/',null,null,null);
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC247285','All reservations through partner, not RSTBC','https://recsites.bcmc.ca/index.php/reservations/watersprite-lake-campground',null,null,null);
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC268148','All reservations through partner, not RSTBC','https://accvi.ca/5040-peak-hut/bookthehut/',null,null,'Partner is Alpine Club of Canada Vancouver Island Section');
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC268157','All reservations through partner, not RSTBC','https://accvi.ca/5040-peak-hut/bookthehut/',null,null,'Partner is Alpine Club of Canada Vancouver Island Section');
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC0268','All reservations through partner, not RSTBC','http://www.vicamping.com/',null,null,null);
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC0123','All reservations through partner, not RSTBC','https://www.officialhomesitecreekcampground.ca/',null,null,null);
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC0269','All reservations through partner, not RSTBC','http://www.vicamping.com/',null,null,null);
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC0206','All reservations through partner, not RSTBC','http://www.vicamping.com/',null,null,null);
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC0211','All reservations through partner, not RSTBC','https://nixoncreekcampground.ca/',null,null,null);
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC0205','All reservations through partner, not RSTBC','http://www.vicamping.com/',null,null,null);
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC0140','All reservations through partner, not RSTBC','http://www.westcoastcamping.ca/',null,null,null);
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC3128','All reservations through partner, not RSTBC',null,null,'info@westcoastcamping.ca',null);
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;

    BEGIN
        INSERT INTO rst.recreation_resource_reservation_info
            (rec_resource_id, reservation_instructions, reservation_website,
             reservation_phone_number, reservation_email, reservation_comments)
        VALUES ('REC1110','All reservations through partner, not RSTBC',null,'1-250-944-0701',null,null);
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Skipped row due to missing foreign key';
    END;
END $$;
