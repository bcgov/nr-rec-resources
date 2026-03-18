import { Prisma } from '@generated/prisma';
import {
  AdminSearchQueryDto,
  AdminSearchSort,
} from '../dtos/admin-search-query.dto';

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
  'type:asc',
  'type:desc',
  'activities:asc',
  'activities:desc',
  'access:asc',
  'access:desc',
  'fee:asc',
  'fee:desc',
]);

export function buildSearchWhereSql(query: AdminSearchQueryDto): Prisma.Sql {
  const conditions: Prisma.Sql[] = [];
  const trimmedQuery = query.q?.trim();
  const trimmedCommunity = query.closest_community?.trim();

  if (trimmedQuery) {
    const wildcard = `%${trimmedQuery}%`;
    conditions.push(Prisma.sql`
      (
        rr.name ILIKE ${wildcard}
        OR rr.rec_resource_id ILIKE ${wildcard}
        OR rr.closest_community ILIKE ${wildcard}
      )
    `);
  }

  if (query.type?.length) {
    conditions.push(Prisma.sql`
      EXISTS (
        SELECT 1
        FROM rst.recreation_resource_type_view_admin rrtva
        WHERE rrtva.rec_resource_id = rr.rec_resource_id
          AND rrtva.rec_resource_type_code IN (${Prisma.join(query.type)})
      )
    `);
  }

  if (query.district?.length) {
    conditions.push(
      Prisma.sql`rr.district_code IN (${Prisma.join(query.district)})`,
    );
  }

  if (query.activities?.length) {
    const activityCodes = query.activities
      .map((activity) => Number.parseInt(activity, 10))
      .filter((activity): activity is number => Number.isInteger(activity));

    if (activityCodes.length) {
      conditions.push(Prisma.sql`
        EXISTS (
          SELECT 1
          FROM rst.recreation_activity ra
          WHERE ra.rec_resource_id = rr.rec_resource_id
            AND ra.recreation_activity_code IN (${Prisma.join(activityCodes)})
        )
      `);
    }
  }

  if (query.access?.length) {
    conditions.push(Prisma.sql`
      EXISTS (
        SELECT 1
        FROM rst.recreation_access ra
        WHERE ra.rec_resource_id = rr.rec_resource_id
          AND ra.access_code IN (${Prisma.join(query.access)})
      )
    `);
  }

  if (query.defined_campsites === 'yes') {
    conditions.push(Prisma.sql`
      EXISTS (
        SELECT 1
        FROM rst.recreation_defined_campsite rdc
        WHERE rdc.rec_resource_id = rr.rec_resource_id
      )
    `);
  }

  if (query.defined_campsites === 'no') {
    conditions.push(Prisma.sql`
      NOT EXISTS (
        SELECT 1
        FROM rst.recreation_defined_campsite rdc
        WHERE rdc.rec_resource_id = rr.rec_resource_id
      )
    `);
  }

  if (trimmedCommunity) {
    conditions.push(
      Prisma.sql`rr.closest_community ILIKE ${`%${trimmedCommunity}%`}`,
    );
  }

  if (query.establishment_date_from) {
    conditions.push(
      Prisma.sql`rr.project_established_date >= ${new Date(query.establishment_date_from)}`,
    );
  }

  if (query.establishment_date_to) {
    conditions.push(
      Prisma.sql`rr.project_established_date <= ${new Date(query.establishment_date_to)}`,
    );
  }

  if (conditions.length === 0) {
    return Prisma.empty;
  }

  return Prisma.sql`WHERE ${Prisma.join(conditions, Prisma.sql` AND `)}`;
}

export function buildDerivedSortOrderSql(sort: AdminSearchSort): Prisma.Sql {
  const [field, direction] = sort.split(':') as [
    'type' | 'activities' | 'access' | 'fee',
    'asc' | 'desc',
  ];
  const directionSql = direction === 'asc' ? Prisma.sql`ASC` : Prisma.sql`DESC`;

  switch (field) {
    case 'type':
      return Prisma.sql`COALESCE(rrtva.description, '') ${directionSql}`;
    case 'activities':
      return Prisma.sql`COALESCE(activity_agg.activity_values, '') ${directionSql}`;
    case 'access':
      return Prisma.sql`COALESCE(access_agg.access_values, '') ${directionSql}`;
    case 'fee':
      return Prisma.sql`COALESCE(fee_agg.fee_values, '') ${directionSql}`;
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
  orderBySql,
  pageSize,
  offset,
}: {
  whereSql: Prisma.Sql;
  orderBySql: Prisma.Sql;
  pageSize: number;
  offset: number;
}): Prisma.Sql {
  return Prisma.sql`
    SELECT rr.rec_resource_id
    FROM rst.recreation_resource rr
    LEFT JOIN rst.recreation_resource_type_view_admin rrtva
      ON rrtva.rec_resource_id = rr.rec_resource_id
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
    ${whereSql}
    ORDER BY ${orderBySql}, rr.rec_resource_id ASC
    LIMIT ${pageSize}
    OFFSET ${offset}
  `;
}
