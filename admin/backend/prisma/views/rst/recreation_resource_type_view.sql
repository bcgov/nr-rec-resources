SELECT
  rr.rec_resource_id,
  CASE
    WHEN (
      (rr.display_on_public_site = TRUE)
      AND (
        (rmf.recreation_resource_type) :: text = 'RR' :: text
      )
    ) THEN 'SIT' :: character varying
    ELSE rmf.recreation_resource_type
  END AS rec_resource_type_code,
  rrtc.description
FROM
  (
    (
      recreation_resource rr
      LEFT JOIN (
        SELECT
          DISTINCT ON (recreation_map_feature.rec_resource_id) recreation_map_feature.rec_resource_id,
          recreation_map_feature.recreation_resource_type,
          recreation_map_feature.amend_status_date
        FROM
          recreation_map_feature
        ORDER BY
          recreation_map_feature.rec_resource_id,
          recreation_map_feature.amend_status_date DESC
      ) rmf ON (
        (
          (rr.rec_resource_id) :: text = (rmf.rec_resource_id) :: text
        )
      )
    )
    LEFT JOIN recreation_resource_type_code rrtc ON (
      (
        (
          CASE
            WHEN (
              (rr.display_on_public_site = TRUE)
              AND (
                (rmf.recreation_resource_type) :: text = 'RR' :: text
              )
            ) THEN 'SIT' :: character varying
            ELSE rmf.recreation_resource_type
          END
        ) :: text = (rrtc.rec_resource_type_code) :: text
      )
    )
  );