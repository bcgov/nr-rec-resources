import {
  BaseRecreationResourceDto,
  RecreationActivityDto,
  RecreationStatusDto,
  RecreationStructureDto,
} from 'src/recreation-resource/dto/recreation-resource.dto';
import { RecreationResourceImageDto } from 'src/recreation-resource/dto/recreation-resource-image.dto';
import { OPEN_STATUS } from 'src/recreation-resource/constants/service.constants';
import { formatImageUrls } from './formatImageUrls';
import { IMAGE_SIZE_CODE_FOR_SEARCH_RESULTS_CARD } from '@shared/constants/images';

export type RecreationResourceSearchView = {
  rec_resource_id: string;
  name: string;
  closest_community: string | null;
  display_on_public_site: boolean;
  recreation_resource_type: string | null;
  recreation_resource_type_code: string | null;
  recreation_activity: RecreationActivityDto[];
  recreation_status: RecreationStatusDto;
  recreation_resource_images: RecreationResourceImageDto[];
  district_code: string | null;
  district_description: string | null;
  access_code: string | null;
  access_description: string | null;
  recreation_structure: RecreationStructureDto[];
  has_toilets: boolean;
  has_tables: boolean;
};

// Format search results to match the BaseRecreationResourceDto
export const formatSearchResults = (
  recResources: RecreationResourceSearchView[],
  rstStorageCloudfrontUrl: string = '',
): BaseRecreationResourceDto[] => {
  return recResources?.map((resource) => {
    const recreation_resource_images: RecreationResourceImageDto[] =
      formatImageUrls({
        images: resource.recreation_resource_images ?? [],
        recResourceId: resource.rec_resource_id,
        baseUrl: rstStorageCloudfrontUrl,
        imageSizeCodes: [IMAGE_SIZE_CODE_FOR_SEARCH_RESULTS_CARD],
      });

    return {
      rec_resource_id: resource.rec_resource_id,
      name: resource.name,
      closest_community: resource?.closest_community,
      rec_resource_type: resource?.recreation_resource_type,
      recreation_activity:
        resource.recreation_activity?.map((activity) => ({
          description: activity.description,
          recreation_activity_code: activity.recreation_activity_code,
        })) ?? [],
      recreation_status: {
        description:
          resource.recreation_status?.description ?? OPEN_STATUS.DESCRIPTION,
        comment: resource.recreation_status?.comment,
        status_code:
          resource.recreation_status?.status_code ?? OPEN_STATUS.STATUS_CODE,
      },
      recreation_resource_images,
    };
  });
};
