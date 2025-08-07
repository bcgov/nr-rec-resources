import {
  RecreationResourceDocDto,
  RecreationResourceImageDto,
} from "@/services/recreation-resource-admin";

/**
 * Gets the base URL for asset storage.
 * @returns {string} The configured assets URL or default prod environment URL.
 */
export const getBasePathForAssets = (): string =>
  import.meta.env.VITE_RECREATION_RESOURCE_ASSETS_BASE_URL ||
  "https://dam.lqc63d-test.nimbus.cloud.gov.bc.ca";

/**
 * Transforms recreation resource data by updating image URLs with full asset paths.
 * @param {RecreationResourceDto} resource - The recreation resource to transform
 * @returns {RecreationResourceDto} Transformed resource with complete image URLs
 */
export const transformRecreationResourceDocs = (
  docs: RecreationResourceDocDto[],
): RecreationResourceDocDto[] => {
  const basePath = getBasePathForAssets();
  return docs.map((doc) => ({
    ...doc,
    url: `${basePath}/${doc.url}`,
  }));
};

/**
 * Transforms recreation resource images by updating image URLs with full asset paths.
 * @param docs - The recreation resource images to transform
 * @returns Transformed images with complete URLs
 */
export const transformRecreationResourceImages = (
  docs: RecreationResourceImageDto[],
): RecreationResourceImageDto[] => {
  const basePath = getBasePathForAssets();
  return docs.map((doc) => ({
    ...doc,
    recreation_resource_image_variants:
      doc.recreation_resource_image_variants?.map((v) => ({
        ...v,
        url: `${basePath}/${v.url}`,
      })),
  }));
};

/**
 * Returns a retry handler function for React Query hooks.
 * @param options Optional config: maxRetries, onFail callback
 * @returns (retryCount, error) => boolean
 */
export function createRetryHandler({
  maxRetries = 2,
  onFail,
}: {
  maxRetries?: number;
  onFail?: (error: unknown) => void;
} = {}) {
  return (retryCount: number, error: unknown) => {
    if (retryCount >= maxRetries) {
      if (onFail) onFail(error);
      return false;
    }
    const status =
      (error &&
        typeof error === "object" &&
        "response" in error &&
        (error as any).response?.status) ||
      undefined;
    return typeof status === "number" && status >= 500 && status < 600;
  };
}
