import {
  RecreationResourceDto,
  RecreationResourceImageVariantDtoSizeCodeEnum,
} from '@/service/recreation-resource';

/**
 * Extracts image URLs of size-code (llc) from a recreation resource
 *
 * @param {RecreationResourceDto} recreationResource - Resource containing image data
 * @returns {Array<{imageUrl: string}>} Array of image URL objects
 */
export const getImageList = (
  recreationResource: RecreationResourceDto,
): Array<{ imageUrl: string }> => {
  const sizeCodeForCard = RecreationResourceImageVariantDtoSizeCodeEnum.Llc;

  return recreationResource.recreation_resource_images.flatMap(
    ({ recreation_resource_image_variants }) =>
      recreation_resource_image_variants
        .filter(({ size_code }) => size_code === sizeCodeForCard)
        .map(({ url }) => ({ imageUrl: url })),
  );
};
