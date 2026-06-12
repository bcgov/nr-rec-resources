// Prisma 7 rejects readonly arrays in orderBy, but `as const` makes them readonly.
// This strips readonly recursively so the selects stay compatible with Prisma query types.
type DeepWritable<T> =
  T extends ReadonlyArray<infer U>
    ? DeepWritable<U>[]
    : T extends object
      ? { -readonly [K in keyof T]: DeepWritable<T[K]> }
      : T;

const _baseRecreationResourceSelect = {
  rec_resource_id: true,
  name: true,
  closest_community: true,
  project_established_date: true,
  display_on_public_site: true,
  rec_status_code: true,
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
          recreation_activity_code: true,
          description: true,
          is_accessible: true,
          details: true,
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
    where: {
      is_deleted: false,
    } as any,
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
  act_advisories_flat: {
    orderBy: [
      { listing_rank: 'desc' },
      { urgency_sequence: 'desc' },
      { access_status_precedence: 'asc' },
      { updated_date: 'desc' },
      { advisory_date: 'desc' },
      { event_type_precedence: 'asc' },
    ],
    take: 1,
    select: { access_status_grouplabel: true },
  },
} as const;

export const adminSearchSelect =
  _baseRecreationResourceSelect as unknown as DeepWritable<
    typeof _baseRecreationResourceSelect
  >;

const _recreationResourceSelect = {
  ..._baseRecreationResourceSelect,
  maintenance_standard_code: true,
  right_of_way: true,
  rec_status_code: true,
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

export const recreationResourceSelect =
  _recreationResourceSelect as unknown as DeepWritable<
    typeof _recreationResourceSelect
  >;
