import {
  RAW_SQL_SORTS,
  SORT_FIELD_MAP,
  buildDerivedSortCountQuery,
  buildDerivedSortIdsQuery,
  buildDerivedSortOrderSql,
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
      defined_campsites: 'no',
      closest_community: '  Hope ',
      establishment_date_from: '2020-01-01',
      establishment_date_to: '2024-12-31',
    });

    const normalizedSql = normalizeSql(whereSql);

    expect(normalizedSql).toContain('rr.name ILIKE');
    expect(normalizedSql).toContain('rr.rec_resource_id ILIKE');
    expect(normalizedSql).toContain('rr.closest_community ILIKE');
    expect(normalizedSql).toContain('rrtva.rec_resource_type_code IN (?,?)');
    expect(normalizedSql).toContain('rr.district_code IN (?)');
    expect(normalizedSql).toContain('ra.recreation_activity_code IN (?,?)');
    expect(normalizedSql).toContain('ra.access_code IN (?)');
    expect(normalizedSql).toContain('NOT EXISTS');
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
      '%Hope%',
      new Date('2020-01-01'),
      new Date('2024-12-31'),
    ]);
  });

  it('ignores invalid activity filters and supports defined campsite yes filters', () => {
    const whereSql = buildSearchWhereSql({
      activities: ['invalid'],
      defined_campsites: 'yes',
    });

    const normalizedSql = normalizeSql(whereSql);

    expect(normalizedSql).toContain('EXISTS');
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
    expect(normalizeSql(buildDerivedSortOrderSql('type:asc'))).toContain(
      "COALESCE(rrtva.description, '') ASC",
    );
    expect(normalizeSql(buildDerivedSortOrderSql('activities:desc'))).toContain(
      "COALESCE(activity_agg.activity_values, '') DESC",
    );
    expect(normalizeSql(buildDerivedSortOrderSql('access:asc'))).toContain(
      "COALESCE(access_agg.access_values, '') ASC",
    );
    expect(normalizeSql(buildDerivedSortOrderSql('fee:desc'))).toContain(
      "COALESCE(fee_agg.fee_values, '') DESC",
    );
  });

  it('builds derived count and id queries with ordering and pagination', () => {
    const whereSql = buildSearchWhereSql({
      q: 'river',
    });
    const countQuery = buildDerivedSortCountQuery(whereSql);
    const idsQuery = buildDerivedSortIdsQuery({
      whereSql,
      orderBySql: buildDerivedSortOrderSql('fee:asc'),
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
    expect(normalizedIdsSql).toContain(
      "ORDER BY COALESCE(fee_agg.fee_values, '') ASC, rr.rec_resource_id ASC",
    );
    expect(normalizedIdsSql).toContain('LIMIT ?');
    expect(normalizedIdsSql).toContain('OFFSET ?');
    expect(idsQuery.values.at(-2)).toBe(25);
    expect(idsQuery.values.at(-1)).toBe(50);
  });
});
