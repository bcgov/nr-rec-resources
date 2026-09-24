/**
 * The four BCGW layers exported to S3.
 *
 * Each query reads one of the thin `bcgw` views, which are lenses over the two
 * materialized views refreshed before every export. Two things to note:
 *
 * - Geometry is selected as GeoJSON text and spliced into the output as a string.
 *   Parsing it into JS objects and re-encoding it is what made the inline
 *   responses so memory- and CPU-hungry.
 * - The views keep the legacy BCGW/FTA column names; the aliases here are the
 *   renamed API field names, so the exported files carry the same field names the
 *   endpoints returned inline.
 *
 * `COUNT(*) OVER ()` is deliberately absent - it only ever fed pagination metadata.
 *
 * Casts: `pg` returns int8 and numeric as strings, so columns the old response
 * mappers coerced with `Number()` are cast here to keep them JSON numbers.
 * `feature_area_sqm` is left uncast because it was a string in the inline
 * responses too.
 */
export interface BcgwLayer {
  /** URL path segment for the endpoint, and the basename of the S3 object. */
  readonly name: string;
  /** Query producing one row per feature, with a `geometry` GeoJSON text column. */
  readonly query: string;
}

export const BCGW_LAYERS: readonly BcgwLayer[] = [
  {
    name: 'closures-fully-attributed',
    query: `
      SELECT
        forest_file_id                    AS rec_resource_id,
        project_name                      AS rec_resource_name,
        project_type_code                 AS rec_resource_type_code,
        project_type                      AS rec_resource_type,
        project_established_date,
        closure_ind,
        closure_date,
        closure_type,
        closure_comment,
        recreation_view_ind               AS display_on_public_site_ind,
        file_status_st                    AS rec_status_code,
        status_description                AS rec_status_description,
        site_location                     AS closest_community,
        defined_campsites::int            AS defined_campsites,
        site_description_brief            AS description,
        arch_impact_assess_ind,
        tenure_app_total_area::float8     AS total_feature_area,
        tenure_app_total_length::float8   AS total_feature_length,
        site_description,
        site_description_date,
        driving_directions,
        driving_directions_date,
        rec_feature_code                  AS recreation_feature_code,
        rec_feature_description           AS recreation_feature_description,
        recreation_district_code,
        recreation_district_name,
        org_unit_code,
        org_unit_name,
        utm_zone,
        utm_easting,
        utm_northing,
        latitude,
        longitude,
        shape                             AS geometry
      FROM bcgw.closures_full
      ORDER BY forest_file_id ASC`,
  },
  {
    name: 'closures-short',
    query: `
      SELECT
        forest_file_id                    AS rec_resource_id,
        project_name                      AS rec_resource_name,
        project_type                      AS rec_resource_type,
        closure_ind,
        closure_date,
        closure_type,
        site_location                     AS closest_community,
        defined_campsites::int            AS defined_campsites,
        recreation_district_code,
        recreation_district_name,
        org_unit_name,
        closure_comment,
        site_description,
        driving_directions,
        latitude,
        longitude,
        shape                             AS geometry
      FROM bcgw.closures_short
      ORDER BY forest_file_id ASC`,
  },
  {
    name: 'recreation-lines',
    query: `
      SELECT
        rmf_skey,
        forest_file_id                    AS rec_resource_id,
        section_id,
        recreation_map_feature_code       AS rec_resource_type_code,
        project_type                      AS rec_resource_type,
        retirement_date,
        amendment_id,
        map_label,
        project_name                      AS rec_resource_name,
        recreation_feature_code,
        resource_feature_ind,
        right_of_way::float8              AS right_of_way,
        arch_impact_assess_ind,
        site_location                     AS closest_community,
        project_established_date,
        recreation_view_ind               AS display_on_public_site_ind,
        recreation_district_code,
        defined_campsites::int            AS defined_campsites,
        life_cycle_status_code,
        file_status_code                  AS rec_status_code,
        district_code,
        district_name,
        feature_length::float8            AS feature_length,
        feature_length_m::float8          AS feature_length_m,
        geometry
      FROM bcgw.recreation_lines
      ORDER BY rmf_skey ASC`,
  },
  {
    name: 'recreation-polygons',
    query: `
      SELECT
        rmf_skey,
        forest_file_id                    AS rec_resource_id,
        section_id,
        recreation_map_feature_code       AS rec_resource_type_code,
        project_type                      AS rec_resource_type,
        retirement_date,
        amendment_id,
        map_label,
        project_name                      AS rec_resource_name,
        recreation_feature_code,
        resource_feature_ind,
        arch_impact_assess_ind,
        site_location                     AS closest_community,
        project_established_date,
        recreation_view_ind               AS display_on_public_site_ind,
        recreation_district_code,
        defined_campsites::int            AS defined_campsites,
        life_cycle_status_code,
        file_status_code                  AS rec_status_code,
        geographic_district_code          AS district_code,
        geographic_district_name          AS org_unit_name,
        feature_area::float8              AS feature_area,
        feature_perimeter::float8         AS feature_perimeter,
        feature_area_sqm,
        feature_length_m::float8          AS feature_length_m,
        geometry
      FROM bcgw.recreation_polygons
      ORDER BY rmf_skey ASC`,
  },
];

export const BCGW_LAYER_NAMES = BCGW_LAYERS.map((layer) => layer.name);
