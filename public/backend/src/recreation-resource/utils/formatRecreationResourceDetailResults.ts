import {
  RecreationResourceDetailDto,
  RecreationResourceMaintenanceStandardCode,
} from 'src/recreation-resource/dto/recreation-resource.dto';
import { RecreationResourceImageDto } from 'src/recreation-resource/dto/recreation-resource-image.dto';
import { RecreationResourceGetPayload } from 'src/recreation-resource/service/types';
import { getRecreationResourceSpatialFeatureGeometry } from '@prisma-generated-sql';
import { RecreationResourceDocCode } from 'src/recreation-resource/dto/recreation-resource-doc.dto';
import { OPEN_STATUS } from 'src/recreation-resource/constants/service.constants';
import { RecreationResourceGeometry } from '../dto/recreation-resource-geometry.dto';

// Format recreation resource detail results to match the RecreationResourceDetailDto
export const formatRecreationResourceDetailResults = (
  { recreation_district_code, ...result }: RecreationResourceGetPayload,
  recreationResourceSpatialFeatureGeometryResult:
    | getRecreationResourceSpatialFeatureGeometry.Result[]
    | RecreationResourceGeometry,
): RecreationResourceDetailDto => {
  const spatialFeatures = Array.isArray(
    recreationResourceSpatialFeatureGeometryResult,
  )
    ? recreationResourceSpatialFeatureGeometryResult[0]
    : recreationResourceSpatialFeatureGeometryResult;
  const recreationDistrict = recreation_district_code
    ? {
        description: recreation_district_code.description,
        district_code: recreation_district_code.district_code,
      }
    : undefined;

  return {
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
    recreation_activity: result.recreation_activity?.map((activity) => ({
      description: activity.recreation_activity.description,
      recreation_activity_code:
        activity.recreation_activity.recreation_activity_code,
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
    recreation_resource_images:
      result.recreation_resource_images as RecreationResourceImageDto[],
    recreation_fee: result.recreation_fee
      ? result.recreation_fee
          ?.filter((fee) => fee.recreation_fee_code === 'C')
          .map((fee) => ({
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
            fee_description: fee.with_description?.description,
          }))
      : [],
    recreation_structure: {
      has_toilet: result.recreation_structure?.some((s) =>
        s.recreation_structure_code.description
          .toLowerCase()
          .includes('toilet'),
      )
        ? true
        : false,
      has_table: result.recreation_structure?.some((s) =>
        s.recreation_structure_code.description.toLowerCase().includes('table'),
      )
        ? true
        : false,
    },
    additional_fees: result.recreation_fee
      ?.filter((fee) => fee.recreation_fee_code !== 'C')
      .map((fee) => ({
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
      })),
    recreation_resource_docs: result.recreation_resource_docs.map((i) => ({
      ...i,
      doc_code: i.doc_code as RecreationResourceDocCode,
      doc_code_description: i.recreation_resource_doc_code.description,
    })),
    spatial_feature_geometry: spatialFeatures?.spatial_feature_geometry,
    site_point_geometry: spatialFeatures?.site_point_geometry,
    recreation_district: recreationDistrict,
    recreation_resource_reservation_info:
      result.recreation_resource_reservation_info,
  };
};
