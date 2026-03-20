import { Prisma } from '@generated/prisma';
import {
  AdminSearchQueryDto,
  AdminSearchSort,
} from '../dtos/admin-search-query.dto';
import { OPEN_STATUS } from '../recreation-resource.constants';

export const SORT_FIELD_MAP: Record<
  AdminSearchSort,
  Prisma.recreation_resourceOrderByWithRelationInput
> = {
  'name:asc': { name: 'asc' },
  'name:desc': { name: 'desc' },
  'rec_resource_id:asc': { rec_resource_id: 'asc' },
  'rec_resource_id:desc': { rec_resource_id: 'desc' },
  'established_date:asc': { project_established_date: 'asc' },
  'established_date:desc': { project_established_date: 'desc' },
  'community:asc': { closest_community: 'asc' },
  'community:desc': { closest_community: 'desc' },
  'campsites:asc': {
    recreation_defined_campsite: {
      _count: 'asc',
    },
  },
  'campsites:desc': {
    recreation_defined_campsite: {
      _count: 'desc',
    },
  },
  'district:asc': {
    recreation_district_code: {
      description: 'asc',
    },
  },
  'district:desc': {
    recreation_district_code: {
      description: 'desc',
    },
  },
  'status:asc': { name: 'asc' },
  'status:desc': { name: 'desc' },
  'type:asc': { name: 'asc' },
  'type:desc': { name: 'desc' },
  'activities:asc': { name: 'asc' },
  'activities:desc': { name: 'desc' },
  'access:asc': { name: 'asc' },
  'access:desc': { name: 'desc' },
  'fee:asc': { name: 'asc' },
  'fee:desc': { name: 'desc' },
};

// These sorts depend on aggregated related data, so they use the raw SQL path
// instead of Prisma's standard orderBy support.
export const RAW_SQL_SORTS = new Set<AdminSearchSort>([
  'status:asc',
  'status:desc',
  'type:asc',
  'type:desc',
  'activities:asc',
  'activities:desc',
  'access:asc',
  'access:desc',
  'fee:asc',
  'fee:desc',
]);

type DerivedSortField = 'status' | 'type' | 'activities' | 'access' | 'fee';

type DerivedSortQueryParts = {
  joinsSql: Prisma.Sql;
  orderBySql: Prisma.Sql;
};

function parseIntegerCodes(values?: string[]): number[] {
  return (
    values
      ?.map((value) => Number.parseInt(value, 10))
      .filter((value): value is number => Number.isInteger(value)) ?? []
  );
}

function buildSearchTextCondition(searchTerm?: string): Prisma.Sql | null {
  const trimmedQuery = searchTerm?.trim();
  if (!trimmedQuery) {
    return null;
  }

  const wildcard = `%${trimmedQuery}%`;
  return Prisma.sql`
    (
      rr.name ILIKE ${wildcard}
      OR rr.rec_resource_id ILIKE ${wildcard}
      OR rr.closest_community ILIKE ${wildcard}
    )
  `;
}

function buildDateCondition(
  value: string | undefined,
  operator: '>=' | '<=',
): Prisma.Sql | null {
  if (!value) {
    return null;
  }

  return Prisma.sql`rr.project_established_date ${Prisma.raw(operator)} ${new Date(value)}`;
}

function buildMultiValueExistsCondition({
  values,
  table,
  alias,
  column,
}: {
  values?: Array<string | number>;
  table: string;
  alias: string;
  column: string;
}): Prisma.Sql | null {
  if (!values?.length) {
    return null;
  }

  return Prisma.sql`
    EXISTS (
      SELECT 1
      FROM ${Prisma.raw(table)} ${Prisma.raw(alias)}
      WHERE ${Prisma.raw(alias)}.rec_resource_id = rr.rec_resource_id
        AND ${Prisma.raw(alias)}.${Prisma.raw(column)} IN (${Prisma.join(values)})
    )
  `;
}

export function buildSearchWhereSql(query: AdminSearchQueryDto): Prisma.Sql {
  const conditions = [
    buildSearchTextCondition(query.q),
    buildMultiValueExistsCondition({
      values: query.type,
      table: 'rst.recreation_resource_type_view_admin',
      alias: 'rrtva',
      column: 'rec_resource_type_code',
    }),
    query.district?.length
      ? Prisma.sql`rr.district_code IN (${Prisma.join(query.district)})`
      : null,
    buildMultiValueExistsCondition({
      values: parseIntegerCodes(query.activities),
      table: 'rst.recreation_activity',
      alias: 'ra',
      column: 'recreation_activity_code',
    }),
    buildMultiValueExistsCondition({
      values: query.access,
      table: 'rst.recreation_access',
      alias: 'ra',
      column: 'access_code',
    }),
    buildMultiValueExistsCondition({
      values: parseIntegerCodes(query.status),
      table: 'rst.recreation_status',
      alias: 'rs',
      column: 'status_code',
    }),
    buildDateCondition(query.establishment_date_from, '>='),
    buildDateCondition(query.establishment_date_to, '<='),
  ].filter((condition): condition is Prisma.Sql => condition !== null);

  if (conditions.length === 0) {
    return Prisma.empty;
  }

  return Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`;
}

export function buildDerivedSortQueryParts(
  sort: AdminSearchSort,
): DerivedSortQueryParts {
  const [field, direction] = sort.split(':') as [
    DerivedSortField,
    'asc' | 'desc',
  ];
  const directionSql = direction === 'asc' ? Prisma.sql`ASC` : Prisma.sql`DESC`;

  switch (field) {
    case 'status':
      return {
        joinsSql: Prisma.sql`
          LEFT JOIN rst.recreation_status rs
            ON rs.rec_resource_id = rr.rec_resource_id
          LEFT JOIN rst.recreation_status_code rsc
            ON rsc.status_code = rs.status_code
        `,
        orderBySql: Prisma.sql`COALESCE(rsc.description, ${OPEN_STATUS.DESCRIPTION}) ${directionSql}`,
      };
    case 'type':
      return {
        joinsSql: Prisma.sql`
          LEFT JOIN rst.recreation_resource_type_view_admin rrtva
            ON rrtva.rec_resource_id = rr.rec_resource_id
        `,
        orderBySql: Prisma.sql`COALESCE(rrtva.description, '') ${directionSql}`,
      };
    case 'activities':
      return {
        joinsSql: Prisma.sql`
          LEFT JOIN LATERAL (
            SELECT string_agg(
              DISTINCT COALESCE(rac.description, ''),
              ', ' ORDER BY COALESCE(rac.description, '')
            ) AS activity_values
            FROM rst.recreation_activity ra
            LEFT JOIN rst.recreation_activity_code rac
              ON rac.recreation_activity_code = ra.recreation_activity_code
            WHERE ra.rec_resource_id = rr.rec_resource_id
          ) activity_agg ON TRUE
        `,
        orderBySql: Prisma.sql`COALESCE(activity_agg.activity_values, '') ${directionSql}`,
      };
    case 'access':
      return {
        joinsSql: Prisma.sql`
          LEFT JOIN LATERAL (
            SELECT string_agg(
              DISTINCT COALESCE(rac.description, ''),
              ', ' ORDER BY COALESCE(rac.description, '')
            ) AS access_values
            FROM rst.recreation_access ra
            LEFT JOIN rst.recreation_access_code rac
              ON rac.access_code = ra.access_code
            WHERE ra.rec_resource_id = rr.rec_resource_id
          ) access_agg ON TRUE
        `,
        orderBySql: Prisma.sql`COALESCE(access_agg.access_values, '') ${directionSql}`,
      };
    case 'fee':
      return {
        joinsSql: Prisma.sql`
          LEFT JOIN LATERAL (
            SELECT string_agg(
              fee_value,
              ', ' ORDER BY fee_value
            ) AS fee_values
            FROM (
              SELECT DISTINCT fee_value
              FROM (
                SELECT
                  CASE
                    WHEN EXISTS (
                      SELECT 1
                      FROM rst.recreation_resource_reservation_info rrri
                      WHERE rrri.rec_resource_id = rr.rec_resource_id
                    ) THEN 'Reservable'
                  END AS fee_value
                UNION ALL
                SELECT
                  CASE
                    WHEN EXISTS (
                      SELECT 1
                      FROM rst.recreation_fee rf
                      WHERE rf.rec_resource_id = rr.rec_resource_id
                    ) THEN 'Has fees'
                    ELSE 'No fees'
                  END AS fee_value
              ) fee_values
              WHERE fee_value IS NOT NULL
            ) distinct_fee_values
          ) fee_agg ON TRUE
        `,
        orderBySql: Prisma.sql`COALESCE(fee_agg.fee_values, '') ${directionSql}`,
      };
  }
}

export function buildDerivedSortCountQuery(whereSql: Prisma.Sql): Prisma.Sql {
  return Prisma.sql`
    SELECT COUNT(*)::bigint AS total
    FROM rst.recreation_resource rr
    ${whereSql}
  `;
}

export function buildDerivedSortIdsQuery({
  whereSql,
  joinsSql,
  orderBySql,
  pageSize,
  offset,
}: {
  whereSql: Prisma.Sql;
  joinsSql: Prisma.Sql;
  orderBySql: Prisma.Sql;
  pageSize: number;
  offset: number;
}): Prisma.Sql {
  return Prisma.sql`
    SELECT rr.rec_resource_id
    FROM rst.recreation_resource rr
    ${joinsSql}
    ${whereSql}
    ORDER BY ${orderBySql}, rr.rec_resource_id ASC
    LIMIT ${pageSize}
    OFFSET ${offset}
  `;
}
