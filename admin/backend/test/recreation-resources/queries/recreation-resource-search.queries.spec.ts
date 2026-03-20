import {
  RAW_SQL_SORTS,
  SORT_FIELD_MAP,
  buildDerivedSortCountQuery,
  buildDerivedSortIdsQuery,
  buildDerivedSortQueryParts,
  buildSearchWhereSql,
} from '@/recreation-resources/queries/recreation-resource-search.queries';
import { Prisma } from '@generated/prisma';
import { describe, expect, it } from 'vitest';

const normalizeSql = (sql: Prisma.Sql) => sql.sql.replace(/\s+/g, ' ').trim();

describe('recreation-resource-search.queries', () => {
  it('returns Prisma.empty when no search filters are provided', () => {
    const whereSql = buildSearchWhereSql({});

    expect(whereSql).toBe(Prisma.empty);
  });

  it('builds SQL conditions for all supported filters and sanitizes activities', () => {
    const whereSql = buildSearchWhereSql({
      q: '  lake  ',
      type: ['SIT', 'RTR'],
      district: ['RDKA'],
      activities: ['1', 'x', '2'],
      access: ['R'],
      status: ['3', 'bad', '4'],
      establishment_date_from: '2020-01-01',
      establishment_date_to: '2024-12-31',
    });

    const normalizedSql = normalizeSql(whereSql);

    expect(normalizedSql).toContain('rr.name ILIKE');
    expect(normalizedSql).toContain('rr.rec_resource_id ILIKE');
    expect(normalizedSql).toContain('rrtva.rec_resource_type_code IN (?,?)');
    expect(normalizedSql).toContain('rr.district_code IN (?)');
    expect(normalizedSql).toContain('ra.recreation_activity_code IN (?,?)');
    expect(normalizedSql).toContain('ra.access_code IN (?)');
    expect(normalizedSql).toContain('rs.status_code IN (?,?)');
    expect(normalizedSql).toContain('rr.project_established_date >= ?');
    expect(normalizedSql).toContain('rr.project_established_date <= ?');
    expect(whereSql.values).toEqual([
      '%lake%',
      '%lake%',
      '%lake%',
      'SIT',
      'RTR',
      'RDKA',
      1,
      2,
      'R',
      3,
      4,
      new Date('2020-01-01'),
      new Date('2024-12-31'),
    ]);
  });

  it('ignores invalid activity filters', () => {
    const whereSql = buildSearchWhereSql({
      activities: ['invalid'],
    });

    const normalizedSql = normalizeSql(whereSql);

    expect(normalizedSql).not.toContain('recreation_activity_code IN');
  });

  it('maps raw SQL sorts and derived order clauses correctly', () => {
    expect(RAW_SQL_SORTS.has('type:asc')).toBe(true);
    expect(RAW_SQL_SORTS.has('name:asc' as any)).toBe(false);
    expect(SORT_FIELD_MAP['district:desc']).toEqual({
      recreation_district_code: {
        description: 'desc',
      },
    });
    expect(
      normalizeSql(buildDerivedSortQueryParts('status:desc').orderBySql),
    ).toContain('COALESCE(rsc.description, ?) DESC');
    expect(buildDerivedSortQueryParts('status:desc').orderBySql.values).toEqual(
      ['Open'],
    );
    expect(
      normalizeSql(buildDerivedSortQueryParts('type:asc').orderBySql),
    ).toContain("COALESCE(rrtva.description, '') ASC");
    expect(
      normalizeSql(buildDerivedSortQueryParts('activities:desc').orderBySql),
    ).toContain("COALESCE(activity_agg.activity_values, '') DESC");
    expect(
      normalizeSql(buildDerivedSortQueryParts('access:asc').orderBySql),
    ).toContain("COALESCE(access_agg.access_values, '') ASC");
    expect(
      normalizeSql(buildDerivedSortQueryParts('fee:desc').orderBySql),
    ).toContain("COALESCE(fee_agg.fee_values, '') DESC");
  });

  it('builds derived count and minimal id queries with ordering and pagination', () => {
    const whereSql = buildSearchWhereSql({
      q: 'river',
    });
    const feeSortQueryParts = buildDerivedSortQueryParts('fee:asc');
    const countQuery = buildDerivedSortCountQuery(whereSql);
    const idsQuery = buildDerivedSortIdsQuery({
      whereSql,
      joinsSql: feeSortQueryParts.joinsSql,
      orderBySql: feeSortQueryParts.orderBySql,
      pageSize: 25,
      offset: 50,
    });

    expect(normalizeSql(countQuery)).toContain(
      'SELECT COUNT(*)::bigint AS total FROM rst.recreation_resource rr WHERE',
    );

    const normalizedIdsSql = normalizeSql(idsQuery);
    expect(normalizedIdsSql).toContain('LEFT JOIN LATERAL');
    expect(normalizedIdsSql).toContain('Reservable');
    expect(normalizedIdsSql).toContain('Has fees');
    expect(normalizedIdsSql).toContain('No fees');
    expect(normalizedIdsSql).not.toContain('activity_agg');
    expect(normalizedIdsSql).not.toContain('access_agg');
    expect(normalizedIdsSql).not.toContain('recreation_status_code');
    expect(normalizedIdsSql).toContain(
      "ORDER BY COALESCE(fee_agg.fee_values, '') ASC, rr.rec_resource_id ASC",
    );
    expect(normalizedIdsSql).toContain('LIMIT ?');
    expect(normalizedIdsSql).toContain('OFFSET ?');
    expect(idsQuery.values.at(-2)).toBe(25);
    expect(idsQuery.values.at(-1)).toBe(50);
  });
});
