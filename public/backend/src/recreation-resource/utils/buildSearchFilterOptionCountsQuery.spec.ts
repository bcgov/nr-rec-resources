import { describe, expect, it } from 'vitest';
import { Prisma } from '@prisma/client';
import { EXCLUDED_ACTIVITY_CODES } from '../constants/service.constants';
import { buildFilterOptionCountsQuery } from './buildSearchFilterOptionCountsQuery';

describe('buildFilterOptionCountsQuery', () => {
  it('should build a SQL query with a where clause and no filter flags', () => {
    const whereClause = Prisma.sql`WHERE district_code = ${'D1'}`;
    const query = buildFilterOptionCountsQuery({ whereClause });

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

  it('should conditionally apply filter flags in CASE statements', () => {
    const whereClause = Prisma.sql`WHERE access_code = ${'AC1'}`;
    const filterTypes = {
      isOnlyDistrictFilter: true,
      isOnlyAccessFilter: true,
      isOnlyTypeFilter: true,
      isOnlyStatusFilter: false,
      isOnlyFeesFilter: false,
    };

    const query = buildFilterOptionCountsQuery({
      whereClause,
      filterTypes,
    });
    const queryStr = query.sql;

    expect(queryStr).toContain(
      'WHEN ? THEN (SELECT COUNT(*) FROM recreation_resource_search_view WHERE district_code = dcv.district_code AND display_on_public_site = true  )::INT',
    );
    expect(queryStr).toContain(
      'WHEN ? THEN (SELECT COUNT(*) FROM recreation_resource_search_view WHERE access_code = acv.access_code AND display_on_public_site = true  )::INT',
    );
    expect(queryStr).toContain(
      'WHEN ? THEN (SELECT COUNT(*) FROM recreation_resource_search_view WHERE recreation_resource_type_code = acv.rec_resource_type_code AND display_on_public_site = true  )::INT',
    );

    expect(query.values).toContain('AC1');
  });

  it('should handle empty where clause', () => {
    const query = buildFilterOptionCountsQuery({ whereClause: Prisma.empty });

    expect(query.sql).toContain('FROM recreation_resource_search_view');

    // Should not contain any WHERE clause in filtered_resources
    expect(query.sql).toMatch(/WITH filtered_resources AS \(\s*SELECT/);
  });

  it('should include text search condition when searchText is provided', () => {
    const whereClause = Prisma.sql`WHERE 1=1`;
    const searchText = 'lake';
    const query = buildFilterOptionCountsQuery({ whereClause, searchText });

    // Should include ilike for name and closest_community
    expect(query.sql).toContain('name ilike');
    expect(query.sql).toContain('closest_community ilike');
    expect(query.values).toContain('%lake%');
  });

  it('should include location filter when lat and lon are provided', () => {
    const whereClause = Prisma.sql`WHERE 1=1`;
    const lat = 49.1;
    const lon = -123.1;
    const query = buildFilterOptionCountsQuery({
      whereClause,
      lat,
      lon,
    });

    expect(query.sql).toContain('ST_DWithin');
    expect(query.values).toContain(-123.1);
    expect(query.values).toContain(49.1);
  });

  it('should handle all filterTypes flags as false', () => {
    const whereClause = Prisma.sql`WHERE 1=1`;
    const filterTypes = {
      isOnlyDistrictFilter: false,
      isOnlyAccessFilter: false,
      isOnlyTypeFilter: false,
      isOnlyStatusFilter: false,
      isOnlyFeesFilter: false,
    };
    const query = buildFilterOptionCountsQuery({ whereClause, filterTypes });

    // Should use ELSE COUNT(...)::INT in all CASE statements
    expect(query.sql).toContain('ELSE COUNT(fr.district_code)::INT');
    expect(query.sql).toContain('ELSE COUNT(fr.access_code)::INT');
    expect(query.sql).toContain(
      'ELSE COUNT(fr.recreation_resource_type_code)::INT',
    );
  });

  it('should work with all parameters provided', () => {
    const whereClause = Prisma.sql`WHERE access_code = ${'AC2'}`;
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
    // Check that both true and false branches are present
    expect(query.sql).toContain(
      'WHEN ? THEN (SELECT COUNT(*) FROM recreation_resource_search_view WHERE district_code = dcv.district_code AND display_on_public_site = true',
    );
    expect(query.sql).toContain('ELSE COUNT(fr.access_code)::INT');
    expect(query.sql).toContain(
      'WHEN ? THEN (SELECT COUNT(*) FROM recreation_resource_search_view WHERE recreation_resource_type_code = acv.rec_resource_type_code AND display_on_public_site = true',
    );
  });
});
