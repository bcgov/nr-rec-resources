import { EXCLUDED_ACTIVITY_CODES } from 'src/recreation-resource/constants/service.constants';

export const getRecreationResourceSelect = () => ({
  rec_resource_id: true,
  name: true,
  closest_community: true,
  display_on_public_site: true,
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
  recreation_resource_type_view_public: {
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
    where: {
      recreation_activity_code: {
        notIn: EXCLUDED_ACTIVITY_CODES,
      },
    },
  },
  recreation_activity_code_trails: {
    select: {
      recreation_activity_code: true,
      trail_type: true,
      name: true,
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
      comment: true,
      status_code: true,
    },
  },
  recreation_fee: {
    where: {
      is_deleted: false,
    } as any,
    select: {
      fee_amount: true,
      fee_start_date: true,
      fee_end_date: true,
      monday_ind: true,
      tuesday_ind: true,
      wednesday_ind: true,
      thursday_ind: true,
      friday_ind: true,
      saturday_ind: true,
      sunday_ind: true,
      recreation_fee_code: true,
      recreation_fee_sub_code: true,
      recurring_ind: true,
      recurring_start_mmdd: true,
      recurring_end_mmdd: true,
      with_description: {
        select: {
          description: true,
        },
      },
    },
  },
  recreation_resource_image: {
    select: {
      image_id: true,
    },
  },
  recreation_structure: {
    select: {
      recreation_structure_code: {
        select: {
          description: true,
        },
      },
    },
  },
  recreation_resource_document: {
    where: {
      doc_code: 'RM',
    },
    select: {
      doc_id: true,
      doc_code: true,
      file_name: true,
      extension: true,
      recreation_resource_doc_code: {
        select: {
          description: true,
        },
      },
    },
  },
  recreation_district_code: {
    select: {
      district_code: true,
      description: true,
    },
  },
  recreation_resource_reservation_info: {
    select: {
      reservation_website: true,
      reservation_phone_number: true,
      reservation_email: true,
    },
  },
  _count: {
    select: {
      recreation_defined_campsite: true,
    },
  },
  act_advisories_flat: {
    select: {
      advisory_number: true,
      title: true,
      description: true,
      submitted_by: true,
      access_status_name: true,
      access_status_grouplabel: true,
      access_status_description: true,
      event_type: true,
      urgency: true,
      advisory_status: true,
      is_reservations_affected: true,
      is_advisory_date_displayed: true,
      is_effective_date_displayed: true,
      is_end_date_displayed: true,
      is_updated_date_displayed: true,
      advisory_date: true,
      effective_date: true,
      end_date: true,
      expiry_date: true,
      updated_date: true,
      published_at: true,
      listing_rank: true,
      urgency_sequence: true,
      access_status_precedence: true,
      event_type_precedence: true,
    },
    orderBy: [
      {
        listing_rank: 'desc',
      },
      {
        urgency_sequence: 'desc',
      },
      {
        access_status_precedence: 'asc',
      },
      {
        event_type_precedence: 'asc',
      },
      {
        advisory_date: 'desc',
      },
    ] as const,
  },
});
