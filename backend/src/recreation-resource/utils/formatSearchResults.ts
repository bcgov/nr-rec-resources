import {
  BaseRecreationResourceDto,
  RecreationActivityDto,
  RecreationStatusDto,
  RecreationStructureDto,
} from "src/recreation-resource/dto/recreation-resource.dto";
import { RecreationResourceImageDto } from "src/recreation-resource/dto/recreation-resource-image.dto";

// can this be generated with refactor to typed sql?
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

export const formatSearchResults = (
  recResources: RecreationResourceSearchView[],
): BaseRecreationResourceDto[] => {
  return recResources?.map((resource) => {
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
        description: resource.recreation_status?.description,
        comment: resource.recreation_status?.comment,
        status_code: resource.recreation_status?.status_code,
      },
      recreation_resource_images: resource.recreation_resource_images ?? [],
    };
  });
};
