export const recreationResourceSelect = {
  rec_resource_id: true,
  name: true,
  closest_community: true,
  maintenance_standard_code: true,
  recreation_site_description: {
    select: {
      description: true,
    },
  },
  recreation_driving_direction: {
    select: {
      description: true,
    },
  },
  recreation_resource_type_view: {
    select: {
      rec_resource_type_code: true,
      description: true,
    },
  },
  recreation_access: {
    select: {
      recreation_access_code: {
        select: {
          description: true,
        },
      },
    },
  },
  recreation_activity: {
    select: {
      recreation_activity: true,
    },
  },
  recreation_status: {
    select: {
      recreation_status_code: {
        select: {
          description: true,
        },
      },
      comment: true,
      status_code: true,
    },
  },
  recreation_district_code: {
    select: {
      district_code: true,
      description: true,
    },
  },
  _count: {
    select: {
      recreation_defined_campsite: true,
    },
  },
};
