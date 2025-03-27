import { RecreationResourceSearchModel } from '@/service/custom-models';
import { IMAGE_SIZE_CODE_FOR_SEARCH_RESULTS_CARD } from '@/components/rec-resource/card/constants';

/**
 * Extracts image URLs from a recreation resource
 *
 * @param {RecreationResourceSearchModel} recreationResource - Resource containing image data
 * @returns {Array<{imageUrl: string}>} Array of image URL objects
 */
export const getImageList = (
  recreationResource: RecreationResourceSearchModel,
): Array<{ imageUrl: string }> => {
  return (
    recreationResource.recreation_resource_images?.flatMap(
      ({ recreation_resource_image_variants }) =>
        recreation_resource_image_variants
          ?.filter(
            ({ size_code }) =>
              size_code === IMAGE_SIZE_CODE_FOR_SEARCH_RESULTS_CARD,
          )
          .map(({ url }) => ({ imageUrl: url })) || [],
    ) || []
  );
};
