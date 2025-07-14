import {
  RecreationResourceDetailDto,
  RecreationResourceMaintenanceStandardCode,
} from "../dtos/recreation-resource-detail.dto";
import { RecreationResourceGetPayload } from "../recreation-resource.types";
import { OPEN_STATUS } from "../recreation-resource.constants";

/**
 * Formats recreation resource detail results to match the RecreationResourceDetailDto.
 */

export function formatRecreationResourceDetailResults({
  recreation_district_code,
  ...result
}: RecreationResourceGetPayload): RecreationResourceDetailDto {
  const recreationDistrict = recreation_district_code
    ? {
        description: recreation_district_code.description,
        district_code: recreation_district_code.district_code,
      }
    : undefined;

  return {
    rec_resource_id: result.rec_resource_id,
    name: result.name ?? "",
    closest_community: result.closest_community ?? "",
    description: result.recreation_site_description?.description ?? undefined,
    driving_directions:
      result.recreation_driving_direction?.description ?? undefined,
    maintenance_standard_code:
      result?.maintenance_standard_code as RecreationResourceMaintenanceStandardCode,
    rec_resource_type:
      result?.recreation_resource_type_view?.[0]?.description ?? "",
    recreation_access: (result.recreation_access ?? [])
      .map((access) => access.recreation_access_code.description ?? "")
      .filter((desc): desc is string => !!desc),
    recreation_activity: (result.recreation_activity ?? []).map((activity) => ({
      description: activity.recreation_activity.description ?? "",
      recreation_activity_code:
        activity.recreation_activity.recreation_activity_code,
    })),
    recreation_status: {
      description:
        result.recreation_status?.recreation_status_code?.description ??
        OPEN_STATUS.DESCRIPTION,
      comment: result.recreation_status?.comment ?? "",
      status_code:
        result.recreation_status?.status_code ?? OPEN_STATUS.STATUS_CODE,
    },
    campsite_count: result._count?.recreation_defined_campsite ?? 0,
    recreation_structure: {
      has_toilet: Array.isArray((result as any).recreation_structure)
        ? (result as any).recreation_structure.some((s: any) =>
            s.recreation_structure_code.description
              ?.toLowerCase()
              .includes("toilet"),
          )
        : false,
      has_table: Array.isArray((result as any).recreation_structure)
        ? (result as any).recreation_structure.some((s: any) =>
            s.recreation_structure_code.description
              ?.toLowerCase()
              .includes("table"),
          )
        : false,
    },
    recreation_district: recreationDistrict,
  };
}
