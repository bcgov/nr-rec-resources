import { SearchResultsStore } from '@/store/searchResults';

export const activitiesOptions = [
  {
    id: 22,
    count: 9,
    description: 'Snowmobiling',
    hasFocus: false,
  },
  {
    id: 1,
    count: 14,
    description: 'Angling',
    hasFocus: false,
  },
  {
    id: 3,
    count: 5,
    description: 'Canoeing',
    hasFocus: false,
  },
  {
    id: 32,
    count: 12,
    description: 'Camping',
    hasFocus: false,
  },
];

export const mockFilterMenuContent = [
  {
    type: 'multi-select',
    label: 'Activities',
    param: 'activities',
    options: activitiesOptions,
  },
  {
    type: 'multi-select',
    label: 'Status',
    param: 'status',
    options: [
      {
        id: 1,
        count: 8,
        description: 'Open',
      },
      {
        id: 2,
        count: 5,
        description: 'Closed',
      },
    ],
  },
];

export const mockSearchResultsData: SearchResultsStore = {
  pages: [
    {
      data: [
        {
          rec_resource_id: '1',
          name: 'Resource 1',
          description: 'Description 1',
          closest_community: 'Community 1',
          recreation_access: ['Access 1'],
          recreation_activity: [],
          recreation_status: {
            status_code: 1,
            comment: null,
            description: 'Open',
          },
          rec_resource_type: 'Type 1',
          recreation_resource_images: [],
          recreation_campsite: {
            rec_resource_id: '1',
            campsite_count: 10,
          },
          recreation_fee: [],
          recreation_structure: {
            has_toilet: true,
            has_table: true,
          },
        },
        {
          rec_resource_id: '2',
          name: 'Resource 2',
          description: 'Description 2',
          closest_community: 'Community 2',
          recreation_access: ['Access 2'],
          recreation_activity: [],
          recreation_status: {
            status_code: 2,
            comment: null,
            description: 'Closed',
          },
          rec_resource_type: 'Type 2',
          recreation_resource_images: [],
          recreation_campsite: {
            rec_resource_id: '2',
            campsite_count: 20,
          },
          recreation_fee: [],
          recreation_structure: {
            has_toilet: true,
            has_table: true,
          },
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
      filters: [],
    },
  ],
  filters: [],
  totalCount: 1,
  currentPage: 1,
  pageParams: [],
};
export const mockFilterChips = [
  {
    param: 'district',
    id: 'RDMH',
    label: '100 Mile-Chilcotin',
  },
  {
    param: 'district',
    id: 'RDCK',
    label: 'Chilliwack',
  },
  {
    param: 'type',
    id: 'SIT',
    label: 'Recreation Site',
  },
];
