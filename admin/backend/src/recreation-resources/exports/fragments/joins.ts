import { Prisma } from '@generated/prisma';

export function buildSharedJoins(): Prisma.Sql {
  return Prisma.sql`
    LEFT JOIN recreation_resource_type_view_admin rrtva
      ON rrtva.rec_resource_id = rr.rec_resource_id
    LEFT JOIN recreation_status rs
      ON rs.rec_resource_id = rr.rec_resource_id
    LEFT JOIN recreation_status_code rsc
      ON rsc.status_code = rs.status_code
    LEFT JOIN recreation_risk_rating_code rrrc
      ON rrrc.risk_rating_code = rr.risk_rating_code
    LEFT JOIN (
      SELECT
        rmf.rec_resource_id,
        COALESCE(SUM(rmfg.feature_area), 0)::text AS total_area,
        COALESCE(SUM(rmfg.feature_length), 0)::text AS total_length,
        ROUND(
          SUM(
            CASE
              WHEN rmfg.geometry IS NULL THEN 0
              WHEN public.ST_GeometryType(
                CASE
                  WHEN public.ST_SRID(rmfg.geometry) = 0
                  THEN public.ST_SetSRID(rmfg.geometry, 3005)
                  ELSE rmfg.geometry
                END
              ) IN ('ST_LineString', 'ST_MultiLineString')
              THEN public.ST_Length(
                CASE
                  WHEN public.ST_SRID(rmfg.geometry) = 0
                  THEN public.ST_SetSRID(rmfg.geometry, 3005)
                  ELSE rmfg.geometry
                END
              )::numeric / 1000
              ELSE 0
            END
          ),
          4
        ) AS total_trail_length_km
      FROM recreation_map_feature rmf
      LEFT JOIN recreation_map_feature_geom rmfg
        ON rmfg.rmf_skey = rmf.rmf_skey
      WHERE rmf.rec_resource_id IS NOT NULL
      GROUP BY rmf.rec_resource_id
    ) geometry_totals
      ON geometry_totals.rec_resource_id = rr.rec_resource_id
    LEFT JOIN (
      SELECT
        rr_inner.rec_resource_id,
        COALESCE(resource_campsites_inner.defined_campsites, '0') AS defined_campsites,
        COALESCE(resource_campsites_inner.total_remedial_repairs, '0') AS total_remedial_repairs,
        COALESCE(resource_activities_inner.activity_count, '0') AS activity_count
      FROM recreation_resource rr_inner
      LEFT JOIN (
        SELECT
          rec_resource_id,
          COUNT(*)::text AS defined_campsites,
          COUNT(*) FILTER (
            WHERE recreation_remed_repair_code IS NOT NULL
          )::text AS total_remedial_repairs
        FROM recreation_defined_campsite
        GROUP BY rec_resource_id
      ) resource_campsites_inner
        ON resource_campsites_inner.rec_resource_id = rr_inner.rec_resource_id
      LEFT JOIN (
        SELECT
          rec_resource_id,
          COUNT(*)::text AS activity_count
        FROM recreation_activity
        GROUP BY rec_resource_id
      ) resource_activities_inner
        ON resource_activities_inner.rec_resource_id = rr_inner.rec_resource_id
    ) resource_counts
      ON resource_counts.rec_resource_id = rr.rec_resource_id
  `;
}

export function buildFtaSharedJoins(): Prisma.Sql {
  return Prisma.sql`
    LEFT JOIN (
      SELECT DISTINCT ON (rmf_type.forest_file_id)
        rmf_type.forest_file_id,
        rmf_type.recreation_map_feature_code
      FROM fta.recreation_map_feature rmf_type
      WHERE COALESCE(rmf_type.current_ind, 'Y') = 'Y'
      ORDER BY
        rmf_type.forest_file_id,
        rmf_type.amend_status_date DESC NULLS LAST,
        rmf_type.update_timestamp DESC NULLS LAST,
        rmf_type.section_id DESC NULLS LAST,
        rmf_type.rmf_skey DESC
    ) project_type_fta
      ON project_type_fta.forest_file_id = rp.forest_file_id
    LEFT JOIN fta.recreation_map_feature_code rmfc_fta
      ON rmfc_fta.recreation_map_feature_code = project_type_fta.recreation_map_feature_code
    LEFT JOIN fta.recreation_risk_rating_code rrrc_fta
      ON rrrc_fta.recreation_risk_rating_code = rp.recreation_risk_rating_code
    LEFT JOIN (
      SELECT
        rmf.forest_file_id,
        COALESCE(SUM(rmfg.feature_area), 0)::text AS total_area,
        COALESCE(SUM(rmfg.feature_length), 0)::text AS total_length,
        ROUND(
          SUM(
            CASE
              WHEN rmfg.geometry IS NULL THEN 0
              WHEN public.ST_GeometryType(
                CASE
                  WHEN public.ST_SRID(rmfg.geometry) = 0
                  THEN public.ST_SetSRID(rmfg.geometry, 3005)
                  ELSE rmfg.geometry
                END
              ) IN ('ST_LineString', 'ST_MultiLineString')
              THEN public.ST_Length(
                CASE
                  WHEN public.ST_SRID(rmfg.geometry) = 0
                  THEN public.ST_SetSRID(rmfg.geometry, 3005)
                  ELSE rmfg.geometry
                END
              )::numeric / 1000
              ELSE 0
            END
          ),
          4
        ) AS total_trail_length_km
      FROM fta.recreation_map_feature rmf
      LEFT JOIN fta.recreation_map_feature_geom rmfg
        ON rmfg.rmf_skey = rmf.rmf_skey
      WHERE COALESCE(rmf.current_ind, 'Y') = 'Y'
      GROUP BY rmf.forest_file_id
    ) geometry_totals_fta
      ON geometry_totals_fta.forest_file_id = rp.forest_file_id
    LEFT JOIN (
      SELECT
        rp_inner.forest_file_id,
        COALESCE(resource_campsites_inner.defined_campsites, '0') AS defined_campsites,
        COALESCE(resource_campsites_inner.total_remedial_repairs, '0') AS total_remedial_repairs,
        COALESCE(resource_structures_inner.structure_count, '0') AS structure_count,
        COALESCE(resource_activities_inner.activity_count, '0') AS activity_count
      FROM fta.recreation_project rp_inner
      LEFT JOIN (
        SELECT
          forest_file_id,
          COUNT(*)::text AS defined_campsites,
          COUNT(*) FILTER (
            WHERE recreation_remed_repair_code IS NOT NULL
          )::text AS total_remedial_repairs
        FROM fta.recreation_defined_campsite
        GROUP BY forest_file_id
      ) resource_campsites_inner
        ON resource_campsites_inner.forest_file_id = rp_inner.forest_file_id
      LEFT JOIN (
        SELECT
          forest_file_id,
          COUNT(*)::text AS structure_count
        FROM fta.recreation_structure
        GROUP BY forest_file_id
      ) resource_structures_inner
        ON resource_structures_inner.forest_file_id = rp_inner.forest_file_id
      LEFT JOIN (
        SELECT
          forest_file_id,
          COUNT(*)::text AS activity_count
        FROM fta.recreation_activity
        GROUP BY forest_file_id
      ) resource_activities_inner
        ON resource_activities_inner.forest_file_id = rp_inner.forest_file_id
    ) resource_counts_fta
      ON resource_counts_fta.forest_file_id = rp.forest_file_id
  `;
}
