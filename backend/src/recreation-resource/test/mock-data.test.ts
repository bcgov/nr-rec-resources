const recreationResource1 = {
  rec_resource_id: "REC0001",
  name: "Rec site 1",
  description: "Rec site 1 description",
  closest_community: "Rec site 1 location",
  display_on_public_site: true,

  recreation_activity: [
    {
      recreation_activity: {
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
  recreation_campsite: {
    rec_resource_id: "123",
    campsite_count: 2,
  },
  recreation_resource_type: {
    recreation_resource_type_code: {
      rec_resource_type_code: "SIT",
      description: "Recreation Site",
    },
  },
  recreation_fee: {
    fee_description: "Camping Fee",
    with_description: { description: "Camping Fee" },
    fee_amount: 25.0,
    fee_start_date: new Date("2024-06-01"),
    fee_end_date: new Date("2024-09-30"),
    recreation_fee_code: 2,
    monday_ind: "Y",
    tuesday_ind: "Y",
    wednesday_ind: "Y",
    thursday_ind: "Y",
    friday_ind: "Y",
    saturday_ind: "N",
    sunday_ind: "N",
  },
  recreation_resource_images: [
    {
      ref_id: "1000",
      caption: "Campground facilities",
      recreation_resource_image_variants: [
        {
          width: 1920,
          height: 1080,
          url: "https://example.com/images/campground1.jpg",
          size_code: "llc",
          extension: "jpg",
        },
        {
          width: 1920,
          height: 1080,
          url: "https://example.com/images/campground2.jpg",
          size_code: "thm",
          extension: "jpg",
        },
      ],
    },
  ],
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
  recreation_campsite: {
    rec_resource_id: "123",
    campsite_count: 2,
  },
  rec_resource_type: "Recreation Site",
  recreation_fee: {
    ...recreationResource1.recreation_fee,
    with_description: undefined,
  },
  recreation_resource_images: [
    {
      ref_id: "1000",
      caption: "Campground facilities",
      recreation_resource_image_variants: [
        {
          width: 1920,
          height: 1080,
          url: "https://example.com/images/campground1.jpg",
          size_code: "llc",
          extension: "jpg",
        },
        {
          width: 1920,
          height: 1080,
          url: "https://example.com/images/campground2.jpg",
          size_code: "thm",
          extension: "jpg",
        },
      ],
    },
  ],
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
  recreation_campsite: {
    rec_resource_id: "123",
    campsite_count: 2,
  },
  recreation_resource_type: {
    recreation_resource_type_code: {
      rec_resource_type_code: "IF",
      description: "Interpretive Forest",
    },
  },
  recreation_resource_images: [
    {
      ref_id: "1001",
      caption: "Trail views",
      recreation_resource_image_variants: [
        {
          width: 1920,
          height: 1080,
          url: "https://example.com/images/trail1.jpg",
          size_code: "llc",
          extension: "jpg",
        },
      ],
    },
  ],
  recreation_fee: {
    fee_description: "Camping Fee",
    with_description: { description: "Camping Fee" },
    fee_amount: 25.0,
    fee_start_date: new Date("2024-06-01"),
    fee_end_date: new Date("2024-09-30"),
    recreation_fee_code: 2,
    monday_ind: "Y",
    tuesday_ind: "Y",
    wednesday_ind: "Y",
    thursday_ind: "Y",
    friday_ind: "Y",
    saturday_ind: "N",
    sunday_ind: "N",
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
  recreation_campsite: {
    rec_resource_id: "123",
    campsite_count: 2,
  },
  rec_resource_type: "Interpretive Forest",
  recreation_fee: {
    ...recreationResource1.recreation_fee,
    with_description: undefined,
  },
  recreation_resource_images: [
    {
      ref_id: "1001",
      caption: "Trail views",
      recreation_resource_image_variants: [
        {
          width: 1920,
          height: 1080,
          url: "https://example.com/images/trail1.jpg",
          size_code: "llc",
          extension: "jpg",
        },
      ],
    },
  ],
};

const recreationResource3 = {
  rec_resource_id: "REC0003",
  name: "A testing orderBy",
  description: "Rec site 3 description",
  closest_community: "Rec site 3 location",
  display_on_public_site: true,
  recreation_activity: [
    {
      recreation_activity: {
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
  recreation_campsite: {
    rec_resource_id: "123",
    campsite_count: 2,
  },
  recreation_resource_type: {
    recreation_resource_type_code: {
      rec_resource_type_code: "RTR",
      description: "Recreation Trail",
    },
  },
  recreation_fee: {
    fee_description: "Camping Fee",
    with_description: { description: "Camping Fee" },
    fee_amount: 25.0,
    fee_start_date: new Date("2024-06-01"),
    fee_end_date: new Date("2024-09-30"),
    recreation_fee_code: 2,
    monday_ind: "Y",
    tuesday_ind: "Y",
    wednesday_ind: "Y",
    thursday_ind: "Y",
    friday_ind: "Y",
    saturday_ind: "N",
    sunday_ind: "N",
  },
  recreation_resource_images: [
    {
      ref_id: "1002",
      caption: "Forest area",
      recreation_resource_image_variants: [
        {
          width: 1920,
          height: 1080,
          url: "https://example.com/images/forest1.jpg",
          size_code: "llc",
          extension: "jpg",
        },
        {
          width: 1920,
          height: 1080,
          url: "https://example.com/images/forest2.jpg",
          size_code: "thm",
          extension: "jpg",
        },
      ],
    },
  ],
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
  recreation_campsite: {
    rec_resource_id: "123",
    campsite_count: 2,
  },
  rec_resource_type: "Recreation Trail",
  recreation_fee: {
    ...recreationResource1.recreation_fee,
    with_description: undefined,
  },
  recreation_resource_images: [
    {
      ref_id: "1002",
      caption: "Forest area",
      recreation_resource_image_variants: [
        {
          width: 1920,
          height: 1080,
          url: "https://example.com/images/forest1.jpg",
          size_code: "llc",
          extension: "jpg",
        },
        {
          width: 1920,
          height: 1080,
          url: "https://example.com/images/forest2.jpg",
          size_code: "thm",
          extension: "jpg",
        },
      ],
    },
  ],
};

const recreationResource4 = {
  rec_resource_id: "REC0004",
  name: "Z testing orderBy",
  description: "Rec site 4 description",
  closest_community: "Rec site 4 location",
  display_on_public_site: false,
  recreation_activity: [
    {
      recreation_activity: {
        recreation_activity_code: 1,
        description: "Angling",
      },
    },
    {
      recreation_activity: {
        recreation_activity_code: 4,
        description: "Kayaking",
      },
    },
    {
      recreation_activity: {
        recreation_activity_code: 3,
        description: "Canoeing",
      },
    },
  ],
  recreation_status: null,
  recreation_campsite: {
    rec_resource_id: "123",
    campsite_count: 2,
  },
  recreation_resource_type: {
    recreation_resource_type_code: {
      rec_resource_type_code: "SIT",
      description: "Recreation Site",
    },
  },
  recreation_fee: {
    fee_description: "Camping Fee",
    with_description: { description: "Camping Fee" },
    fee_amount: 25.0,
    fee_start_date: new Date("2024-06-01"),
    fee_end_date: new Date("2024-09-30"),
    recreation_fee_code: 2,
    monday_ind: "Y",
    tuesday_ind: "Y",
    wednesday_ind: "Y",
    thursday_ind: "Y",
    friday_ind: "Y",
    saturday_ind: "N",
    sunday_ind: "N",
  },
  recreation_resource_images: [
    {
      ref_id: "1003",
      caption: "",
      recreation_resource_image_variants: [
        {
          width: 1920,
          height: 1080,
          url: "https://example.com/images/riverside1.jpg",
          size_code: "llc",
          extension: "jpg",
        },
      ],
    },
  ],
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
  recreation_campsite: {
    rec_resource_id: "123",
    campsite_count: 2,
  },
  rec_resource_type: "Recreation Site",
  recreation_fee: {
    ...recreationResource1.recreation_fee,
    with_description: undefined,
  },
  recreation_resource_images: [
    {
      ref_id: "1003",
      caption: "",
      recreation_resource_image_variants: [
        {
          width: 1920,
          height: 1080,
          url: "https://example.com/images/riverside1.jpg",
          size_code: "llc",
          extension: "jpg",
        },
      ],
    },
  ],
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

const facilitiesResolved = {
  label: "Facilities",
  options: [
    { id: "toilet", description: "Toilets", count: 10 },
    { id: "table", description: "Tables", count: 9 },
  ],
  param: "facilities",
  type: "multi-select",
};

const activityCounts = [
  {
    recreation_activity_code: 1,
    description: "Angling",
    _count: { recreation_activity: 7 },
  },
  {
    recreation_activity_code: 2,
    description: "Boating",
    _count: { recreation_activity: 2 },
  },
  {
    recreation_activity_code: 3,
    description: "Canoeing",
    _count: { recreation_activity: 2 },
  },
  {
    recreation_activity_code: 4,
    description: "Kayaking",
    _count: { recreation_activity: 1 },
  },
];

const activityCountsNoResults = [
  {
    recreation_activity_code: 1,
    description: "Angling",
    _count: { recreation_activity: 0 },
  },
  {
    recreation_activity_code: 2,
    description: "Boating",
    _count: { recreation_activity: 0 },
  },
  {
    recreation_activity_code: 4,
    description: "Kayaking",
    _count: { recreation_activity: 0 },
  },
  {
    recreation_activity_code: 3,
    description: "Canoeing",
    _count: { recreation_activity: 0 },
  },
];

const activitiesFilterResolved = {
  label: "Things to do",
  type: "multi-select",
  param: "activities",
  options: [
    {
      count: 7,
      description: "Angling",
      id: "1",
    },
    {
      count: 2,
      description: "Boating",
      id: "2",
    },
    {
      count: 2,
      description: "Canoeing",
      id: "3",
    },
    {
      count: 1,
      description: "Kayaking",
      id: "4",
    },
  ],
};

const recResourceTypeCounts = [
  {
    rec_resource_type_code: "IF",
    description: "Interpretive Forest",
    _count: { recreation_resource_type: 6 },
  },
  {
    rec_resource_type_code: "RR",
    description: "Recreation Reserve",
    _count: { recreation_resource_type: 4 },
  },
  {
    rec_resource_type_code: "RTR",
    description: "Recreation Trail",
    _count: { recreation_resource_type: 37 },
  },
  {
    rec_resource_type_code: "SIT",
    description: "Recreation Site",
    _count: { recreation_resource_type: 4 },
  },
];

const recreationDistrictCounts = [
  {
    district_code: "RDMH",
    description: "100 Mile-Chilcotin",
    _count: { recreation_resource: 1 },
  },
  {
    district_code: "RDCS",
    description: "Cascades",
    _count: { recreation_resource: 0 },
  },
  {
    district_code: "RDCK",
    description: "Chilliwack",
    _count: { recreation_resource: 0 },
  },
  {
    district_code: "RDCO",
    description: "Columbia-Shuswap",
    _count: { recreation_resource: 0 },
  },
];

const recreationAccessCounts = [
  {
    access_code: "B",
    description: "Boat-in",
    _count: { recreation_access: 17 },
  },
  {
    access_code: "F",
    description: "Fly-in",
    _count: { recreation_access: 13 },
  },
  {
    access_code: "R",
    description: "Road",
    _count: { recreation_access: 16 },
  },
  {
    access_code: "T",
    description: "Trail",
    _count: { recreation_access: 17 },
  },
];

const recResourceTypeFilterResolved = {
  label: "Type",
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

const districtFilterResolved = {
  label: "District",
  options: [
    { id: "RDMH", description: "100 Mile-Chilcotin", count: 1 },
    { id: "RDCS", description: "Cascades", count: 0 },
    { id: "RDCK", description: "Chilliwack", count: 0 },
    { id: "RDCO", description: "Columbia-Shuswap", count: 0 },
  ],
  param: "district",
  type: "multi-select",
};

const facilitiesFilterResolved = {
  label: "Facilities",
  options: [
    { id: "toilet", description: "Toilets", count: 10 },
    { id: "table", description: "Tables", count: 9 },
  ],
  param: "facilities",
  type: "multi-select",
};

const facilitiesFilterNoResultsResolved = {
  label: "Facilities",
  options: [
    { id: "toilet", description: "Toilets", count: 0 },
    { id: "table", description: "Tables", count: 0 },
  ],
  param: "facilities",
  type: "multi-select",
};

const accessFilterResolved = {
  label: "Access Type",
  options: [
    { id: "B", description: "Boat-in Access", count: 17 },
    { id: "F", description: "Fly-in Access", count: 13 },
    { id: "R", description: "Road Access", count: 16 },
    { id: "T", description: "Trail Access", count: 17 },
  ],
  param: "access",
  type: "multi-select",
};

const noSearchResultsFilterArray = [
  { ...districtFilterResolved },
  { ...recResourceTypeFilterResolved },
  {
    label: "Things to do",
    options: [
      {
        count: 0,
        description: "Angling",
        id: "1",
      },
      {
        count: 0,
        description: "Boating",
        id: "2",
      },
      {
        count: 0,
        description: "Kayaking",
        id: "4",
      },
      {
        count: 0,
        description: "Canoeing",
        id: "3",
      },
    ],
    param: "activities",
    type: "multi-select",
  },
  { ...facilitiesFilterNoResultsResolved },
  { ...accessFilterResolved },
];

const searchResultsFilterArray = [
  { ...districtFilterResolved },
  { ...recResourceTypeFilterResolved },
  { ...activitiesFilterResolved },
  { ...facilitiesFilterResolved },
  { ...accessFilterResolved },
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
  activityCounts,
  activityCountsNoResults,
  recResourceTypeCounts,
  noSearchResultsFilterArray,
  recreationDistrictCounts,
  recreationAccessCounts,
  facilitiesResolved,
  recResourceTypeFilterResolved,
  districtFilterResolved,
  activitiesFilterResolved,
  facilitiesFilterResolved,
  accessFilterResolved,
  searchResultsFilterArray,
};
