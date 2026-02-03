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
});
