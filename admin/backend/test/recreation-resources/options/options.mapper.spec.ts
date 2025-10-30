import { mapAccessOptions } from '@/recreation-resources/options/options.mapper';
import { describe, expect, it } from 'vitest';

describe('mapAccessOptions', () => {
  it('returns empty array for empty input', () => {
    expect(mapAccessOptions([])).toEqual([]);
  });

  it('maps single access record without sub-access', () => {
    const records = [
      {
        access_code: 'road',
        access_code_description: 'Road access',
      },
    ];

    expect(mapAccessOptions(records)).toEqual([
      { id: 'road', label: 'Road access', children: [] },
    ]);
  });

  it('groups sub-access records under their parent access', () => {
    const records = [
      {
        access_code: 'road',
        access_code_description: 'Road access',
        sub_access_code: 'veh',
        sub_access_code_description: 'Vehicle',
      },
      {
        access_code: 'road',
        access_code_description: 'Road access',
        sub_access_code: 'ped',
        sub_access_code_description: 'Pedestrian',
      },
    ];

    expect(mapAccessOptions(records)).toEqual([
      {
        id: 'road',
        label: 'Road access',
        children: [
          { id: 'veh', label: 'Vehicle' },
          { id: 'ped', label: 'Pedestrian' },
        ],
      },
    ]);
  });

  it('handles duplicate records gracefully', () => {
    const records = [
      {
        access_code: 'road',
        access_code_description: 'Road access',
      },
      {
        access_code: 'road',
        access_code_description: 'Road access',
        sub_access_code: 'veh',
        sub_access_code_description: 'Vehicle',
      },
      {
        access_code: 'road',
        access_code_description: 'Road access',
        sub_access_code: 'veh',
        sub_access_code_description: 'Vehicle',
      },
    ];

    expect(mapAccessOptions(records)).toEqual([
      {
        id: 'road',
        label: 'Road access',
        children: [
          { id: 'veh', label: 'Vehicle' },
          { id: 'veh', label: 'Vehicle' },
        ],
      },
    ]);
  });
});
