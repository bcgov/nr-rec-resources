import { getRecreationResourceSpatialFeatureGeometry } from '@prisma-generated-sql/getRecreationResourceSpatialFeatureGeometry';
import { RecreationResourceDetailDto } from '../dtos/recreation-resource-detail.dto';
import { OPEN_STATUS } from '../recreation-resource.constants';
import { RecreationResourceGetPayload } from '../recreation-resource.types';

/**
 * Formats recreation resource detail results to match the RecreationResourceDetailDto.
 */

export function formatRecreationResourceDetailResults(
  {
    recreation_district_code,
    recreation_risk_rating_code,
    recreation_maintenance_standard_code,
    recreation_control_access_code,
    ...result
  }: RecreationResourceGetPayload,
  recreationResourceSpatialFeatureGeometryResult: getRecreationResourceSpatialFeatureGeometry.Result[] = [],
): RecreationResourceDetailDto {
  const spatialFeatures = recreationResourceSpatialFeatureGeometryResult?.[0];
  const recreationDistrict = recreation_district_code
    ? {
        description: recreation_district_code.description,
        district_code: recreation_district_code.district_code,
      }
    : undefined;

  const riskRating = recreation_risk_rating_code
    ? {
        description: recreation_risk_rating_code.description,
        risk_rating_code: recreation_risk_rating_code.risk_rating_code,
      }
    : undefined;

  const maintenanceStandard = recreation_maintenance_standard_code
    ? {
        maintenance_standard_code: result.maintenance_standard_code!,
        description: recreation_maintenance_standard_code.description,
      }
    : undefined;
  return {
    rec_resource_id: result.rec_resource_id,
    name: result.name ?? '',
    closest_community: result.closest_community ?? '',
    description: result.recreation_site_description?.description ?? undefined,
    driving_directions:
      result.recreation_driving_direction?.description ?? undefined,
    maintenance_standard: maintenanceStandard,
    rec_resource_type:
      result?.recreation_resource_type_view_admin?.[0]?.description ?? '',
    display_on_public_site: result.display_on_public_site ?? undefined,
    access_codes: (() => {
      // Use a Map for O(1) lookups of access codes
      const accessCodeMap = new Map<
        string,
        {
          code: string;
          description: string;
          sub_access_codes: Array<{ code: string; description: string }>;
        }
      >();

      // Process each access record once
      for (const access of result.recreation_access || []) {
        // Access the access code directly from the access record
        const accessCode = access.recreation_access_code.access_code;

        // Use the access code as the description fallback
        const accessDescription = access.recreation_access_code.description!;

        // Get or create the access code entry
        if (!accessCodeMap.has(accessCode)) {
          accessCodeMap.set(accessCode, {
            code: accessCode,
            description: accessDescription,
            sub_access_codes: [],
          });
        }

        // Add sub-access code if it exists
        if (access.recreation_sub_access_code) {
          const entry = accessCodeMap.get(accessCode)!;
          entry.sub_access_codes.push({
            code: access.recreation_sub_access_code.sub_access_code,
            description: access.recreation_sub_access_code.description!, // Use sub-access code as its own description
          });
        }
      }

      // Convert map values to array and sort by access code
      return Array.from(accessCodeMap.values()).sort((a, b) =>
        a.code.localeCompare(b.code),
      );
    })(),
    recreation_activity: (result.recreation_activity ?? []).map((activity) => ({
      description: activity.recreation_activity.description ?? '',
      recreation_activity_code:
        activity.recreation_activity.recreation_activity_code,
    })),
    recreation_status: {
      description:
        result.recreation_status?.recreation_status_code?.description ??
        OPEN_STATUS.DESCRIPTION,
      comment: result.recreation_status?.comment ?? '',
      status_code:
        result.recreation_status?.status_code ?? OPEN_STATUS.STATUS_CODE,
    },
    campsite_count: result._count?.recreation_defined_campsite ?? 0,
    recreation_structure: {
      has_toilet: Array.isArray((result as any).recreation_structure)
        ? (result as any).recreation_structure.some((s: any) =>
            s.recreation_structure_code.description
              ?.toLowerCase()
              .includes('toilet'),
          )
        : false,
      has_table: Array.isArray((result as any).recreation_structure)
        ? (result as any).recreation_structure.some((s: any) =>
            s.recreation_structure_code.description
              ?.toLowerCase()
              .includes('table'),
          )
        : false,
    },
    spatial_feature_geometry:
      spatialFeatures?.spatial_feature_geometry ?? undefined,
    site_point_geometry: spatialFeatures?.site_point_geometry ?? undefined,
    recreation_district: recreationDistrict,
    project_established_date: result.project_established_date ?? undefined,
    recreation_control_access_code: {
      recreation_control_access_code:
        recreation_control_access_code?.recreation_control_access_code ?? '',
      description: recreation_control_access_code?.description ?? '',
    },
    risk_rating: riskRating,
    right_of_way:
      result.right_of_way != null ? Number(result.right_of_way) : undefined,
  };
}
