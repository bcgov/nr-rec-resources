SELECT
  rr.rec_resource_id,
  rr.recreation_resource_type AS rec_resource_type_code,
  rrtc.description
FROM
  (
    recreation_resource rr
    LEFT JOIN recreation_resource_type_code rrtc ON (
      (
        (rr.recreation_resource_type) :: text = (rrtc.rec_resource_type_code) :: text
      )
    )
  );
