SELECT
  rr.rec_resource_id,
  CASE
    WHEN (
      (rr.display_on_public_site = TRUE)
      AND ((rr.recreation_resource_type) :: text = 'RR' :: text)
    ) THEN 'SIT' :: character varying
    WHEN (
      (rr.display_on_public_site = TRUE)
      AND (
        (rr.recreation_resource_type) :: text = ANY (
          ARRAY [('RTR'::character varying)::text, ('TBL'::character varying)::text, ('TRB'::character varying)::text]
        )
      )
    ) THEN 'RTE' :: character varying
    WHEN (
      (rr.display_on_public_site = TRUE)
      AND (
        (rr.recreation_resource_type) :: text = 'IFT' :: text
      )
    ) THEN 'IF' :: character varying
    ELSE rr.recreation_resource_type
  END AS rec_resource_type_code,
  CASE
    WHEN (
      (rrtc.rec_resource_type_code) :: text = 'RTE' :: text
    ) THEN 'Recreation trail' :: character varying(200)
    ELSE rrtc.description
  END AS description
FROM
  (
    recreation_resource rr
    LEFT JOIN recreation_resource_type_code rrtc ON (
      (
        (
          CASE
            WHEN (
              (rr.display_on_public_site = TRUE)
              AND ((rr.recreation_resource_type) :: text = 'RR' :: text)
            ) THEN 'SIT' :: character varying
            WHEN (
              (rr.display_on_public_site = TRUE)
              AND (
                (rr.recreation_resource_type) :: text = ANY (
                  ARRAY [('RTR'::character varying)::text, ('TBL'::character varying)::text, ('TRB'::character varying)::text]
                )
              )
            ) THEN 'RTE' :: character varying
            WHEN (
              (rr.display_on_public_site = TRUE)
              AND (
                (rr.recreation_resource_type) :: text = 'IFT' :: text
              )
            ) THEN 'IF' :: character varying
            ELSE rr.recreation_resource_type
          END
        ) :: text = (rrtc.rec_resource_type_code) :: text
      )
    )
  );
