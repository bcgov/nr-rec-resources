import { BaseRecreationResourceDto } from "src/recreation-resource/dto/recreation-resource.dto";
import { RecreationResourceImageDto } from "src/recreation-resource/dto/recreation-resource-image.dto";

export const formatSearchResults = (
  recResources: any[], // TODO: was SearchRecreationResourceGetPayload, need type
): BaseRecreationResourceDto[] => {
  return recResources?.map((resource) => {
    return {
      ...resource,
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
      recreation_resource_images:
        (resource.recreation_resource_images as RecreationResourceImageDto[]) ??
        [],
    };
  });
};
