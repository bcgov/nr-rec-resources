import {
  RecreationResourceDto,
  RecreationResourceImageDto,
} from '@/service/recreation-resource';

/**
 * Gets the base URL for asset storage.
 * @returns {string} The configured assets URL or default test environment URL.
 */
export const getBasePathForAssets = (): string =>
  import.meta.env.VITE_RECREATION_RESOURCE_ASSETS_BASE_URL ||
  'https://dam.lqc63d-test.nimbus.cloud.gov.bc.ca';

/**
 * Transforms recreation resource data by updating image URLs with full asset paths.
 * @param {RecreationResourceDto} resource - The recreation resource to transform
 * @returns {RecreationResourceDto} Transformed resource with complete image URLs
 */
export const transformRecreationResource = (
  resource: RecreationResourceDto,
): RecreationResourceDto => {
  const basePath = getBasePathForAssets();
  return {
    ...resource,
    recreation_resource_images: resource.recreation_resource_images.map(
      (recreationResourceImageDto: RecreationResourceImageDto) => ({
        ...recreationResourceImageDto,
        recreation_resource_image_variants:
          recreationResourceImageDto.recreation_resource_image_variants.map(
            (variant) => ({
              ...variant,
              url: `${basePath}${variant.url}`,
            }),
          ),
      }),
    ),
  };
};
