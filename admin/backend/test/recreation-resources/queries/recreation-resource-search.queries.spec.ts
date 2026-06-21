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
      established: 'yes',
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
    expect(normalizedSql).toContain('rr.project_established_date IS NOT NULL');
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

  it('includes established filter in WHERE clause', () => {
    const whereYes = buildSearchWhereSql({
      established: 'yes',
    });
    const whereNo = buildSearchWhereSql({
      established: 'no',
    });

    expect(normalizeSql(whereYes)).toContain(
      'rr.project_established_date IS NOT NULL',
    );
    expect(normalizeSql(whereNo)).toContain(
      'rr.project_established_date IS NULL',
    );
  });

  it('ignores established filter with invalid value', () => {
    const whereInvalid = buildSearchWhereSql({
      established: 'invalid',
    });

    expect(whereInvalid).toBe(Prisma.empty);
  });

  it('ignores established filter when undefined or empty', () => {
    const whereUndefined = buildSearchWhereSql({
      established: undefined,
    });
    const whereEmpty = buildSearchWhereSql({
      established: '',
    });

    expect(whereUndefined).toBe(Prisma.empty);
    expect(whereEmpty).toBe(Prisma.empty);
  });

  it('maps raw SQL sorts and derived order clauses correctly', () => {
    expect(RAW_SQL_SORTS.has('type:asc')).toBe(true);
    expect(RAW_SQL_SORTS.has('public_access_status:asc')).toBe(true);
    expect(RAW_SQL_SORTS.has('public_access_status:desc')).toBe(true);
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
    expect(normalizedIdsSql).toContain('rf.is_deleted = false');
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

  it('builds public_access_status filter using advisory subquery', () => {
    const whereSql = buildSearchWhereSql({
      public_access_status: ['Closed', 'Caution'],
    });

    const normalized = normalizeSql(whereSql);

    expect(normalized).toContain('COALESCE(');
    expect(normalized).toContain('af.access_status_grouplabel');
    expect(normalized).toContain('rst.act_advisories_flat af');
    expect(normalized).toContain('af.rec_resource_id = rr.rec_resource_id');
    expect(normalized).toContain('LIMIT 1');
    expect(normalized).toContain("'Open'");
    expect(normalized).toContain('IN (?,?)');
    expect(whereSql.values).toContain('Closed');
    expect(whereSql.values).toContain('Caution');
  });

  it('omits public_access_status condition when array is empty', () => {
    const whereSql = buildSearchWhereSql({ public_access_status: [] });

    expect(whereSql).toBe(Prisma.empty);
  });

  it('omits public_access_status condition when field is absent', () => {
    const whereSql = buildSearchWhereSql({});

    expect(whereSql).toBe(Prisma.empty);
  });

  it('builds public_access_status derived sort with lateral join and advisory ordering', () => {
    const { joinsSql, orderBySql } = buildDerivedSortQueryParts(
      'public_access_status:asc',
    );

    const normalizedJoin = normalizeSql(joinsSql);
    expect(normalizedJoin).toContain('LEFT JOIN LATERAL');
    expect(normalizedJoin).toContain('rst.act_advisories_flat af');
    expect(normalizedJoin).toContain('af.rec_resource_id = rr.rec_resource_id');
    expect(normalizedJoin).toContain('af.listing_rank DESC');
    expect(normalizedJoin).toContain('LIMIT 1');
    expect(normalizedJoin).toContain("'Open'");
    expect(normalizedJoin).toContain('advisory_status ON TRUE');

    expect(normalizeSql(orderBySql)).toContain(
      'advisory_status.public_access_status ASC',
    );
  });

  it('builds public_access_status derived sort descending correctly', () => {
    const { orderBySql } = buildDerivedSortQueryParts(
      'public_access_status:desc',
    );

    expect(normalizeSql(orderBySql)).toContain(
      'advisory_status.public_access_status DESC',
    );
  });

  it('builds ids query for public_access_status sort with lateral join', () => {
    const whereSql = buildSearchWhereSql({ q: 'park' });
    const sortParts = buildDerivedSortQueryParts('public_access_status:asc');
    const idsQuery = buildDerivedSortIdsQuery({
      whereSql,
      joinsSql: sortParts.joinsSql,
      orderBySql: sortParts.orderBySql,
      pageSize: 25,
      offset: 0,
    });

    const normalized = normalizeSql(idsQuery);

    expect(normalized).toContain('LEFT JOIN LATERAL');
    expect(normalized).toContain('advisory_status ON TRUE');
    expect(normalized).toContain(
      'ORDER BY advisory_status.public_access_status ASC, rr.rec_resource_id ASC',
    );
    expect(normalized).toContain('LIMIT ?');
    expect(normalized).toContain('OFFSET ?');
    expect(idsQuery.values.at(-2)).toBe(25);
    expect(idsQuery.values.at(-1)).toBe(0);
  });

  it('SORT_FIELD_MAP has fallback name sort for public_access_status', () => {
    expect(SORT_FIELD_MAP['public_access_status:asc']).toEqual({ name: 'asc' });
    expect(SORT_FIELD_MAP['public_access_status:desc']).toEqual({
      name: 'desc',
    });
  });

  // These column-only sorts reach buildDerivedSortQueryParts only when a
  // public_access_status filter forces the derived-sort path. They emit no
  // joins and order directly on a recreation_resource column.
  it.each([
    ['name:asc', 'rr.name ASC'],
    ['name:desc', 'rr.name DESC'],
    ['rec_resource_id:asc', 'rr.rec_resource_id ASC'],
    ['established_date:asc', 'rr.project_established_date ASC'],
    ['community:asc', 'rr.closest_community ASC'],
    ['display_on_public_site:asc', 'rr.display_on_public_site ASC'],
  ] as const)(
    'builds column-only derived sort for %s without joins',
    (sort, expectedOrderBy) => {
      const { joinsSql, orderBySql } = buildDerivedSortQueryParts(sort);

      expect(joinsSql).toBe(Prisma.empty);
      expect(normalizeSql(orderBySql)).toBe(expectedOrderBy);
    },
  );

  it('builds campsites derived sort with a campsite count lateral join', () => {
    const { joinsSql, orderBySql } =
      buildDerivedSortQueryParts('campsites:asc');

    const normalizedJoin = normalizeSql(joinsSql);
    expect(normalizedJoin).toContain('LEFT JOIN LATERAL');
    expect(normalizedJoin).toContain('COUNT(*) AS campsite_count');
    expect(normalizedJoin).toContain('rst.recreation_defined_campsite rdc');
    expect(normalizedJoin).toContain(
      'rdc.rec_resource_id = rr.rec_resource_id',
    );
    expect(normalizeSql(orderBySql)).toBe('campsite_agg.campsite_count ASC');
  });

  it('builds district derived sort with a district code join and COALESCE order', () => {
    const { joinsSql, orderBySql } =
      buildDerivedSortQueryParts('district:desc');

    const normalizedJoin = normalizeSql(joinsSql);
    expect(normalizedJoin).toContain(
      'LEFT JOIN rst.recreation_district_code rdco',
    );
    expect(normalizedJoin).toContain('rdco.district_code = rr.district_code');
    expect(normalizeSql(orderBySql)).toBe(
      "COALESCE(rdco.description, '') DESC",
    );
  });
});
