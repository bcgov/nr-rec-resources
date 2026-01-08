import { describe, it, expect } from 'vitest';
import { getRecreationResourceSelect } from 'src/recreation-resource/utils/getRecreationResourceSelect';
import { EXCLUDED_ACTIVITY_CODES } from 'src/recreation-resource/constants/service.constants';

describe('getRecreationResourceSelect', () => {
  it('should return the correct default selection structure', () => {
    const select = getRecreationResourceSelect();

    expect(select).toMatchObject({
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
      _count: {
        select: {
          recreation_defined_campsite: true,
        },
      },
    });
  });

  it('should include recreation_resource_image selection', () => {
    const select = getRecreationResourceSelect();
    expect(select.recreation_resource_image).toBeDefined();
    expect(select.recreation_resource_image.select.image_id).toBe(true);
  });

  it('should exclude activities with excluded activity codes', () => {
    const select = getRecreationResourceSelect();
    expect(
      select.recreation_activity.where.recreation_activity_code.notIn,
    ).toEqual(EXCLUDED_ACTIVITY_CODES);
  });
});
