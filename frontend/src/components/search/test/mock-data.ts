export const activitiesOptions = [
  {
    id: 22,
    count: 9,
    description: 'Snowmobiling',
  },
  {
    id: 1,
    count: 14,
    description: 'Angling',
  },
  {
    id: 3,
    count: 5,
    description: 'Canoeing',
  },
  {
    id: 32,
    count: 12,
    description: 'Camping',
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
