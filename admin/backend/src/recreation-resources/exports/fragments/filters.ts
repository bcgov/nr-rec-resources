import { Prisma } from '@generated/prisma';

interface ExportFilterParams {
  district?: string;
  resourceType?: string;
}

export function buildRstFilters({
  district,
  resourceType,
}: ExportFilterParams): Prisma.Sql {
  const filterClauses: Prisma.Sql[] = [Prisma.sql`1 = 1`];

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
}: ExportFilterParams): Prisma.Sql {
  const filterClauses: Prisma.Sql[] = [Prisma.sql`1 = 1`];

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
