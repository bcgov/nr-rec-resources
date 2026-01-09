import { RecreationResourceSearchModel } from '@/service/custom-models';
import { RecreationResourceImageDto } from '@/service/recreation-resource';

/**
 * Extracts image URLs from a recreation resource
 * Backend now returns url object with full variant URLs
 *
 * @param {RecreationResourceSearchModel} recreationResource - Resource containing image data
 * @returns {Array<{imageUrl: string}>} Array of image URL objects
 */
export const getImageList = (
  recreationResource: RecreationResourceSearchModel,
): Array<{ imageUrl: string }> => {
  return (
    recreationResource.recreation_resource_images
      ?.map((img: RecreationResourceImageDto) => ({
        imageUrl: img.url?.thm ?? img.url?.pre ?? img.url?.original ?? '',
      }))
      .filter((img) => img.imageUrl !== '') ?? []
  );
};
