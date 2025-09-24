import { describe, expect, it } from 'vitest';
import { buildSearchFilterQuery } from 'src/recreation-resource/utils/buildSearchFilterQuery';
import { Prisma } from '@prisma/client';

const getQueryString = (query: Prisma.Sql) => {
  return query.sql.replace(/\s+/g, ' ').trim();
};

describe('buildSearchFilterQuery', () => {
  it('should generate query with no filters', () => {
    const result = buildSearchFilterQuery({ searchText: '' });
    const queryString = getQueryString(result);
    expect(queryString).toBe('where display_on_public_site is true');
    expect(result.values).toEqual([]);
  });

  it('should generate query with basic text filter', () => {
    const result = buildSearchFilterQuery({ searchText: 'park' });
    const queryString = getQueryString(result);
    expect(queryString).toBe(
      'where display_on_public_site is true and (name ilike ? or closest_community ilike ?)',
    );
    expect(result.values).toEqual(['%park%', '%park%']);
  });

  it('should add access filter correctly', () => {
    const result = buildSearchFilterQuery({ access: 'A1_A2' });
    const queryString = getQueryString(result);
    expect(queryString).toContain('access_code in (?,?)');
    expect(result.values).toEqual(['A1', 'A2']);
  });

  it('should add district filter correctly', () => {
    const result = buildSearchFilterQuery({
      district: 'D1_D2',
    });
    const queryString = getQueryString(result);
    expect(queryString).toContain('district_code in (?,?)');
    expect(result.values).toEqual(['D1', 'D2']);
  });

  it('should add type filter correctly', () => {
    const result = buildSearchFilterQuery({
      type: 'T1_T2',
    });
    const queryString = getQueryString(result);
    expect(queryString).toContain('recreation_resource_type_code in (?,?)');
    expect(result.values).toEqual(['T1', 'T2']);
  });

  it('should add activity filter correctly', () => {
    const result = buildSearchFilterQuery({
      activities: '101_102',
    });
    const queryString = getQueryString(result);
    expect(queryString).toContain(
      "( select count(*) from jsonb_array_elements(recreation_activity) AS activity where (activity->>'recreation_activity_code')::bigint in (?,?) ) = ?",
    );
    expect(result.values).toEqual([101, 102, 2]);
  });

  it('should add facility filter correctly', () => {
    const result = buildSearchFilterQuery({
      facilities: 'F1_F2',
    });
    const queryString = getQueryString(result);
    expect(queryString).toContain(
      "( SELECT COUNT(*) FROM ( SELECT rec_resource_id FROM jsonb_array_elements(recreation_structure) AS facility GROUP BY rec_resource_id HAVING COUNT(*) FILTER ( WHERE facility->>'description' ILIKE ? ) > 0 AND COUNT(*) FILTER ( WHERE facility->>'description' ILIKE ? ) > 0 ) AS filtered_resources ) > 0",
    );
    expect(result.values).toEqual(['%F1%', '%F2%']);
  });

  it('should add status filter correctly', () => {
    const result = buildSearchFilterQuery({ status: 'open_closed' });
    const queryString = getQueryString(result);
    expect(queryString).toContain('recreation_status');
    expect(result.values).toEqual(['open', 'closed']);
  });

  it('should handle all filters combined', () => {
    const result = buildSearchFilterQuery({
      searchText: 'park',
      activities: '101_102',
      type: 'T1_T2',
      district: 'D1_D2',
      access: 'A1_A2',
      facilities: 'F1_F2',
      status: 'open',
    });

    const queryString = getQueryString(result);
    expect(queryString).toContain(
      'where display_on_public_site is true and (name ilike ? or closest_community ilike ?)',
    );
    expect(queryString).toContain('and access_code in');
    expect(queryString).toContain('and district_code in');
    expect(queryString).toContain('and recreation_resource_type_code in');
    expect(queryString).toContain(
      'from jsonb_array_elements(recreation_activity)',
    );
    expect(queryString).toContain('jsonb_array_elements(recreation_structure)');
    expect(queryString).toContain(
      "recreation_status IS NULL OR recreation_status->>'description' IS NULL",
    );

    const expectedValues = [
      '%park%',
      '%park%',
      'A1',
      'A2',
      'D1',
      'D2',
      'T1',
      'T2',
      101,
      102,
      2,
      '%F1%',
      '%F2%',
      'open',
    ];
    expect(result.values).toEqual(expectedValues);
  });

  it('should add location filter correctly', () => {
    const lat = 49.2;
    const lon = -123.1;
    const result = buildSearchFilterQuery({ lat, lon });
    const queryString = getQueryString(result);
    expect(queryString).toContain('ST_DWithin');
    expect(result.values).toEqual([lon, lat, 50000]);
  });

  it('should add fees filter correctly', () => {
    const result = buildSearchFilterQuery({
      fees: 'R_F_NF',
    });

    const queryString = getQueryString(result);
    expect(queryString).toContain('is_reservable = true');
    expect(queryString).toContain('is_fees = true');
    expect(queryString).toContain('(is_fees = false OR is_fees IS NULL)');
  });

  it('should handle lowercase fees filter input', () => {
    const result = buildSearchFilterQuery({
      fees: 'r_f_nf',
    });

    const queryString = getQueryString(result);
    expect(queryString).toContain('is_reservable = true');
    expect(queryString).toContain('is_fees = true');
    expect(queryString).toContain('(is_fees = false OR is_fees IS NULL)');
  });
});
