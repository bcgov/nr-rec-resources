import { Prisma } from '@generated/prisma';

interface ExportFilterParams {
  district?: string;
  resourceType?: string;
  includeArchived?: boolean;
}

export function buildRstFilters({
  district,
  resourceType,
  includeArchived = true,
}: ExportFilterParams): Prisma.Sql {
  const filterClauses: Prisma.Sql[] = [Prisma.sql`1 = 1`];

  // IS DISTINCT FROM so a resource with no status set still comes through.
  if (!includeArchived) {
    filterClauses.push(Prisma.sql`rr.rec_status_code IS DISTINCT FROM 'AR'`);
  }

  if (district) {
    filterClauses.push(Prisma.sql`rr.district_code = ${district}`);
  }

  if (resourceType) {
    filterClauses.push(
      Prisma.sql`rrtva.rec_resource_type_code = ${resourceType}`,
    );
  }

  return Prisma.join(filterClauses, ' AND ');
}

export function buildFtaFilters({
  district,
  resourceType,
  includeArchived = true,
}: ExportFilterParams): Prisma.Sql {
  const filterClauses: Prisma.Sql[] = [Prisma.sql`1 = 1`];

  // EXISTS rather than the pfu_fta join, so the clause stands on its own.
  if (!includeArchived) {
    filterClauses.push(
      Prisma.sql`
        NOT EXISTS (
          SELECT 1
          FROM fta.prov_forest_use pfu_archived
          WHERE pfu_archived.forest_file_id = rp.forest_file_id
            AND pfu_archived.file_status_st = 'AR'
        )
      `,
    );
  }

  if (district) {
    filterClauses.push(
      Prisma.sql`
        EXISTS (
          SELECT 1
          FROM fta.recreation_district_xref rdx_filter
          WHERE rdx_filter.forest_file_id = rp.forest_file_id
            AND rdx_filter.recreation_district_code = ${district}
        )
      `,
    );
  }

  if (resourceType) {
    filterClauses.push(
      Prisma.sql`
        (
          SELECT rmf_filter.recreation_map_feature_code
          FROM fta.recreation_map_feature rmf_filter
          WHERE rmf_filter.forest_file_id = rp.forest_file_id
            AND COALESCE(rmf_filter.current_ind, 'Y') = 'Y'
          ORDER BY
            rmf_filter.amend_status_date DESC NULLS LAST,
            rmf_filter.update_timestamp DESC NULLS LAST,
            rmf_filter.section_id DESC NULLS LAST,
            rmf_filter.rmf_skey DESC
          LIMIT 1
        ) = ${resourceType}
      `,
    );
  }

  return Prisma.join(filterClauses, ' AND ');
}
