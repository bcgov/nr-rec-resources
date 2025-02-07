const recreationResource1 = {
  rec_resource_id: "REC0001",
  name: "Rec site 1",
  description: "Rec site 1 description",
  closest_community: "Rec site 1 location",
  display_on_public_site: true,

  recreation_activity: [
    {
      with_description: {
        recreation_activity_code: 32,
        description: "Camping",
      },
    },
  ],
  recreation_status: {
    recreation_status_code: {
      description: "Open",
    },
    comment: "Site is open comment",
    status_code: 1,
  },
  campsite_count: 10,
  recreation_resource_type_code: {
    description: "Recreation Site",
  },
};

const recreationResource1Response = {
  ...recreationResource1,
  recreation_activity: [
    {
      description: "Camping",
      recreation_activity_code: 32,
    },
  ],
  recreation_status: {
    description: "Open",
    comment: "Site is open comment",
    status_code: 1,
  },
  campsite_count: 10,
  rec_resource_type: "Recreation Site",
};

const recreationResource2 = {
  rec_resource_id: "REC0002",
  name: "Rec site 2",
  description: "Rec site 2 description",
  closest_community: "Rec site 2 location",
  display_on_public_site: true,
  recreation_activity: [],
  recreation_status: {
    recreation_status_code: {
      description: "Closed",
    },
    comment: "Site is closed comment",
    status_code: 2,
  },
  campsite_count: 10,
  recreation_resource_type_code: {
    description: "Interpretive Forest",
  },
};

const recreationResource2Response = {
  ...recreationResource2,
  recreation_activity: [],
  recreation_status: {
    description: "Closed",
    comment: "Site is closed comment",
    status_code: 2,
  },
  campsite_count: 10,
  rec_resource_type: "Interpretive Forest",
};

const recreationResource3 = {
  rec_resource_id: "REC0003",
  name: "A testing orderBy",
  description: "Rec site 3 description",
  closest_community: "Rec site 3 location",
  display_on_public_site: true,
  recreation_activity: [
    {
      with_description: {
        recreation_activity_code: 9,
        description: "Picnicking",
      },
    },
  ],
  recreation_status: {
    recreation_status_code: {
      description: "Active",
    },
    comment: "Site is active comment",
    status_code: 1,
  },
  campsite_count: 10,
  recreation_resource_type_code: {
    description: "Recreation Trail",
  },
};

const recreationResource3Response = {
  ...recreationResource3,
  recreation_activity: [
    {
      description: "Picnicking",
      recreation_activity_code: 9,
    },
  ],
  recreation_status: {
    description: "Active",
    comment: "Site is active comment",
    status_code: 1,
  },
  campsite_count: 10,
  rec_resource_type: "Recreation Trail",
};

const recreationResource4 = {
  rec_resource_id: "REC0004",
  name: "Z testing orderBy",
  description: "Rec site 4 description",
  closest_community: "Rec site 4 location",
  display_on_public_site: false,
  recreation_activity: [
    {
      with_description: {
        recreation_activity_code: 1,
        description: "Angling",
      },
    },
    {
      with_description: {
        recreation_activity_code: 4,
        description: "Kayaking",
      },
    },
    {
      with_description: {
        recreation_activity_code: 3,
        description: "Canoeing",
      },
    },
  ],
  recreation_status: null,
  campsite_count: 10,
  recreation_resource_type_code: {
    description: "Recreation Site",
  },
};

const recreationResource4Response = {
  ...recreationResource4,
  recreation_activity: [
    {
      description: "Angling",
      recreation_activity_code: 1,
    },
    {
      description: "Kayaking",
      recreation_activity_code: 4,
    },
    {
      description: "Canoeing",
      recreation_activity_code: 3,
    },
  ],
  recreation_status: {
    description: undefined,
    comment: undefined,
    status_code: undefined,
  },
  campsite_count: 10,
  rec_resource_type: "Recreation Site",
};

const recResourceArray = [
  recreationResource1,
  recreationResource2,
  recreationResource3,
  recreationResource4,
];

const orderedRecresourceArray = [
  recreationResource3,
  recreationResource1,
  recreationResource2,
  recreationResource4,
];

const recresourceArrayResolved = [
  recreationResource1Response,
  recreationResource2Response,
  recreationResource3Response,
  recreationResource4Response,
];

const totalRecordIds = [
  { rec_resource_id: "REC0001" },
  { rec_resource_id: "REC0002" },
  { rec_resource_id: "REC0003" },
  { rec_resource_id: "REC0004" },
];

const allActivityCodes = [
  {
    recreation_activity_code: 22,
    with_description: { description: "Snowmobiling" },
  },
  {
    recreation_activity_code: 9,
    with_description: { description: "Picnicking" },
  },
  {
    recreation_activity_code: 1,
    with_description: { description: "Angling" },
  },
  {
    recreation_activity_code: 4,
    with_description: { description: "Kayaking" },
  },
  {
    recreation_activity_code: 3,
    with_description: { description: "Canoeing" },
  },
];

const groupActivityCodes = [
  {
    _count: { recreation_activity_code: 5 },
    recreation_activity_code: 24,
  },
  {
    _count: { recreation_activity_code: 2 },
    recreation_activity_code: 8,
  },
  {
    _count: { recreation_activity_code: 1 },
    recreation_activity_code: 19,
  },
  {
    _count: { recreation_activity_code: 1 },
    recreation_activity_code: 4,
  },
  {
    _count: { recreation_activity_code: 4 },
    recreation_activity_code: 14,
  },
  {
    _count: { recreation_activity_code: 5 },
    recreation_activity_code: 3,
  },
];

const recResourceTypeCountsResolved = {
  label: "Resource Type",
  options: [
    {
      count: 6,
      description: "Interpretive Forest",
      id: "IF",
    },
    {
      count: 4,
      description: "Recreation Reserve",
      id: "RR",
    },
    {
      count: 37,
      description: "Recreation Trail",
      id: "RTR",
    },
    {
      count: 4,
      description: "Recreation Site",
      id: "SIT",
    },
  ],
  param: "type",
  type: "multi-select",
};

const noSearchResultsFilterArray = [
  { ...recResourceTypeCountsResolved },
  {
    label: "Things to do",
    options: [
      {
        count: 0,
        description: "Snowmobiling",
        id: 22,
      },
      {
        count: 0,
        description: "Picnicking",
        id: 9,
      },
      {
        count: 0,
        description: "Angling",
        id: 1,
      },
      {
        count: 0,
        description: "Kayaking",
        id: 4,
      },
      {
        count: 0,
        description: "Canoeing",
        id: 3,
      },
    ],
    param: "activities",
    type: "multi-select",
  },
];

const recResourceTypeCounts = [
  {
    rec_resource_type_code: "IF",
    description: "Interpretive Forest",
    _count: { recreation_resource: 6 },
  },
  {
    rec_resource_type_code: "RR",
    description: "Recreation Reserve",
    _count: { recreation_resource: 4 },
  },
  {
    rec_resource_type_code: "RTR",
    description: "Recreation Trail",
    _count: { recreation_resource: 37 },
  },
  {
    rec_resource_type_code: "SIT",
    description: "Recreation Site",
    _count: { recreation_resource: 4 },
  },
];

export {
  recreationResource1,
  recreationResource1Response,
  recreationResource2,
  recreationResource2Response,
  recreationResource3,
  recreationResource3Response,
  recreationResource4,
  recreationResource4Response,
  recResourceArray,
  orderedRecresourceArray,
  recresourceArrayResolved,
  totalRecordIds,
  allActivityCodes,
  groupActivityCodes,
  recResourceTypeCountsResolved,
  recResourceTypeCounts,
  noSearchResultsFilterArray,
};
