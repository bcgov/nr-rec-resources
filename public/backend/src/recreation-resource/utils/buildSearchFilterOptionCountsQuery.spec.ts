import { describe, expect, it } from 'vitest';
import { Prisma } from '@generated/prisma';
import { EXCLUDED_ACTIVITY_CODES } from '../constants/service.constants';
import { buildFilterOptionCountsQuery } from './buildSearchFilterOptionCountsQuery';

describe('buildFilterOptionCountsQuery', () => {
  it('should build a SQL query with a where clause and no filter flags', () => {
    const whereClause = Prisma.sql`WHERE district_code = ${'D1'}`;
    const whereClauseExcludingType = Prisma.sql`WHERE district_code = ${'D1'}`;
    const whereClauseExcludingDistrict = Prisma.sql`WHERE 1=1`;
    const query = buildFilterOptionCountsQuery({
      whereClause,
      whereClauseExcludingType,
      whereClauseExcludingDistrict,
    });

    // Verify SQL structure
    const queryStr = query.sql;
    expect(queryStr).toContain('WITH filtered_resources AS');
    expect(queryStr).toContain('FROM recreation_resource_search_view');
    expect(queryStr).toContain('UNION ALL');

    // Verify placeholders and parameter values
    expect(query.values).toContain('D1');

    // Ensure excluded activity codes are included
    EXCLUDED_ACTIVITY_CODES.forEach((code) => {
      expect(query.values).toContain(code);
    });
  });

  it('should use dedicated CTEs for type and district facet counts', () => {
    const whereClause = Prisma.sql`WHERE access_code = ${'AC1'}`;
    const whereClauseExcludingType = Prisma.sql`WHERE access_code = ${'AC1'}`;
    const whereClauseExcludingDistrict = Prisma.sql`WHERE access_code = ${'AC1'}`;
    const filterTypes = {
      isOnlyDistrictFilter: true,
      isOnlyAccessFilter: true,
      isOnlyTypeFilter: true,
      isOnlyStatusFilter: false,
      isOnlyFeesFilter: false,
    };

    const query = buildFilterOptionCountsQuery({
      whereClause,
      whereClauseExcludingType,
      whereClauseExcludingDistrict,
      filterTypes,
    });
    const queryStr = query.sql;

    // Type and district counts now use dedicated CTEs for faceted counting
    expect(queryStr).toContain('type_filter_resources');
    expect(queryStr).toContain(
      'COUNT(tfr.recreation_resource_type_code)::INT AS count',
    );
    expect(queryStr).toContain('district_filter_resources');
    expect(queryStr).toContain('COUNT(dfr.district_code)::INT AS count');

    // Access still uses CASE statements
    expect(queryStr).toContain(
      'WHEN ? THEN (SELECT COUNT(*) FROM recreation_resource_search_view WHERE access_code = acv.access_code AND display_on_public_site = true  )::INT',
    );

    expect(query.values).toContain('AC1');
  });

  it('should handle empty where clause', () => {
    const query = buildFilterOptionCountsQuery({
      whereClause: Prisma.empty,
      whereClauseExcludingType: Prisma.empty,
      whereClauseExcludingDistrict: Prisma.empty,
    });

    expect(query.sql).toContain('FROM recreation_resource_search_view');

    // Should not contain any WHERE clause in filtered_resources
    expect(query.sql).toMatch(/WITH filtered_resources AS \(\s*SELECT/);
  });

  it('should include text search condition when searchText is provided', () => {
    const whereClause = Prisma.sql`WHERE 1=1`;
    const whereClauseExcludingType = Prisma.sql`WHERE 1=1`;
    const whereClauseExcludingDistrict = Prisma.sql`WHERE 1=1`;
    const searchText = 'lake';
    const query = buildFilterOptionCountsQuery({
      whereClause,
      whereClauseExcludingType,
      whereClauseExcludingDistrict,
      searchText,
    });

    // Should include ilike for name and closest_community
    expect(query.sql).toContain('name ilike');
    expect(query.sql).toContain('closest_community ilike');
    expect(query.values).toContain('%lake%');
  });

  it('should include location filter when lat and lon are provided', () => {
    const whereClause = Prisma.sql`WHERE 1=1`;
    const whereClauseExcludingType = Prisma.sql`WHERE 1=1`;
    const whereClauseExcludingDistrict = Prisma.sql`WHERE 1=1`;
    const lat = 49.1;
    const lon = -123.1;
    const query = buildFilterOptionCountsQuery({
      whereClause,
      whereClauseExcludingType,
      whereClauseExcludingDistrict,
      lat,
      lon,
    });

    expect(query.sql).toContain('ST_DWithin');
    expect(query.values).toContain(-123.1);
    expect(query.values).toContain(49.1);
  });

  it('should handle all filterTypes flags as false', () => {
    const whereClause = Prisma.sql`WHERE 1=1`;
    const whereClauseExcludingType = Prisma.sql`WHERE 1=1`;
    const whereClauseExcludingDistrict = Prisma.sql`WHERE 1=1`;
    const filterTypes = {
      isOnlyDistrictFilter: false,
      isOnlyAccessFilter: false,
      isOnlyTypeFilter: false,
      isOnlyStatusFilter: false,
      isOnlyFeesFilter: false,
    };
    const query = buildFilterOptionCountsQuery({
      whereClause,
      whereClauseExcludingType,
      whereClauseExcludingDistrict,
      filterTypes,
    });

    // Access still uses CASE statements with ELSE branch
    expect(query.sql).toContain('ELSE COUNT(fr.access_code)::INT');
    // Type and district now always use their dedicated CTEs
    expect(query.sql).toContain(
      'COUNT(tfr.recreation_resource_type_code)::INT',
    );
    expect(query.sql).toContain('COUNT(dfr.district_code)::INT');
  });

  it('should work with all parameters provided', () => {
    const whereClause = Prisma.sql`WHERE access_code = ${'AC2'}`;
    const whereClauseExcludingType = Prisma.sql`WHERE access_code = ${'AC2'}`;
    const whereClauseExcludingDistrict = Prisma.sql`WHERE access_code = ${'AC2'}`;
    const searchText = 'park';
    const filterTypes = {
      isOnlyDistrictFilter: true,
      isOnlyAccessFilter: false,
      isOnlyTypeFilter: true,
      isOnlyStatusFilter: false,
      isOnlyFeesFilter: false,
    };
    const lat = 50.0;
    const lon = -120.0;
    const query = buildFilterOptionCountsQuery({
      whereClause,
      whereClauseExcludingType,
      whereClauseExcludingDistrict,
      searchText,
      filterTypes,
      lat,
      lon,
    });

    expect(query.sql).toContain('name ilike');
    expect(query.sql).toContain('ST_DWithin');
    expect(query.values).toContain('AC2');
    expect(query.values).toContain('%park%');
    expect(query.values).toContain(50.0);
    expect(query.values).toContain(-120.0);
    expect(query.sql).toContain('ELSE COUNT(fr.access_code)::INT');
    expect(query.sql).toContain('type_filter_resources');
    expect(query.sql).toContain('district_filter_resources');
  });
});
