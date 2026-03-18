import { describe, expect, it } from 'vitest';
import { mapAdminSearchResultRow } from '@/pages/admin-search-page/searchResultsMapper';
import { AdminSearchResultRowDto } from '@/services/recreation-resource-admin';

const baseRow: AdminSearchResultRowDto = {
  rec_resource_id: 'REC001',
  name: 'BLUE LAKE',
  recreation_resource_type: 'Recreation site',
  recreation_resource_type_code: 'RR',
  district_description: 'Chilliwack',
  display_on_public_site: true,
  closest_community: 'HOPE',
  access_types: ['Walk in'],
  fee_types: ['Has fees'],
  established_date: '2024-06-10',
  campsite_count: 3,
};

describe('mapAdminSearchResultRow', () => {
  it('capitalizes the project name and closest community', () => {
    expect(mapAdminSearchResultRow(baseRow)).toMatchObject({
      projectName: 'Blue Lake',
      closestCommunity: 'Hope',
    });
  });

  it('keeps the community fallback when closest community is empty', () => {
    expect(
      mapAdminSearchResultRow({
        ...baseRow,
        closest_community: '',
      }),
    ).toMatchObject({
      projectName: 'Blue Lake',
      closestCommunity: '-',
    });
  });
});
