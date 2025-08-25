import { describe, expect, it } from 'vitest';
import { Prisma } from '@prisma/client';
import { buildRecreationResourcePageQuery } from './buildRecreationResourcePageQuery';

const type = 'park';
const baseWhereClause = Prisma.sql`where type = ${type}`;

describe('buildRecreationResourcePageQuery', () => {
  describe('without valid location parameters', () => {
    it('builds a basic paginated query', () => {
      const take = 10;
      const skip = 20;
      const query = buildRecreationResourcePageQuery({
        whereClause: baseWhereClause,
        take,
        skip,
      });
      const queryStr = query.sql;

      expect(queryStr).toContain('select rec_resource_id');
      expect(queryStr).toContain('from recreation_resource_search_view');
      expect(queryStr).toContain('where type =');
      expect(queryStr).toContain('order by name asc');
      expect(queryStr).toContain('limit');
      expect(queryStr).toContain('offset');
      expect(queryStr).not.toContain('ST_Distance');

      expect(query.values).toEqual([type, take, skip]);
    });

    it('ignores incomplete location parameters', () => {
      const take = 10;
      const skip = 0;
      const lat = 49.2827; // Missing lon
      const query = buildRecreationResourcePageQuery({
        whereClause: baseWhereClause,
        take,
        skip,
        lat,
      });
      const queryStr = query.sql;

      expect(queryStr).not.toContain('ST_Distance');
      expect(queryStr).toContain('order by name asc');
      expect(query.values).toEqual([type, take, skip]);
    });
  });

  describe('with valid location parameters', () => {
    it('builds a query with location parameters', () => {
      const take = 10;
      const skip = 0;
      const lat = 49.2827;
      const lon = -123.1207;
      const query = buildRecreationResourcePageQuery({
        whereClause: baseWhereClause,
        take,
        skip,
        lat,
        lon,
      });
      const queryStr = query.sql;

      expect(queryStr).toContain('ST_Distance');
      expect(queryStr).toContain('ST_MakePoint');
      expect(queryStr).toContain('as distance');
      expect(queryStr).toContain('order by distance asc, name asc');

      expect(query.values).toEqual([lon, lat, type, take, skip]);
    });
  });
});
