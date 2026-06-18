import {
  RecreationResourceDetailDto,
  RecreationResourceMaintenanceStandardCode,
  TrailType,
} from 'src/recreation-resource/dto/recreation-resource.dto';
import { RecreationResourceGetPayload } from 'src/recreation-resource/service/types';
import { getRecreationResourceSpatialFeatureGeometry } from '@prisma-generated-sql/getRecreationResourceSpatialFeatureGeometry';
import { RecreationResourceDocCode } from 'src/recreation-resource/dto/recreation-resource-doc.dto';
import { OPEN_STATUS } from 'src/recreation-resource/constants/service.constants';
import { RecreationResourceGeometry } from '../dto/recreation-resource-geometry.dto';
import { RecreationResourceImageSize } from '@shared/constants/images';
import { formatImageUrls } from './formatImageUrls';

interface FormatRecreationResourceDetailResultsOptions {
  recResource: RecreationResourceGetPayload;
  spatialFeatureGeometry:
    | getRecreationResourceSpatialFeatureGeometry.Result[]
    | RecreationResourceGeometry;
  rstStorageCloudfrontUrl?: string;
  imageSizeCodes?: RecreationResourceImageSize[];
}

// Top-level recreation fee codes. Sub-categorization (e.g. camping vs cabin
// under Overnight, or parking vs day-use under Additional) is conveyed by
// `recreation_fee_sub_code` on each fee — for example `O/C`, `A/P`, `T/SK`.
const RECREATION_FEE_CODE = {
  OVERNIGHT: 'O',
  TRAIL: 'T',
  ADDITIONAL: 'A',
} as const;

// Categorize each fee into exactly one bucket based on its top-level
// `recreation_fee_code`. Unknown codes fall through to `additional` defensively
// so no fee is silently dropped.
const categorizeFees = (fees: any[]) => {
  const overnight: any[] = [];
  const trail: any[] = [];
  const additional: any[] = [];

  fees.forEach((fee) => {
    switch (fee.recreation_fee_code) {
      case RECREATION_FEE_CODE.OVERNIGHT:
        overnight.push(fee);
        break;
      case RECREATION_FEE_CODE.TRAIL:
        trail.push(fee);
        break;
      case RECREATION_FEE_CODE.ADDITIONAL:
      default:
        additional.push(fee);
    }
  });

  return { overnight, trail, additional };
};

// Map a raw fee record to the common RecreationFeeDto field set
const toFeeDto = (fee: any) => ({
  fee_amount: fee.fee_amount,
  fee_start_date: fee.fee_start_date,
  fee_end_date: fee.fee_end_date,
  monday_ind: fee.monday_ind,
  tuesday_ind: fee.tuesday_ind,
  wednesday_ind: fee.wednesday_ind,
  thursday_ind: fee.thursday_ind,
  friday_ind: fee.friday_ind,
  saturday_ind: fee.saturday_ind,
  sunday_ind: fee.sunday_ind,
  recreation_fee_code: fee.recreation_fee_code,
  recreation_fee_sub_code: fee.recreation_fee_sub_code,
  fee_description: fee.with_description?.description,
  fee_sub_type_description: fee.with_sub_description?.description,
  recurring_ind: fee.recurring_ind,
  recurring_start_mmdd: fee.recurring_start_mmdd,
  recurring_end_mmdd: fee.recurring_end_mmdd,
});

// Map a raw activity record to the common RecreationActivityDto field set
const toActivityDto = (activity: any) => ({
  description: activity.recreation_activity.description,
  details: activity.recreation_activity.details,
  is_accessible: activity.recreation_activity.is_accessible,
  recreation_activity_code:
    activity.recreation_activity.recreation_activity_code,
});

// Returns true when any structure description contains the given substring
const hasStructureType = (structures: any, type: string): boolean =>
  Array.isArray(structures) &&
  structures.some((s: any) =>
    s.recreation_structure_code?.description?.toLowerCase().includes(type),
  );

// Format recreation resource detail results to match the RecreationResourceDetailDto
export const formatRecreationResourceDetailResults = ({
  recResource,
  spatialFeatureGeometry,
  rstStorageCloudfrontUrl = '',
  imageSizeCodes = [
    RecreationResourceImageSize.ORIGINAL,
    RecreationResourceImageSize.PREVIEW,
  ],
}: FormatRecreationResourceDetailResultsOptions): RecreationResourceDetailDto => {
  const { recreation_district_code, ...result } = recResource;
  const RST_STORAGE_CLOUDFRONT_URL = rstStorageCloudfrontUrl;
  const spatialFeatures = Array.isArray(spatialFeatureGeometry)
    ? spatialFeatureGeometry[0]
    : spatialFeatureGeometry;
  const recreationDistrict = recreation_district_code
    ? {
        description: recreation_district_code.description,
        district_code: recreation_district_code.district_code,
      }
    : undefined;

  // Categorize fees
  const { overnight, trail, additional } = categorizeFees(
    result.recreation_fee ?? [],
  );

  const structures = (result as any).recreation_structure;
  const recreationStructure = {
    has_toilet: hasStructureType(structures, 'toilet'),
    has_table: hasStructureType(structures, 'table'),
  };

  return {
    recreation_structure: recreationStructure,
    rec_resource_id: result.rec_resource_id,
    name: result.name,
    closest_community: result.closest_community,
    description: result.recreation_site_description?.description,
    driving_directions: result.recreation_driving_direction?.description,
    maintenance_standard_code:
      result?.maintenance_standard_code as RecreationResourceMaintenanceStandardCode,
    rec_resource_type:
      result?.recreation_resource_type_view_public?.[0].description,
    recreation_access: result.recreation_access?.map(
      (access) => access.recreation_access_code.description,
    ),
    recreation_activity: result.recreation_activity
      ?.filter((activity) => !activity.recreation_activity.is_accessible)
      .map(toActivityDto),
    accessible_recreation_activity: result.recreation_activity
      ?.filter((activity) => activity.recreation_activity.is_accessible)
      .map((activity) => ({
        ...toActivityDto(activity),
        recreation_activity_trails: result.recreation_activity_code_trails
          .filter(
            (trail) =>
              trail.recreation_activity_code ===
              activity.recreation_activity.recreation_activity_code,
          )
          .map((trail) => ({
            trail_type: TrailType[trail.trail_type],
            name: trail.name,
            description: trail.description,
          })),
      })),
    recreation_status: {
      description:
        result.recreation_status?.recreation_status_code.description ??
        OPEN_STATUS.DESCRIPTION,
      comment: result.recreation_status?.comment,
      status_code:
        result.recreation_status?.status_code ?? OPEN_STATUS.STATUS_CODE,
    },
    campsite_count: result._count?.recreation_defined_campsite,
    recreation_resource_images: formatImageUrls({
      images: result.recreation_resource_image ?? [],
      recResourceId: result.rec_resource_id,
      baseUrl: RST_STORAGE_CLOUDFRONT_URL,
      imageSizeCodes,
    }),
    recreation_fee: [],
    overnight_fees: overnight.map(toFeeDto),
    trail_use_fees: trail.map(toFeeDto),
    additional_fees: additional.map(toFeeDto),
    recreation_resource_docs: (
      result.recreation_resource_document as Array<{
        doc_id: string;
        file_name: string;
        doc_code: string;
        extension: string;
        recreation_resource_doc_code: { description: string };
      }>
    ).map((doc) => ({
      doc_id: doc.doc_id,
      file_name: doc.file_name,
      url: `${RST_STORAGE_CLOUDFRONT_URL}/documents/${result.rec_resource_id}/${doc.doc_id}/${doc.file_name}.${doc.extension}`,
      doc_code: doc.doc_code as RecreationResourceDocCode,
      doc_code_description: doc.recreation_resource_doc_code.description,
      extension: doc.extension,
    })),
    spatial_feature_geometry: spatialFeatures?.spatial_feature_geometry,
    site_point_geometry: spatialFeatures?.site_point_geometry,
    recreation_district: recreationDistrict,
    recreation_resource_reservation_info:
      result.recreation_resource_reservation_info,
    advisories: result.act_advisories_flat?.map((advisory) => advisory),
  };
};
