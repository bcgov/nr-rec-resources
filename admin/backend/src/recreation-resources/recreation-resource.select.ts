const baseRecreationResourceSelect = {
  rec_resource_id: true,
  name: true,
  closest_community: true,
  project_established_date: true,
  display_on_public_site: true,
  recreation_resource_type_view_admin: {
    select: {
      rec_resource_type_code: true,
      description: true,
    },
  },
  recreation_district_code: {
    select: {
      district_code: true,
      description: true,
    },
  },
  recreation_status: {
    select: {
      recreation_status_code: {
        select: {
          description: true,
        },
      },
      status_code: true,
    },
  },
  recreation_activity: {
    select: {
      recreation_activity: {
        select: {
          description: true,
        },
      },
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
  recreation_fee: {
    select: {
      recreation_fee_code: true,
    },
  },
  recreation_resource_reservation_info: {
    select: {
      rec_resource_id: true,
    },
  },
  _count: {
    select: {
      recreation_defined_campsite: true,
    },
  },
} as const;

export const adminSearchSelect = baseRecreationResourceSelect;

export const recreationResourceSelect = {
  ...baseRecreationResourceSelect,
  maintenance_standard_code: true,
  right_of_way: true,
  recreation_maintenance_standard_code: {
    select: {
      description: true,
    },
  },
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
  recreation_access: {
    select: {
      recreation_access_code: {
        select: {
          access_code: true,
          description: true,
        },
      },
      recreation_sub_access_code: {
        select: {
          sub_access_code: true,
          description: true,
        },
      },
    },
  },
  recreation_structure: {
    select: {
      recreation_structure_code: {
        select: {
          structure_code: true,
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
  recreation_risk_rating_code: {
    select: {
      risk_rating_code: true,
      description: true,
    },
  },
  recreation_control_access_code: {
    select: {
      recreation_control_access_code: true,
      description: true,
    },
  },
} as const;
