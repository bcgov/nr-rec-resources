import { describe, it, expect } from "vitest";
import { getRecreationResourceSelect } from "src/recreation-resource/utils/getRecreationResourceSelect";
import { EXCLUDED_ACTIVITY_CODES } from "src/recreation-resource/constants/service.constants";
import { RecreationResourceImageSize } from "src/recreation-resource/dto/recreation-resource-image.dto";

describe("getRecreationResourceSelect", () => {
  it("should return the correct default selection structure", () => {
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
      recreation_map_feature: {
        select: {
          recreation_resource_type_code: {
            select: {
              rec_resource_type_code: true,
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
      recreation_resource_images: {
        select: {
          ref_id: true,
          caption: true,
          recreation_resource_image_variants: {
            select: {
              size_code: true,
              url: true,
              width: true,
              height: true,
              extension: true,
            },
          },
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
      recreation_resource_docs: {
        select: {
          doc_code: true,
          url: true,
          title: true,
          ref_id: true,
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

  it("should filter image variants by provided size codes", () => {
    const imageSizeCodes: RecreationResourceImageSize[] = [
      RecreationResourceImageSize.ORIGINAL,
    ];
    const select = getRecreationResourceSelect(imageSizeCodes);

    expect(
      select.recreation_resource_images.select
        .recreation_resource_image_variants.where.size_code.in,
    ).toEqual(imageSizeCodes);
  });

  it("should handle empty imageSizeCodes by defaulting to an empty array", () => {
    const select = getRecreationResourceSelect();
    expect(
      select.recreation_resource_images.select
        .recreation_resource_image_variants.where.size_code.in,
    ).toEqual([]);
  });

  it("should exclude activities with excluded activity codes", () => {
    const select = getRecreationResourceSelect();
    expect(
      select.recreation_activity.where.recreation_activity_code.notIn,
    ).toEqual(EXCLUDED_ACTIVITY_CODES);
  });
});
