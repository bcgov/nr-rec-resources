import { BaseRecreationResourceDto } from "src/recreation-resource/dto/recreation-resource.dto";
import { RecreationResourceImageDto } from "src/recreation-resource/dto/recreation-resource-image.dto";
import { SearchRecreationResourceGetPayload } from "src/recreation-resource/service/types";

export const formatSearchResults = (
  recResources: SearchRecreationResourceGetPayload[],
): BaseRecreationResourceDto[] => {
  return recResources?.map((resource) => ({
    ...resource,
    rec_resource_type:
      resource?.recreation_resource_type.recreation_resource_type_code
        .description,
    recreation_activity: resource.recreation_activity?.map((activity) => ({
      description: activity.recreation_activity.description,
      recreation_activity_code:
        activity.recreation_activity.recreation_activity_code,
    })),
    recreation_status: {
      description:
        resource.recreation_status?.recreation_status_code.description,
      comment: resource.recreation_status?.comment,
      status_code: resource.recreation_status?.status_code,
    },
    recreation_resource_images:
      resource.recreation_resource_images as RecreationResourceImageDto[],
  }));
};
